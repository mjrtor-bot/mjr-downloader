import { spawn } from 'node:child_process';
import * as fs from 'node:fs';
import * as path from 'node:path';
import type { Readable } from 'node:stream';
import type { MediaFormat, MediaInfo, ProviderStatus } from '@/types/media';
import type { DownloadStreamResult, IMediaProvider } from '../types';

interface YtDlpRunner {
  cmd: string;
  prefixArgs: string[];
}

interface YtDlpRawFormat {
  format_id?: string;
  ext?: string;
  resolution?: string;
  width?: number;
  height?: number;
  fps?: number;
  filesize?: number;
  filesize_approx?: number;
  tbr?: number;
  abr?: number;
  vbr?: number;
  acodec?: string;
  vcodec?: string;
  format_note?: string;
  container?: string;
  protocol?: string;
  url?: string;
}

interface YtDlpRawMetadata {
  id?: string;
  title?: string;
  thumbnail?: string;
  thumbnails?: Array<{ url: string; width?: number; height?: number }>;
  duration?: number;
  extractor_key?: string;
  extractor?: string;
  webpage_url?: string;
  uploader?: string;
  channel?: string;
  description?: string;
  formats?: YtDlpRawFormat[];
}

/**
 * Utilitário para formatar bytes em texto legível
 */
function formatBytes(bytes?: number | null): string {
  if (!bytes || bytes <= 0 || Number.isNaN(bytes)) {
    return 'Tamanho estimado';
  }
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
}

/**
 * Utilitário para formatar segundos em duração (HH:MM:SS ou MM:SS)
 */
function formatDuration(seconds?: number | null): string {
  if (!seconds || seconds <= 0 || Number.isNaN(seconds)) {
    return '00:00';
  }
  const total = Math.floor(seconds);
  const hrs = Math.floor(total / 3600);
  const mins = Math.floor((total % 3600) / 60);
  const secs = total % 60;

  if (hrs > 0) {
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }
  return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

/**
 * Sanitiza o nome do arquivo para o cabeçalho Content-Disposition
 */
function sanitizeFilename(name: string, ext: string): string {
  const safeName = name
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 100);

  const cleanExt = ext.replace(/^\./, '').trim().toLowerCase() || 'mp4';
  return `${safeName || 'midia'}.${cleanExt}`;
}

/**
 * Retorna o Content-Type apropriado de acordo com a extensão
 */
function getMimeType(ext: string): string {
  const map: Record<string, string> = {
    mp4: 'video/mp4',
    webm: 'video/webm',
    mkv: 'video/x-matroska',
    mp3: 'audio/mpeg',
    m4a: 'audio/mp4',
    aac: 'audio/aac',
    ogg: 'audio/ogg',
    opus: 'audio/opus',
    wav: 'audio/wav',
    flac: 'audio/flac',
  };
  return map[ext.toLowerCase()] || 'application/octet-stream';
}

/**
 * Provedor Local que utiliza yt-dlp e FFmpeg instalados no ambiente
 */
export class LocalYtDlpProvider implements IMediaProvider {
  public readonly name = 'Provedor Local (yt-dlp + FFmpeg)';
  public readonly engine = 'local-ytdlp';

  private cachedRunner: YtDlpRunner | null = null;
  private cachedFfmpegPath: string | null = null;
  private cachedVersion: string | null = null;

  /**
   * Encontra como executar o yt-dlp no sistema operacional de forma compatível e segura
   */
  private async resolveRunner(): Promise<YtDlpRunner> {
    if (this.cachedRunner) {
      return this.cachedRunner;
    }

    const customPath = process.env.YTDLP_PATH;
    const candidates: YtDlpRunner[] = [];

    if (customPath) {
      candidates.push({ cmd: customPath, prefixArgs: [] });
    }

    // Candidatos padrão por ordem de prioridade
    candidates.push(
      { cmd: 'yt-dlp', prefixArgs: [] },
      { cmd: '/usr/local/bin/yt-dlp', prefixArgs: [] },
      { cmd: '/usr/bin/yt-dlp', prefixArgs: [] },
      { cmd: 'py', prefixArgs: ['-m', 'yt_dlp'] },
      { cmd: 'python', prefixArgs: ['-m', 'yt_dlp'] },
      { cmd: 'python3', prefixArgs: ['-m', 'yt_dlp'] },
      // Caminho comum Windows do Python pip scripts
      {
        cmd: `${process.env.LOCALAPPDATA || ''}\\Python\\pythoncore-3.14-64\\Scripts\\yt-dlp.exe`,
        prefixArgs: [],
      }
    );

    for (const candidate of candidates) {
      if (!candidate.cmd) continue;
      try {
        const version = await this.testExecutable(candidate.cmd, [...candidate.prefixArgs, '--version']);
        if (version) {
          this.cachedRunner = candidate;
          this.cachedVersion = version.trim();
          return candidate;
        }
      } catch {
        // Tentar próximo candidato
      }
    }

    throw new Error(
      'Nenhum executável funcional do yt-dlp foi encontrado no servidor. Instale o yt-dlp ou configure YTDLP_PATH no .env.'
    );
  }

  /**
   * Encontra o caminho ou comando do FFmpeg
   */
  private async resolveFfmpeg(): Promise<string | null> {
    if (this.cachedFfmpegPath) return this.cachedFfmpegPath;

    const custom = process.env.FFMPEG_PATH;
    const localAppData = process.env.LOCALAPPDATA || '';
    const userProfile = process.env.USERPROFILE || '';

    const candidates: string[] = [
      custom,
      'ffmpeg',
      '/usr/bin/ffmpeg',
      '/usr/local/bin/ffmpeg',
      path.join(localAppData, 'Microsoft', 'WinGet', 'Links', 'ffmpeg.exe'),
      path.join(userProfile, 'scoop', 'shims', 'ffmpeg.exe'),
      'C:\\ProgramData\\chocolatey\\bin\\ffmpeg.exe',
      'C:\\ffmpeg\\bin\\ffmpeg.exe',
      'C:\\Program Files\\ffmpeg\\bin\\ffmpeg.exe',
    ].filter(Boolean) as string[];

    // Tentar localizar em pacotes WinGet dinamicamente
    try {
      const wingetDir = path.join(localAppData, 'Microsoft', 'WinGet', 'Packages');
      if (fs.existsSync(wingetDir)) {
        const dirs = fs.readdirSync(wingetDir);
        for (const dir of dirs) {
          if (dir.toLowerCase().includes('ffmpeg')) {
            const fullDir = path.join(wingetDir, dir);
            const subdirs = fs.readdirSync(fullDir);
            for (const sub of subdirs) {
              const binFfmpeg = path.join(fullDir, sub, 'bin', 'ffmpeg.exe');
              if (fs.existsSync(binFfmpeg)) {
                candidates.push(binFfmpeg);
              }
            }
          }
        }
      }
    } catch {
      // Ignorar erros de leitura de diretório
    }

    for (const cmd of candidates) {
      try {
        const ver = await this.testExecutable(cmd, ['-version']);
        if (ver) {
          this.cachedFfmpegPath = cmd;
          return cmd;
        }
      } catch {
        // Tentar próximo
      }
    }
    return null;
  }

  /**
   * Executa um teste rápido de versão
   */
  private testExecutable(cmd: string, args: string[]): Promise<string> {
    return new Promise((resolve, reject) => {
      try {
        const proc = spawn(cmd, args, {
          shell: false,
          windowsHide: true,
          timeout: 5000,
        });

        let output = '';
        proc.stdout.on('data', (data) => {
          output += data.toString();
        });

        proc.on('error', reject);
        proc.on('close', (code) => {
          if (code === 0 && output.trim().length > 0) {
            resolve(output.trim());
          } else {
            reject(new Error(`Exit code ${code}`));
          }
        });
      } catch (err) {
        reject(err);
      }
    });
  }

  /**
   * Verifica se o motor local está operacional
   */
  public async isAvailable(): Promise<ProviderStatus> {
    try {
      const runner = await this.resolveRunner();
      const ffmpeg = await this.resolveFfmpeg();

      return {
        available: true,
        provider: this.name,
        engine: this.engine,
        version: this.cachedVersion || 'Detectado',
        ffmpegAvailable: Boolean(ffmpeg),
        ffmpegVersion: ffmpeg ? 'FFmpeg Ativo' : 'Não encontrado',
        details: `yt-dlp pronto (${runner.cmd} ${runner.prefixArgs.join(' ')})`,
      };
    } catch (err) {
      return {
        available: false,
        provider: this.name,
        engine: this.engine,
        ffmpegAvailable: false,
        details: err instanceof Error ? err.message : 'Falha ao inicializar o motor yt-dlp local.',
      };
    }
  }

  /**
   * Analisa a mídia e retorna metadados e formatos reais
   */
  public async analyze(url: string): Promise<MediaInfo> {
    const runner = await this.resolveRunner();

    // Argumentos seguros passados como array
    const args = [
      ...runner.prefixArgs,
      '--dump-single-json',
      '--no-playlist',
      '--skip-download',
      '--no-warnings',
      '--geo-bypass',
      '--socket-timeout',
      '20',
      '--max-filesize',
      '500M',
      '--extractor-args',
      'youtube:player_client=android,web,web_safari,tv',
      '--',
      url,
    ];

    const stdout = await new Promise<string>((resolve, reject) => {
      const proc = spawn(runner.cmd, args, {
        shell: false,
        windowsHide: true,
      });

      let outBuffer = '';
      let errBuffer = '';

      proc.stdout.on('data', (chunk) => {
        outBuffer += chunk.toString();
      });

      proc.stderr.on('data', (chunk) => {
        errBuffer += chunk.toString();
      });

      const timer = setTimeout(() => {
        try {
          proc.kill('SIGTERM');
        } catch {
          // Ignore
        }
        reject(new Error('Tempo limite de análise da mídia excedido (timeout 35s).'));
      }, 35000);

      proc.on('error', (err) => {
        clearTimeout(timer);
        reject(err);
      });

      proc.on('close', (code) => {
        clearTimeout(timer);
        if (code === 0) {
          resolve(outBuffer);
        } else {
          // Tratar mensagens de erro comuns e informativas
          const lowerErr = errBuffer.toLowerCase();
          if (lowerErr.includes('private video') || lowerErr.includes('sign in')) {
            reject(new Error('Esta mídia é privada, requer login ou possui restrições de acesso.'));
          } else if (lowerErr.includes('drm') || lowerErr.includes('protected')) {
            reject(new Error('Esta mídia possui proteção DRM e não pode ser processada.'));
          } else if (lowerErr.includes('not found') || lowerErr.includes('404')) {
            reject(new Error('A mídia não foi encontrada na plataforma informada.'));
          } else {
            reject(new Error(errBuffer.trim() || `Falha na extração dos metadados (código ${code}).`));
          }
        }
      });
    });

    let raw: YtDlpRawMetadata;
    try {
      raw = JSON.parse(stdout);
    } catch {
      throw new Error('Falha ao processar a resposta dos metadados da mídia.');
    }

    // Processar e organizar formatos
    const formats = this.processFormats(raw.formats || [], url, raw.title || 'midia');

    const duration = raw.duration || 0;
    const thumbnail =
      raw.thumbnail ||
      (raw.thumbnails && raw.thumbnails.length > 0 ? raw.thumbnails[raw.thumbnails.length - 1].url : '') ||
      '';

    return {
      id: raw.id || 'unknown',
      title: raw.title || 'Mídia sem título',
      thumbnail,
      duration,
      durationFormatted: formatDuration(duration),
      platform: raw.extractor_key || raw.extractor || 'Plataforma Web',
      originalUrl: raw.webpage_url || url,
      uploader: raw.uploader || raw.channel || 'Desconhecido',
      description: raw.description ? raw.description.slice(0, 300) : undefined,
      formats,
      analyzedAt: new Date().toISOString(),
    };
  }

  /**
   * Filtra, categoriza e constrói a lista limpa de opções de download para o usuário
   */
  private processFormats(rawFormats: YtDlpRawFormat[], mediaUrl: string, title: string): MediaFormat[] {
    const list: MediaFormat[] = [];
    const seenCombos = new Set<string>();

    const safeTitleParam = encodeURIComponent(title.slice(0, 80));
    const safeUrlParam = encodeURIComponent(mediaUrl);

    // 1. Adicionar presets inteligentes e recomendados (Video + Audio)
    const videoPresets = [
      {
        id: 'best_1080p',
        formatSelector: 'bestvideo[ext=mp4][vcodec^=avc1][height<=1080]+bestaudio[ext=m4a]/bestvideo[height<=1080]+bestaudio/best[height<=1080]/best',
        qualityLabel: 'Full HD 1080p (Alta Qualidade)',
        resolution: '1080p',
        extension: 'mp4',
        hasVideo: true,
        hasAudio: true,
        isRecommended: true,
        note: 'Vídeo H.264 + Áudio AAC em MP4 universal',
      },
      {
        id: 'best_720p',
        formatSelector: 'bestvideo[ext=mp4][vcodec^=avc1][height<=720]+bestaudio[ext=m4a]/bestvideo[height<=720]+bestaudio/best[height<=720]/best',
        qualityLabel: 'HD 720p (Padrão)',
        resolution: '720p',
        extension: 'mp4',
        hasVideo: true,
        hasAudio: true,
        isRecommended: false,
        note: 'Excelente equilíbrio entre qualidade e tamanho',
      },
      {
        id: 'best_480p',
        formatSelector: 'bestvideo[ext=mp4][vcodec^=avc1][height<=480]+bestaudio[ext=m4a]/bestvideo[height<=480]+bestaudio/best[height<=480]/best',
        qualityLabel: 'SD 480p (Econômico)',
        resolution: '480p',
        extension: 'mp4',
        hasVideo: true,
        hasAudio: true,
        isRecommended: false,
        note: 'Arquivo mais leve para conexões móveis',
      },
      {
        id: 'best_360p',
        formatSelector: 'bestvideo[ext=mp4][vcodec^=avc1][height<=360]+bestaudio[ext=m4a]/bestvideo[height<=360]+bestaudio/best[height<=360]/best',
        qualityLabel: '360p (Mínimo)',
        resolution: '360p',
        extension: 'mp4',
        hasVideo: true,
        hasAudio: true,
        isRecommended: false,
        note: 'Menor consumo de dados',
      },
    ];

    // Verificar se existe alguma faixa de vídeo nos formatos brutos
    const hasAnyVideo =
      rawFormats.length > 0
        ? rawFormats.some((f) => (f.vcodec && f.vcodec !== 'none') || (f.height && f.height > 0))
        : true;

    // Verificar quais alturas realmente existem nos formatos brutos
    const availableHeights = new Set<number>();
    for (const f of rawFormats) {
      if (f.height && f.height > 0) {
        availableHeights.add(f.height);
      }
    }

    // 1. Adicionar presets inteligentes e recomendados (Video + Audio) somente se a mídia tiver vídeo
    if (hasAnyVideo) {
      for (const preset of videoPresets) {
        // Se conhecemos as alturas disponíveis e nenhuma atinge o patamar, podemos ajustar ou incluir
        const targetHeight = Number.parseInt(preset.resolution, 10);
        const isAvailable = availableHeights.size === 0 || Array.from(availableHeights).some((h) => h >= targetHeight);

        if (isAvailable || targetHeight <= 720) {
          list.push({
            id: preset.id,
            formatId: preset.formatSelector,
            extension: preset.extension,
            resolution: preset.resolution,
            height: targetHeight,
            filesize: null,
            filesizeFormatted: 'Processado no download',
            hasVideo: true,
            hasAudio: true,
            qualityLabel: preset.qualityLabel,
            note: preset.note,
            isRecommended: preset.isRecommended,
            downloadUrl: `/api/download?url=${safeUrlParam}&format=${encodeURIComponent(preset.formatSelector)}&ext=${preset.extension}&title=${safeTitleParam}`,
          });
        }
      }
    }

    // 2. Presets de Áudio Extraído
    const audioPresets = [
      {
        id: 'audio_mp3_best',
        formatSelector: 'bestaudio/best',
        qualityLabel: 'Áudio MP3 (Melhor Qualidade)',
        resolution: 'Áudio',
        extension: 'mp3',
        hasVideo: false,
        hasAudio: true,
        note: 'Conversão em áudio MP3 de alta fidelidade',
        isRecommended: !hasAnyVideo,
      },
      {
        id: 'audio_m4a_best',
        formatSelector: 'bestaudio[ext=m4a]/bestaudio/best',
        qualityLabel: 'Áudio M4A / AAC (Original)',
        resolution: 'Áudio',
        extension: 'm4a',
        hasVideo: false,
        hasAudio: true,
        note: 'Faixa original do áudio sem recodificação',
        isRecommended: false,
      },
    ];

    for (const audio of audioPresets) {
      list.push({
        id: audio.id,
        formatId: audio.formatSelector,
        extension: audio.extension,
        resolution: audio.resolution,
        filesize: null,
        filesizeFormatted: 'Processado no download',
        hasVideo: false,
        hasAudio: true,
        qualityLabel: audio.qualityLabel,
        note: audio.note,
        downloadUrl: `/api/download?url=${safeUrlParam}&format=${encodeURIComponent(audio.formatSelector)}&ext=${audio.extension}&title=${safeTitleParam}`,
      });
    }

    // 3. Formatos diretos específicos detectados no rawFormats (quando disponíveis de forma limpa)
    for (const f of rawFormats) {
      if (!f.format_id || !f.ext) continue;

      const hasV = f.vcodec && f.vcodec !== 'none';
      const hasA = f.acodec && f.acodec !== 'none';

      // Ignorar formatos sem protocolo padrão ou que exigem fluxos fragmentados incompatíveis
      if (f.protocol && (f.protocol.includes('mhtml') || f.protocol.includes('dummy'))) continue;

      const resLabel = f.height ? `${f.height}p` : f.resolution || (hasV ? 'Vídeo' : 'Áudio');
      const comboKey = `${f.ext}-${resLabel}-${hasV}-${hasA}`;

      if (seenCombos.has(comboKey)) continue;
      seenCombos.add(comboKey);

      const calculatedSize = f.filesize || f.filesize_approx || null;

      // Adicionar formatos diretos mais úteis
      if (hasV && hasA) {
        list.push({
          id: `direct_${f.format_id}`,
          formatId: f.format_id,
          extension: f.ext,
          resolution: resLabel,
          height: f.height,
          width: f.width,
          fps: f.fps,
          filesize: calculatedSize,
          filesizeFormatted: formatBytes(calculatedSize),
          hasVideo: true,
          hasAudio: true,
          vcodec: f.vcodec,
          acodec: f.acodec,
          qualityLabel: `Vídeo Direto ${resLabel} (${f.ext.toUpperCase()})`,
          note: f.format_note || 'Arquivo direto com áudio embutido',
          downloadUrl: `/api/download?url=${safeUrlParam}&format=${encodeURIComponent(f.format_id)}&ext=${f.ext}&title=${safeTitleParam}`,
        });
      }
    }

    return list;
  }

  /**
   * Obtém a stream de download direta para entrega ao cliente
   */
  public async getDownloadStream(
    url: string,
    formatId: string,
    customExtension: string = 'mp4'
  ): Promise<DownloadStreamResult> {
    const runner = await this.resolveRunner();
    const ffmpegPath = await this.resolveFfmpeg();

    // Sanitizar formato para evitar caracteres perigosos
    const sanitizedFormat = formatId.replace(/[^a-zA-Z0-9_+/=.[\]<>-]/g, '') || 'best';
    const cleanExt = customExtension.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'mp4';

    const args = [
      ...runner.prefixArgs,
      '--no-playlist',
      '--no-warnings',
      '--geo-bypass',
      '-f',
      sanitizedFormat,
      '--socket-timeout',
      '30',
      '--max-filesize',
      String(Number(process.env.MAX_DOWNLOAD_SIZE_BYTES) || 524288000),
      '--extractor-args',
      'youtube:player_client=android,web,web_safari,tv',
    ];

    if (ffmpegPath && ffmpegPath !== 'ffmpeg') {
      args.push('--ffmpeg-location', path.dirname(ffmpegPath));
    }

    // Configuração de saída e transcodificação para streaming seguro
    if (cleanExt === 'mp3') {
      args.push('-x', '--audio-format', 'mp3', '--audio-quality', '0');
      args.push('--downloader-args', 'ffmpeg:-f mp3 -c:a libmp3lame -b:a 192k');
    } else if (cleanExt === 'mp4' || cleanExt === 'm4a') {
      // Fragmented MP4 permite streaming sem corromper o moov atom em stdout
      args.push('--downloader-args', 'ffmpeg:-f mp4 -movflags frag_keyframe+empty_moov+default_base_moof');
    } else if (cleanExt === 'webm') {
      args.push('--downloader-args', 'ffmpeg:-f webm');
    }

    // Enviar para stdout
    args.push('-o', '-', '--', url);

    const child = spawn(runner.cmd, args, {
      shell: false,
      windowsHide: true,
    });

    const stream = child.stdout as Readable;
    const filename = sanitizeFilename('mjr_download', cleanExt);
    const contentType = getMimeType(cleanExt);

    // Garantir encerramento limpo do processo filho caso a stream seja interrompida
    const cleanupProcess = () => {
      if (child.exitCode === null && !child.killed) {
        try {
          child.kill('SIGTERM');
        } catch {
          // Ignorar erros se o processo já estiver finalizado
        }
      }
    };

    stream.on('close', cleanupProcess);
    stream.on('error', cleanupProcess);
    child.on('error', () => {
      stream.destroy();
    });

    return {
      stream,
      filename,
      contentType,
    };
  }
}

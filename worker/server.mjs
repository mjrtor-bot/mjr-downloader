import express from 'express';
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json({ limit: '32kb' }));

const PORT = Number(process.env.PORT) || 10000;
const KEY = process.env.WORKER_API_KEY || '';

function resolveBinary(name, envVar) {
  if (envVar && fs.existsSync(envVar)) return envVar;
  const candidates = [
    path.join(__dirname, 'bin', name),
    path.join(__dirname, '..', 'bin', name),
    `/usr/local/bin/${name}`,
    `/usr/bin/${name}`,
    name,
  ];
  for (const cand of candidates) {
    if (cand !== name && fs.existsSync(cand)) {
      return cand;
    }
  }
  return name;
}

const getYtDlpCmd = () => resolveBinary('yt-dlp', process.env.YTDLP_PATH);
const getFfmpegCmd = () => resolveBinary('ffmpeg', process.env.FFMPEG_PATH);

const auth = (req, res, next) => {
  if (KEY && req.get('authorization') !== `Bearer ${KEY}`) {
    return res.status(401).json({ error: 'unauthorized' });
  }
  return next();
};

const run = (args, timeout = 35000) => {
  return new Promise((resolve, reject) => {
    const bin = getYtDlpCmd();
    const proc = spawn(bin, args, { shell: false });
    let stdout = '';
    let stderr = '';

    proc.stdout.on('data', (d) => {
      stdout += d;
    });
    proc.stderr.on('data', (d) => {
      stderr += d;
    });

    const timer = setTimeout(() => {
      proc.kill();
      reject(new Error('timeout'));
    }, timeout);

    proc.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });

    proc.on('close', (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        reject(new Error(stderr || 'failed'));
      } else {
        resolve(stdout);
      }
    });
  });
};

app.get('/health', async (req, res) => {
  try {
    const version = (await run(['--version'], 5000)).trim();
    res.json({ ok: true, version, ffmpeg: true, engine: 'worker-service' });
  } catch (err) {
    res.status(503).json({ ok: false, error: err instanceof Error ? err.message : 'unhealthy' });
  }
});

app.post('/api/analyze', auth, async (req, res) => {
  try {
    const url = String(req.body?.url || '');
    if (!/^https?:\/\//i.test(url)) {
      return res.status(400).json({ error: 'invalid url' });
    }
    const raw = await run(['--dump-single-json', '--no-playlist', '--skip-download', '--no-warnings', '--geo-bypass', '--extractor-args', 'youtube:player_client=android,web,web_safari,tv', '--', url]);
    const r = JSON.parse(raw);
    const rawFormats = r.formats || [];

    const hasAnyVideo =
      rawFormats.length > 0
        ? rawFormats.some((f) => (f.vcodec && f.vcodec !== 'none') || (f.height && f.height > 0))
        : true;

    const formats = [];

    if (hasAnyVideo) {
      formats.push(
        {
          id: 'best_1080p',
          formatId: 'bestvideo[ext=mp4][vcodec^=avc1][height<=1080]+bestaudio[ext=m4a]/bestvideo[height<=1080]+bestaudio/best[height<=1080]/best',
          extension: 'mp4',
          resolution: '1080p',
          filesize: null,
          filesizeFormatted: 'Processado no download',
          hasVideo: true,
          hasAudio: true,
          qualityLabel: 'Full HD 1080p (Alta Qualidade)',
          isRecommended: true,
          note: 'Vídeo H.264 + Áudio AAC em MP4 universal',
          downloadUrl: '',
        },
        {
          id: 'best_720p',
          formatId: 'bestvideo[ext=mp4][vcodec^=avc1][height<=720]+bestaudio[ext=m4a]/bestvideo[height<=720]+bestaudio/best[height<=720]/best',
          extension: 'mp4',
          resolution: '720p',
          filesize: null,
          filesizeFormatted: 'Processado no download',
          hasVideo: true,
          hasAudio: true,
          qualityLabel: 'HD 720p (Padrão)',
          isRecommended: false,
          note: 'Excelente equilíbrio entre qualidade e tamanho',
          downloadUrl: '',
        },
        {
          id: 'best_480p',
          formatId: 'bestvideo[ext=mp4][vcodec^=avc1][height<=480]+bestaudio[ext=m4a]/bestvideo[height<=480]+bestaudio/best[height<=480]/best',
          extension: 'mp4',
          resolution: '480p',
          filesize: null,
          filesizeFormatted: 'Processado no download',
          hasVideo: true,
          hasAudio: true,
          qualityLabel: 'SD 480p (Econômico)',
          isRecommended: false,
          note: 'Arquivo mais leve para conexões móveis',
          downloadUrl: '',
        }
      );
    }

    formats.push(
      {
        id: 'audio_mp3_best',
        formatId: 'bestaudio/best',
        extension: 'mp3',
        resolution: 'Áudio',
        filesize: null,
        filesizeFormatted: 'Processado no download',
        hasVideo: false,
        hasAudio: true,
        qualityLabel: 'Áudio MP3 (Melhor Qualidade)',
        note: 'Conversão em áudio MP3 de alta fidelidade',
        isRecommended: !hasAnyVideo,
        downloadUrl: '',
      },
      {
        id: 'audio_m4a_best',
        formatId: 'bestaudio[ext=m4a]/bestaudio/best',
        extension: 'm4a',
        resolution: 'Áudio',
        filesize: null,
        filesizeFormatted: 'Processado no download',
        hasVideo: false,
        hasAudio: true,
        qualityLabel: 'Áudio M4A / AAC (Original)',
        note: 'Faixa original do áudio sem recodificação',
        isRecommended: false,
        downloadUrl: '',
      }
    );

    res.json({
      data: {
        id: r.id || 'unknown',
        title: r.title || 'Mídia',
        thumbnail: r.thumbnail || '',
        duration: r.duration || 0,
        durationFormatted: String(r.duration || 0),
        platform: r.extractor_key || r.extractor || 'Web',
        originalUrl: r.webpage_url || url,
        uploader: r.uploader || r.channel || 'Desconhecido',
        formats,
        analyzedAt: new Date().toISOString(),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'analysis failed' });
  }
});

app.get('/api/download', auth, (req, res) => {
  const url = String(req.query.url || '');
  const format = String(req.query.format || 'best');
  const ext = String(req.query.ext || 'mp4').replace(/[^a-z0-9]/gi, '') || 'mp4';

  if (!/^https?:\/\//i.test(url)) {
    return res.status(400).json({ error: 'invalid url' });
  }

  res.setHeader('Content-Type', ext === 'mp3' ? 'audio/mpeg' : 'video/mp4');
  res.setHeader('Content-Disposition', `attachment; filename="mjr_download.${ext}"`);

  const ffmpegPath = getFfmpegCmd();

  const args = [
    '--no-playlist',
    '--no-warnings',
    '--geo-bypass',
    '--extractor-args',
    'youtube:player_client=android,web,web_safari,tv',
    '-f',
    format,
    '--max-filesize',
    String(Number(process.env.MAX_DOWNLOAD_SIZE_BYTES) || 524288000),
  ];

  if (ffmpegPath && ffmpegPath !== 'ffmpeg') {
    args.push('--ffmpeg-location', path.dirname(ffmpegPath));
  }

  if (ext === 'mp3') {
    args.push('-x', '--audio-format', 'mp3');
    args.push('--downloader-args', 'ffmpeg:-f mp3 -c:a libmp3lame -b:a 192k');
  } else if (ext === 'mp4' || ext === 'm4a') {
    args.push('--downloader-args', 'ffmpeg:-f mp4 -movflags frag_keyframe+empty_moov+default_base_moof');
  }

  args.push('-o', '-', '--', url);

  const bin = getYtDlpCmd();
  const proc = spawn(bin, args, { shell: false });
  proc.stdout.pipe(res);
  proc.stderr.on('data', (d) => {
    console.error(String(d));
  });
  req.on('close', () => {
    proc.kill();
  });
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Worker ready on port ${PORT}`);
});

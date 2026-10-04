/**
 * Tipos e Interfaces do MJR Downloader
 */

export type MediaType = 'video' | 'audio' | 'combined';

export interface MediaFormat {
  /** Identificador único do formato para download */
  id: string;
  /** Identificador original retornado pelo provedor (ex: format_id do yt-dlp) */
  formatId: string;
  /** Extensão do arquivo resultante (ex: mp4, webm, mp3, m4a) */
  extension: string;
  /** Resolução de vídeo legível (ex: 1080p, 720p, 480p, Áudio) */
  resolution: string;
  /** Largura do vídeo (em pixels) se aplicável */
  width?: number | null;
  /** Altura do vídeo (em pixels) se aplicável */
  height?: number | null;
  /** Taxa de quadros por segundo se aplicável */
  fps?: number | null;
  /** Tamanho estimado do arquivo em bytes (se fornecido) */
  filesize: number | null;
  /** Tamanho formatado legível (ex: "45.2 MB", "Desconhecido") */
  filesizeFormatted: string;
  /** Contém faixa de vídeo */
  hasVideo: boolean;
  /** Contém faixa de áudio */
  hasAudio: boolean;
  /** Codec de áudio utilizado */
  acodec?: string | null;
  /** Codec de vídeo utilizado */
  vcodec?: string | null;
  /** Rótulo de qualidade para exibição amigável (ex: "Full HD 1080p", "HD 720p", "Áudio HQ 320kbps") */
  qualityLabel: string;
  /** Observações adicionais ou notas de formato */
  note?: string;
  /** URL direta para iniciar o download via API segura */
  downloadUrl: string;
  /** Se o formato é recomendado como melhor equilíbrio de qualidade */
  isRecommended?: boolean;
}

export interface MediaInfo {
  /** ID da mídia na plataforma de origem */
  id: string;
  /** Título do vídeo ou áudio */
  title: string;
  /** URL da imagem de capa/miniatura */
  thumbnail: string;
  /** Duração em segundos */
  duration: number;
  /** Duração formatada em texto (ex: "04:15", "01:23:45") */
  durationFormatted: string;
  /** Nome legível da plataforma de origem (ex: YouTube, Vimeo, SoundCloud, etc.) */
  platform: string;
  /** URL original validada da mídia */
  originalUrl: string;
  /** Nome do canal, autor ou uploader se disponível */
  uploader?: string;
  /** Breve descrição ou resumo */
  description?: string;
  /** Formatos de download disponíveis após filtragem e ordenação */
  formats: MediaFormat[];
  /** Data da análise */
  analyzedAt: string;
}

export interface AnalyzeRequest {
  url: string;
}

export interface AnalyzeResponse {
  success: true;
  data: MediaInfo;
  provider: {
    name: string;
    engine: string;
  };
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
    details?: string;
  };
}

export interface ProviderStatus {
  available: boolean;
  provider: string;
  engine: string;
  version?: string;
  ffmpegAvailable: boolean;
  ffmpegVersion?: string;
  details?: string;
}

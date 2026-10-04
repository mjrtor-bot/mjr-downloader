import type { MediaInfo, ProviderStatus } from '@/types/media';
import type { Readable } from 'node:stream';

export interface DownloadStreamResult {
  stream: Readable;
  filename: string;
  contentType: string;
  contentLength?: number;
}

export interface IMediaProvider {
  /** Nome identificador do provedor */
  readonly name: string;
  /** Tipo de motor (ex: 'local-ytdlp', 'worker-service') */
  readonly engine: string;

  /**
   * Verifica se o provedor e suas ferramentas essenciais estão disponíveis e operacionais
   */
  isAvailable(): Promise<ProviderStatus>;

  /**
   * Analisa a URL pública fornecida e retorna metadados e formatos disponíveis
   */
  analyze(url: string): Promise<MediaInfo>;

  /**
   * Obtém o stream seguro de download para o formato solicitado
   */
  getDownloadStream(url: string, formatId: string, customExtension?: string): Promise<DownloadStreamResult>;
}

import type { MediaInfo, ProviderStatus } from '@/types/media';
import type { DownloadStreamResult, IMediaProvider } from '../types';

/**
 * Provedor desacoplado para execução em Worker/Cluster externo (ex: Kubernetes, BullMQ, Microsserviço)
 */
export class WorkerMediaProvider implements IMediaProvider {
  public readonly name = 'Worker de Processamento Distribuído';
  public readonly engine = 'worker-service';

  private workerUrl: string;
  private apiKey?: string;

  constructor(workerUrl?: string, apiKey?: string) {
    this.workerUrl = workerUrl || process.env.WORKER_URL || '';
    this.apiKey = apiKey || process.env.WORKER_API_KEY;
  }

  public async isAvailable(): Promise<ProviderStatus> {
    if (!this.workerUrl) {
      return {
        available: false,
        provider: this.name,
        engine: this.engine,
        ffmpegAvailable: false,
        details: 'A URL do worker externo (WORKER_URL) não foi configurada nas variáveis de ambiente.',
      };
    }

    try {
      const res = await fetch(`${this.workerUrl}/health`, {
        headers: this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {},
        signal: AbortSignal.timeout(5000),
      });

      if (!res.ok) {
        return {
          available: false,
          provider: this.name,
          engine: this.engine,
          ffmpegAvailable: false,
          details: `Worker retornou status HTTP ${res.status}`,
        };
      }

      const data = await res.json();
      return {
        available: true,
        provider: this.name,
        engine: this.engine,
        version: data.version || 'v1',
        ffmpegAvailable: Boolean(data.ffmpeg),
        details: `Conectado ao worker em ${this.workerUrl}`,
      };
    } catch (err) {
      return {
        available: false,
        provider: this.name,
        engine: this.engine,
        ffmpegAvailable: false,
        details: `Não foi possível conectar ao worker: ${err instanceof Error ? err.message : 'Erro desconhecido'}`,
      };
    }
  }

  public async analyze(url: string): Promise<MediaInfo> {
    if (!this.workerUrl) {
      throw new Error('Serviço de worker não configurado.');
    }

    const res = await fetch(`${this.workerUrl}/api/analyze`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}),
      },
      body: JSON.stringify({ url }),
      signal: AbortSignal.timeout(30000),
    });

    if (!res.ok) {
      const errBody = await res.json().catch(() => ({}));
      throw new Error(errBody.error || `Erro retornado pelo worker: ${res.statusText}`);
    }

    const data = await res.json();
    return data.data;
  }

  public async getDownloadStream(): Promise<DownloadStreamResult> {
    if (!this.workerUrl) {
      throw new Error('Serviço de worker não configurado.');
    }

    // O worker externo pode fornecer um stream HTTP direto ou redirecionamento assinado
    throw new Error('Streaming via worker distribuído em desenvolvimento.');
  }
}

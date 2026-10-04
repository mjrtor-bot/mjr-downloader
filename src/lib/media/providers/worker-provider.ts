import { Readable } from 'node:stream';
import type { MediaInfo, ProviderStatus } from '@/types/media';
import type { DownloadStreamResult, IMediaProvider } from '../types';

export class WorkerMediaProvider implements IMediaProvider {
  public readonly name = 'Worker de Processamento Distribuído';
  public readonly engine = 'worker-service';
  private workerUrl: string;
  private apiKey?: string;

  constructor(workerUrl?: string, apiKey?: string) {
    this.workerUrl = (workerUrl || process.env.WORKER_URL || '').replace(/\/$/, '');
    this.apiKey = apiKey || process.env.WORKER_API_KEY;
  }

  private headers(extra: Record<string,string> = {}) {
    return { ...extra, ...(this.apiKey ? { Authorization: `Bearer ${this.apiKey}` } : {}) };
  }

  public async isAvailable(): Promise<ProviderStatus> {
    if (!this.workerUrl) return { available:false, provider:this.name, engine:this.engine, ffmpegAvailable:false, details:'WORKER_URL não configurada.' };
    try {
      const res = await fetch(`${this.workerUrl}/health`, { headers:this.headers(), signal:AbortSignal.timeout(5000) });
      if (!res.ok) return { available:false, provider:this.name, engine:this.engine, ffmpegAvailable:false, details:`Worker HTTP ${res.status}` };
      const data = await res.json();
      return { available:true, provider:this.name, engine:this.engine, version:data.version || 'v1', ffmpegAvailable:Boolean(data.ffmpeg), details:'Worker conectado.' };
    } catch { return { available:false, provider:this.name, engine:this.engine, ffmpegAvailable:false, details:'Worker indisponível.' }; }
  }

  public async analyze(url:string): Promise<MediaInfo> {
    if (!this.workerUrl) throw new Error('Serviço de processamento não configurado.');
    const res = await fetch(`${this.workerUrl}/api/analyze`, {
      method:'POST', headers:this.headers({'Content-Type':'application/json'}),
      body:JSON.stringify({url}), signal:AbortSignal.timeout(30000)
    });
    if (!res.ok) throw new Error('Falha ao analisar a mídia no worker.');
    const data = await res.json();
    return data.data;
  }

  public async getDownloadStream(url:string, formatId:string, customExtension='mp4'): Promise<DownloadStreamResult> {
    if (!this.workerUrl) throw new Error('Serviço de processamento não configurado.');
    const endpoint = new URL('/api/download', this.workerUrl);
    endpoint.searchParams.set('url', url); endpoint.searchParams.set('format', formatId); endpoint.searchParams.set('ext', customExtension);
    const res = await fetch(endpoint, { headers:this.headers(), signal:AbortSignal.timeout(30000) });
    if (!res.ok || !res.body) throw new Error('Falha ao iniciar o download no worker.');
    const nodeStream = Readable.fromWeb(res.body as never);
    return { stream:nodeStream, filename:`mjr_download.${customExtension}`, contentType:res.headers.get('content-type') || 'application/octet-stream' };
  }
}

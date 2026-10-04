import { LocalYtDlpProvider } from './providers/local-ytdlp';
import { WorkerMediaProvider } from './providers/worker-provider';
import type { IMediaProvider } from './types';

let activeProvider: IMediaProvider | null = null;

/**
 * Obtém a instância singleton do provedor de mídia configurado
 */
export function getMediaProvider(): IMediaProvider {
  if (activeProvider) {
    return activeProvider;
  }

  const providerType = (process.env.MEDIA_PROVIDER || 'local').toLowerCase().trim();

  if (providerType === 'worker') {
    activeProvider = new WorkerMediaProvider();
  } else {
    activeProvider = new LocalYtDlpProvider();
  }

  return activeProvider;
}

export * from './types';

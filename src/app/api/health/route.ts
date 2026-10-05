import { NextResponse } from 'next/server';
import { getMediaProvider } from '@/lib/media';

export async function GET() {
  const status = await getMediaProvider().isAvailable();
  return NextResponse.json(
    {
      status: status.available ? 'healthy' : 'degraded',
      timestamp: new Date().toISOString(),
      service: 'MJR Downloader API',
      provider: status,
      security: {
        ssrfProtection: true,
        rateLimiter: true,
        privateIpBlocked: true,
        allowedProtocols: ['http', 'https'],
      },
    },
    { status: status.available ? 200 : 503, headers: { 'Cache-Control': 'no-store' } }
  );
}

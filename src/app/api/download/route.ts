import { Readable } from 'node:stream';
import { type NextRequest, NextResponse } from 'next/server';
import { getMediaProvider } from '@/lib/media';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limiter';
import { SecurityValidationError, validatePublicMediaUrl } from '@/lib/security/url-validator';

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const rawUrl = searchParams.get('url');
    const format = searchParams.get('format') || 'best';
    const ext = searchParams.get('ext') || 'mp4';
    const title = searchParams.get('title') || 'mjr_download';

    if (!rawUrl) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_URL',
            message: 'O parâmetro "url" é obrigatório para realizar o download.',
          },
        },
        { status: 400 }
      );
    }

    // 1. Rate Limit
    const clientIp = getClientIp(request.headers);
    const rateLimit = checkRateLimit(
      `download:${clientIp}`,
      Number(process.env.RATE_LIMIT_DOWNLOAD_MAX) || 15,
      Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Limite de downloads atingido. Aguarde ${rateLimit.resetSeconds} segundos.`,
          },
        },
        {
          status: 429,
          headers: {
            'Retry-After': rateLimit.resetSeconds.toString(),
          },
        }
      );
    }

    // 2. Validação de Segurança da URL
    const validatedUrl = await validatePublicMediaUrl(rawUrl);

    // 3. Sanitização dos parâmetros
    const sanitizedExt = ext.replace(/[^a-zA-Z0-9]/g, '').toLowerCase() || 'mp4';
    const cleanTitle = title
      .replace(/[<>:"/\\|?*\x00-\x1F]/g, '')
      .replace(/\s+/g, '_')
      .slice(0, 100) || 'midia';

    const safeAsciiFilename = `${cleanTitle.replace(/[^\x20-\x7E]/g, '') || 'download'}.${sanitizedExt}`;
    const encodedFilename = encodeURIComponent(`${cleanTitle}.${sanitizedExt}`);

    // 4. Obter Provider e Stream
    const provider = getMediaProvider();
    const { stream, contentType } = await provider.getDownloadStream(
      validatedUrl.toString(),
      format,
      sanitizedExt
    );

    // 5. Converter Node Readable Stream para Web ReadableStream
    const webStream = Readable.toWeb(stream) as unknown as BodyInit;

    // 6. Retornar resposta em streaming com cabeçalhos adequados
    return new Response(webStream, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Disposition': `attachment; filename="${safeAsciiFilename}"; filename*=UTF-8''${encodedFilename}`,
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (err: unknown) {
    if (err instanceof SecurityValidationError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: err.code,
            message: err.message,
          },
        },
        { status: 400 }
      );
    }

    console.error('DOWNLOAD_STREAM_ERROR', err);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'DOWNLOAD_STREAM_ERROR',
          message: 'Não foi possível iniciar o download no momento.',
        },
      },
      { status: 500 }
    );
  }
}

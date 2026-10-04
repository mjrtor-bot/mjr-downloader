import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getMediaProvider } from '@/lib/media';
import { checkRateLimit, getClientIp } from '@/lib/security/rate-limiter';
import { SecurityValidationError, validatePublicMediaUrl } from '@/lib/security/url-validator';

const analyzeSchema = z.object({
  url: z.string().trim().min(5, 'A URL é muito curta.').max(2048, 'A URL é muito longa.'),
});

export async function POST(request: Request) {
  try {
    // 1. Limite de Taxa (Rate Limit)
    const clientIp = getClientIp(request.headers);
    const rateLimit = checkRateLimit(
      `analyze:${clientIp}`,
      Number(process.env.RATE_LIMIT_ANALYZE_MAX) || 30,
      Number(process.env.RATE_LIMIT_WINDOW_MS) || 60000
    );

    if (!rateLimit.allowed) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Muitas requisições em pouco tempo. Por favor, aguarde ${rateLimit.resetSeconds} segundos.`,
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

    // 2. Parse do Corpo da Requisição
    let body: unknown;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_JSON',
            message: 'O corpo da requisição deve ser um JSON válido contendo o campo "url".',
          },
        },
        { status: 400 }
      );
    }

    const parseResult = analyzeSchema.safeParse(body);
    if (!parseResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: parseResult.error.issues[0]?.message || 'URL inválida.',
          },
        },
        { status: 400 }
      );
    }

    const { url } = parseResult.data;

    // 3. Validação de Segurança e Proteção SSRF
    const validatedUrl = await validatePublicMediaUrl(url);

    // 4. Obter Provedor e Verificar Disponibilidade
    const provider = getMediaProvider();
    const status = await provider.isAvailable();

    if (!status.available) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'PROVIDER_UNAVAILABLE',
            message: 'O serviço de processamento de mídia não está operacional no servidor no momento.',
            details: status.details,
          },
        },
        { status: 503 }
      );
    }

    // 5. Executar Análise Real com o Provedor
    const mediaInfo = await provider.analyze(validatedUrl.toString());

    return NextResponse.json({
      success: true,
      data: mediaInfo,
      provider: {
        name: provider.name,
        engine: provider.engine,
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

    const errorMessage = err instanceof Error ? err.message : 'Erro interno ao processar a URL.';

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'ANALYSIS_ERROR',
          message: errorMessage,
        },
      },
      { status: 500 }
    );
  }
}

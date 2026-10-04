import dns from 'node:dns/promises';
import net from 'node:net';

/**
 * Erro de validação de segurança de URL
 */
export class SecurityValidationError extends Error {
  public readonly code: string;

  constructor(message: string, code: string = 'INVALID_URL') {
    super(message);
    this.name = 'SecurityValidationError';
    this.code = code;
  }
}

/**
 * Verifica se um endereço IPv4 está dentro de faixas privadas ou reservadas
 */
function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split('.').map((p) => Number.parseInt(p, 10));
  if (parts.length !== 4 || parts.some(Number.isNaN)) {
    return true; // Se não conseguir parsear, bloquear por segurança
  }

  const [a, b] = parts;

  // 0.0.0.0/8 (Endereço "este host")
  if (a === 0) return true;

  // 10.0.0.0/8 (Rede Privada RFC 1918)
  if (a === 10) return true;

  // 127.0.0.0/8 (Loopback)
  if (a === 127) return true;

  // 100.64.0.0/10 (Carrier-grade NAT)
  if (a === 100 && b >= 64 && b <= 127) return true;

  // 169.254.0.0/16 (Link-Local / APIPA)
  if (a === 169 && b === 254) return true;

  // 172.16.0.0/12 (Rede Privada RFC 1918)
  if (a === 172 && b >= 16 && b <= 31) return true;

  // 192.0.0.0/24 (IETF Protocol Assignments)
  if (a === 192 && b === 0) return true;

  // 192.168.0.0/16 (Rede Privada RFC 1918)
  if (a === 192 && b === 168) return true;

  // 198.18.0.0/15 (Benchmarking)
  if (a === 198 && (b === 18 || b === 19)) return true;

  // 224.0.0.0/4 (Multicast)
  if (a >= 224 && a <= 239) return true;

  // 240.0.0.0/4 (Reservado para uso futuro / Broadcast 255.255.255.255)
  if (a >= 240) return true;

  return false;
}

/**
 * Verifica se um endereço IPv6 é privado, loopback ou reservado
 */
function isPrivateIPv6(ip: string): boolean {
  const normalized = ip.toLowerCase();

  // ::1 / Loopback
  if (normalized === '::1' || normalized === '0:0:0:0:0:0:0:1') return true;

  // :: / Unspecified
  if (normalized === '::' || normalized === '0:0:0:0:0:0:0:0') return true;

  // IPv4-mapped IPv6 (ex: ::ffff:127.0.0.1 ou ::ffff:192.168.1.1)
  if (normalized.startsWith('::ffff:')) {
    const ipv4Part = normalized.replace('::ffff:', '');
    if (net.isIPv4(ipv4Part)) {
      return isPrivateIPv4(ipv4Part);
    }
  }

  // fc00::/7 - Unique Local Addresses (ULA)
  if (normalized.startsWith('fc') || normalized.startsWith('fd')) return true;

  // fe80::/10 - Link-Local Unicast
  if (
    normalized.startsWith('fe8') ||
    normalized.startsWith('fe9') ||
    normalized.startsWith('fea') ||
    normalized.startsWith('feb')
  ) {
    return true;
  }

  // ff00::/8 - Multicast
  if (normalized.startsWith('ff')) return true;

  return false;
}

/**
 * Valida se uma string é uma URL pública segura
 * Bloqueia SSRF, localhost, IPs privados, esquemas não permitidos
 */
export async function validatePublicMediaUrl(inputUrl: string): Promise<URL> {
  if (!inputUrl || typeof inputUrl !== 'string') {
    throw new SecurityValidationError('A URL da mídia é obrigatória.', 'MISSING_URL');
  }

  const trimmed = inputUrl.trim();

  // Limite de tamanho máximo da URL
  if (trimmed.length > 2048) {
    throw new SecurityValidationError('A URL fornecida é excessivamente longa.', 'URL_TOO_LONG');
  }

  // Tentar instanciar URL
  let parsedUrl: URL;
  try {
    parsedUrl = new URL(trimmed);
  } catch {
    throw new SecurityValidationError('Formato de URL inválido. Certifique-se de incluir https://', 'MALFORMED_URL');
  }

  // Verificar protocolo (apenas http e https)
  if (parsedUrl.protocol !== 'http:' && parsedUrl.protocol !== 'https:') {
    throw new SecurityValidationError(
      'Protocolo não permitido. Apenas URLs HTTP e HTTPS são aceitas.',
      'INVALID_PROTOCOL'
    );
  }

  // Bloquear credenciais na URL (ex: http://user:pass@example.com)
  if (parsedUrl.username || parsedUrl.password) {
    throw new SecurityValidationError('Credenciais embutidas na URL não são permitidas.', 'CREDENTIALS_DISALLOWED');
  }

  const hostname = parsedUrl.hostname.toLowerCase().trim();

  if (!hostname) {
    throw new SecurityValidationError('Nome de host inválido.', 'INVALID_HOSTNAME');
  }

  // Bloqueio de hostnames locais conhecidos
  const blockedHosts = new Set([
    'localhost',
    'localhost.localdomain',
    'ip6-localhost',
    'ip6-loopback',
    '0.0.0.0',
    '127.0.0.1',
    '[::1]',
    '::1',
    'local',
    'broadcasthost',
  ]);

  if (blockedHosts.has(hostname) || hostname.endsWith('.localhost') || hostname.endsWith('.local')) {
    throw new SecurityValidationError(
      'Acesso a recursos locais (localhost) é estritamente bloqueado por segurança.',
      'BLOCKED_LOCALHOST'
    );
  }

  // Verificar se o hostname é um endereço IP direto
  const ipType = net.isIP(hostname.replace(/^\[|\]$/g, ''));
  if (ipType === 4) {
    if (isPrivateIPv4(hostname)) {
      throw new SecurityValidationError(
        'Acesso a endereços de redes privadas ou reservadas é bloqueado (Proteção SSRF).',
        'BLOCKED_PRIVATE_IP'
      );
    }
  } else if (ipType === 6) {
    const rawIpv6 = hostname.replace(/^\[|\]$/g, '');
    if (isPrivateIPv6(rawIpv6)) {
      throw new SecurityValidationError(
        'Acesso a endereços IPv6 privados ou locais é bloqueado (Proteção SSRF).',
        'BLOCKED_PRIVATE_IP'
      );
    }
  } else {
    // Se for um hostname/domínio, resolver DNS para evitar DNS rebinding para IP privado
    try {
      const lookupResult = await dns.lookup(hostname, { all: true });
      if (!lookupResult || lookupResult.length === 0) {
        throw new SecurityValidationError('Não foi possível resolver o domínio fornecido.', 'DNS_LOOKUP_FAILED');
      }

      for (const entry of lookupResult) {
        if (entry.family === 4 && isPrivateIPv4(entry.address)) {
          throw new SecurityValidationError(
            'O domínio resolve para um endereço de rede privada não autorizado.',
            'SSRF_DNS_REBOUND'
          );
        }
        if (entry.family === 6 && isPrivateIPv6(entry.address)) {
          throw new SecurityValidationError(
            'O domínio resolve para um endereço IPv6 privado não autorizado.',
            'SSRF_DNS_REBOUND'
          );
        }
      }
    } catch (dnsErr) {
      if (dnsErr instanceof SecurityValidationError) {
        throw dnsErr;
      }
      throw new SecurityValidationError(
        'Falha ao resolver o domínio da URL. Verifique se o endereço existe e está acessível.',
        'DNS_RESOLUTION_ERROR'
      );
    }
  }

  return parsedUrl;
}

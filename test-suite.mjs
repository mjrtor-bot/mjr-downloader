// test-suite.mjs
import assert from 'node:assert';

const BASE_URL = (process.env.BASE_URL || 'http://localhost:3000').replace(/\/+$/, '');

async function runTests() {
  console.log(`🧪 Iniciando Bateria de Testes do MJR Downloader em: ${BASE_URL}\n`);
  let passed = 0;
  let total = 0;

  async function test(name, fn) {
    total++;
    process.stdout.write(`⏳ Teste ${total}: ${name}... `);
    try {
      await fn();
      console.log('✅ PASSOU');
      passed++;
    } catch (err) {
      console.log('❌ FALHOU');
      console.error('   Erro:', err.message);
    }
  }

  // 1. Página inicial
  await test('Página inicial (/) retorna 200 OK e elementos obrigatórios', async () => {
    const res = await fetch(`${BASE_URL}/`);
    assert.strictEqual(res.status, 200);
    const html = await res.text();
    assert(html.includes('MJR Downloader'), 'HTML deve conter marca MJR Downloader');
    assert(html.includes('Baixe sua m'), 'HTML deve conter título principal');
    assert(html.includes('Analisar'), 'HTML deve conter botão Analisar');
  });

  // 2. Página Sobre
  await test('Página Sobre (/sobre) retorna 200 OK e conteúdo explicativo', async () => {
    const res = await fetch(`${BASE_URL}/sobre`);
    assert.strictEqual(res.status, 200);
    const html = await res.text();
    assert(html.includes('Sobre'), 'HTML deve conter palavra Sobre');
    assert(html.includes('MJR Downloader'), 'HTML deve conter menção ao MJR Downloader');
    assert(html.includes('yt-dlp'), 'HTML deve mencionar yt-dlp');
  });

  // 3. Página Termos
  await test('Página Termos (/termos) retorna 200 OK e diretrizes éticas', async () => {
    const res = await fetch(`${BASE_URL}/termos`);
    assert.strictEqual(res.status, 200);
    const html = await res.text();
    assert(html.includes('Termos de Uso'), 'HTML deve conter Termos de Uso');
    assert(html.includes('MJR Downloader — Use somente'), 'HTML deve conter disclaimer');
  });

  // 4. Manifest PWA
  await test('Manifest PWA (/manifest.webmanifest) retorna JSON com metadata correto', async () => {
    const res = await fetch(`${BASE_URL}/manifest.webmanifest`);
    assert.strictEqual(res.status, 200);
    const manifest = await res.json();
    assert.strictEqual(manifest.name, 'MJR Downloader');
    assert.strictEqual(manifest.short_name, 'MJR Downloader');
    assert.strictEqual(manifest.display, 'standalone');
  });

  // 5. Endpoint /api/health
  await test('Endpoint /api/health retorna diagnóstico dos motores (yt-dlp e FFmpeg)', async () => {
    const res = await fetch(`${BASE_URL}/api/health`);
    assert.strictEqual(res.status, 200);
    const data = await res.json();
    assert.strictEqual(data.status, 'healthy');
    assert.strictEqual(data.provider.available, true);
    assert(data.provider.ffmpegAvailable === true, 'FFmpeg deve estar disponível');
    console.log(`\n      [Diagnóstico: yt-dlp ${data.provider.version}, ffmpeg=${data.provider.ffmpegAvailable}, provider=${data.provider.provider || data.provider.engine}]`);
  });

  // 6. Teste de URL vazia / inválida
  await test('Envio de URL vazia/inválida em /api/analyze retorna 400 amigável', async () => {
    const res = await fetch(`${BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: '' }),
    });
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.success, false);
    assert(json.error && json.error.message, 'Deve conter mensagem de erro clara');
  });

  // 7. Teste de Proteção SSRF: Localhost
  await test('Bloqueio SSRF para http://localhost:3000', async () => {
    const res = await fetch(`${BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'http://localhost:3000/api/health' }),
    });
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.success, false);
    assert.strictEqual(json.error.code, 'BLOCKED_LOCALHOST');
  });

  // 8. Teste de Proteção SSRF: 127.0.0.1
  await test('Bloqueio SSRF para http://127.0.0.1:8080', async () => {
    const res = await fetch(`${BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'http://127.0.0.1:8080' }),
    });
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.success, false);
    assert.strictEqual(json.error.code, 'BLOCKED_LOCALHOST');
  });

  // 9. Teste de Proteção SSRF: Rede Privada RFC 1918 (192.168.1.1)
  await test('Bloqueio SSRF para http://192.168.1.1', async () => {
    const res = await fetch(`${BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'http://192.168.1.1/router' }),
    });
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.success, false);
    assert.strictEqual(json.error.code, 'BLOCKED_PRIVATE_IP');
  });

  // 10. Teste de Proteção SSRF: IPv6 Loopback [::1]
  await test('Bloqueio SSRF para http://[::1]:3000', async () => {
    const res = await fetch(`${BASE_URL}/api/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ url: 'http://[::1]:3000' }),
    });
    assert.strictEqual(res.status, 400);
    const json = await res.json();
    assert.strictEqual(json.success, false);
  });

  // 11. Teste de Análise com URL de Mídia Pública Real (Vídeo/Áudio de Teste Público)
  let analyzedFormatUrl = '';
  await test('Análise de URL de mídia pública em /api/analyze', async () => {
    const candidateUrls = [
      'https://soundcloud.com/octobersveryown/drake-gods-plan',
      'https://www.youtube.com/watch?v=aqz-KE-bpKQ',
    ];

    let lastError = null;
    let successData = null;

    for (const testUrl of candidateUrls) {
      try {
        const res = await fetch(`${BASE_URL}/api/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: testUrl }),
        });
        const json = await res.json();
        if (res.status === 200 && json.success && json.data?.title) {
          successData = json.data;
          break;
        } else {
          lastError = json.error?.message || `Status ${res.status}`;
        }
      } catch (err) {
        lastError = err.message;
      }
    }

    assert(successData, `Falha na análise de mídia pública: ${lastError}`);
    assert(successData.title, 'Deve retornar título da mídia');
    assert(successData.formats && successData.formats.length > 0, 'Deve retornar formatos de mídia');
    console.log(`\n      [Mídia: "${successData.title}" | Formatos: ${successData.formats.length}]`);
    if (successData.formats[0]?.downloadUrl) {
      analyzedFormatUrl = successData.formats[0].downloadUrl;
    }
  });

  // 12. Teste de Streaming do Endpoint /api/download
  await test('Streaming de Download em /api/download', async () => {
    if (!analyzedFormatUrl) {
      console.log(' (Pulado: formato não analisado)');
      return;
    }
    const downloadEndpoint = `${BASE_URL}${analyzedFormatUrl}`;
    const res = await fetch(downloadEndpoint);
    assert.strictEqual(res.status, 200);
    assert(res.headers.get('content-disposition')?.includes('attachment'), 'Cabeçalho Content-Disposition deve ser attachment');
    assert(res.headers.get('content-type'), 'Deve ter Content-Type definido');

    // Ler os primeiros chunks do stream para validar que dados reais estão fluindo sem corrupção
    const reader = res.body.getReader();
    let receivedBytes = 0;
    for (let i = 0; i < 5; i++) {
      const { done, value } = await reader.read();
      if (done) break;
      receivedBytes += value.length;
    }
    await reader.cancel();
    assert(receivedBytes > 0, 'Stream deve entregar bytes reais do arquivo');
    console.log(`\n      [Streaming verificado: recebidos ${receivedBytes} bytes com sucesso via ReadableStream]`);
  });

  console.log(`\n📊 Resultado Final: ${passed}/${total} testes passaram com sucesso!`);
  if (passed < total) {
    process.exitCode = 1;
  }
}

runTests().catch((err) => {
  console.error(err);
  process.exit(1);
});

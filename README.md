# MJR Downloader

> **Baixe sua mídia de forma simples**  
> Cole o link de uma mídia pública para analisar os formatos disponíveis e baixar com segurança.

---

## 📌 Visão Geral

O **MJR Downloader** é uma aplicação web moderna, segura e de alta performance construída para inspecionar e transferir mídias públicas autorizadas. Desenvolvido com **Next.js (App Router)**, **TypeScript** e **Tailwind CSS**, o projeto adota uma arquitetura desacoplada de provedores de mídia (*Media Providers*) com suporte a **yt-dlp** e **FFmpeg**.

> ⚠️ **Política de Uso Ético e Legal:**  
> O MJR Downloader destina-se exclusivamente a conteúdos públicos sob licença aberta (Creative Commons) ou mídias para as quais o usuário possua explícita autorização. Não implementamos bypass de DRM, paywall, extração de autenticação ou contorno de controles de acesso.

---

## 🚀 Tecnologias

- **Framework:** Next.js 16 (App Router com React 19)
- **Linguagem:** TypeScript (Strict Mode)
- **Estilização:** Tailwind CSS v4
- **Ícones & UI:** Lucide React, clsx, tailwind-merge
- **Validação de Esquemas:** Zod
- **Motor de Mídia Backend:** yt-dlp & FFmpeg via streaming de processos Node.js
- **Segurança & SSRF:** Verificação de DNS, bloqueio estrito de redes privadas (RFC 1918, CGNAT, Loopback) e limitador de taxa (Rate Limiting)
- **PWA Ready:** Suporte a instalação com manifest, metadata e design mobile-first

---

## 🏛️ Arquitetura

O sistema foi concebido com forte separação de responsabilidades:

```
[ Frontend (Next.js React 19) ]
         │
         ▼
[ API Routes Seguras ]
 ├── /api/analyze   (Validação Zod + SSRF Shield + Rate Limit)
 ├── /api/download  (Streaming seguro de arquivos sem acúmulo em RAM)
 └── /api/health    (Diagnóstico de saúde e estado dos executáveis)
         │
         ▼
[ Media Provider Layer (Interface IMediaProvider) ]
 ├── LocalYtDlpProvider  (Executa yt-dlp e FFmpeg localmente)
 └── WorkerMediaProvider (Preparado para clusters/workers distribuídos)
```

### Principais Destaques de Segurança:
1. **Proteção contra SSRF e DNS Rebinding:** Nenhuma URL apontando para `localhost`, `127.0.0.1`, `::1` ou faixas privadas como `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16` é processada. O sistema resolve o DNS antes de invocar os utilitários de mídia.
2. **Execução Segura de Comandos:** Nunca utiliza `exec` ou concatenação de strings em shell. Utiliza `spawn` com array de argumentos sanitizados.
3. **Streaming Direto:** Os fluxos de dados são canalizados via `ReadableStream`, evitando consumo excessivo de memória RAM no servidor.
4. **Rate Limiting em Memória:** Protege a API contra abusos e DoS com janela deslizante e cabeçalhos `Retry-After`.

---

## 🛠️ Instalação e Execução

### Pré-requisitos
- **Node.js:** v20+ (recomendado v22 ou v24)
- **npm:** v10+
- **Python 3.10+** (ou `py` launcher no Windows)
- **yt-dlp:** instalado (`pip install yt-dlp` ou binário no PATH)
- **FFmpeg:** instalado no PATH do sistema

### Passo a Passo

1. **Clonar e instalar dependências:**
   ```bash
   npm install
   ```

2. **Configurar variáveis de ambiente:**
   ```bash
   cp .env.example .env.local
   ```

3. **Executar em modo de desenvolvimento:**
   ```bash
   npm run dev
   ```
   Acesse: [http://localhost:3000](http://localhost:3000)

4. **Executar Verificação de Lint e Build:**
   ```bash
   npm run lint
   npm run build
   ```

5. **Iniciar em produção:**
   ```bash
   npm run start
   ```

---

## ☁️ Deploy na Vercel e Produção

### 1. Frontend & Serverless na Vercel
O projeto é 100% compatível com a **Vercel** (Next.js 16 App Router).
- Basta conectar o repositório do GitHub ao painel da [Vercel](https://vercel.com/new).
- O build (`next build`) e as páginas são geradas automaticamente.

> 💡 **Nota sobre Executáveis Binários (`yt-dlp` / `FFmpeg`):**
> Em ambientes Serverless tradicionais (como Vercel Serverless Functions com limites de tempo e pacotes read-only), configure o modo `MEDIA_PROVIDER=worker` apontando para um backend/worker dedicado (`WORKER_URL`) ou utilize uma VPS / Docker (Render, Railway, Fly.io, VPS Linux/Docker) caso queira executar o `yt-dlp` com o motor local `LocalYtDlpProvider`.

---

## 🧪 Rotas e Endpoints

| Rota | Método | Descrição |
|------|--------|-----------|
| `/` | `GET` | Página Inicial interativa com Analisador de URLs |
| `/sobre` | `GET` | Detalhes da arquitetura, tecnologia e princípios éticos |
| `/termos` | `GET` | Termos de uso, política aceitável e isenção de responsabilidade |
| `/api/analyze` | `POST` | Analisa a URL e retorna os formatos reais disponíveis |
| `/api/download` | `GET` | Inicia o streaming de download do formato selecionado |
| `/api/health` | `GET` | Status do provedor, yt-dlp, FFmpeg e proteções ativas |

---

## 📄 Licença

MJR Downloader — Use somente em conteúdos que você tenha permissão para baixar.

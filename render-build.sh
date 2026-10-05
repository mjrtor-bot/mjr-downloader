#!/usr/bin/env bash
set -e

echo "=== Iniciando Render Build para MJR Downloader ==="

# 1. Configurar PATH
export PATH="/opt/render/project/.local/bin:$PWD/bin:$PWD/worker/bin:$PATH"

# 2. Criar pastas de binários
mkdir -p ./bin
mkdir -p ./worker/bin

# 3. Baixar binário oficial standalone do yt-dlp
echo "Instalando yt-dlp standalone..."
curl -sL https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o ./bin/yt-dlp || true
if [ -f ./bin/yt-dlp ]; then
  chmod a+rx ./bin/yt-dlp
  cp ./bin/yt-dlp ./worker/bin/yt-dlp 2>/dev/null || true
  echo "yt-dlp instalado com sucesso."
fi

# 4. Instalar dependências da raiz (se package.json existir)
if [ -f "package.json" ]; then
  echo "Instalando dependências do projeto raiz..."
  npm install --no-audit --no-fund || npm ci || true
fi

# 5. Instalar dependências do worker (se pasta worker existir)
if [ -d "worker" ] && [ -f "worker/package.json" ]; then
  echo "Instalando dependências do worker..."
  cd worker
  npm install --no-audit --no-fund || true
  cd ..
fi

echo "=== Build concluído com sucesso! ==="

#!/usr/bin/env bash
set -e

echo "=== Iniciando Render Build para MJR Downloader / Worker ==="

# Criar diretórios para binários locais
mkdir -p ./bin
mkdir -p ./worker/bin

# 1. Baixar yt-dlp standalone oficial
echo "Instalando yt-dlp standalone binário..."
curl -sL https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp -o ./bin/yt-dlp
chmod a+rx ./bin/yt-dlp
cp ./bin/yt-dlp ./worker/bin/yt-dlp 2>/dev/null || true

# 2. Baixar FFmpeg estático se necessário
if ! command -v ffmpeg &> /dev/null; then
  echo "Baixando FFmpeg estático..."
  curl -sL https://johnvansickle.com/ffmpeg/releases/ffmpeg-release-amd64-static.tar.xz | tar -xJ --wildcards '*/ffmpeg' --strip-components=1 -C ./bin/ 2>/dev/null || true
  if [ -f ./bin/ffmpeg ]; then
    chmod a+rx ./bin/ffmpeg
    cp ./bin/ffmpeg ./worker/bin/ffmpeg 2>/dev/null || true
  fi
fi

# 3. Instalar dependências da raiz
if [ -f "package.json" ]; then
  echo "Instalando dependências do projeto principal..."
  npm install --production=false
fi

# 4. Instalar dependências do worker se existir
if [ -d "worker" ] && [ -f "worker/package.json" ]; then
  echo "Instalando dependências do worker..."
  cd worker
  npm install
  cd ..
fi

echo "=== Build concluído com sucesso! ==="

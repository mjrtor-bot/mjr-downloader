#!/usr/bin/env bash
set -e
python3 -m pip install --user -U yt-dlp
cd worker
npm install

@echo off
title Ultra Video Downloader Launcher
echo ============================================================
echo   Starting Ultra Video Downloader...
echo ============================================================
echo.

if not exist bin (
  mkdir bin
)

if not exist bin\yt-dlp.exe (
  echo Downloading yt-dlp binary...
  powershell -ExecutionPolicy Bypass -Command "curl.exe -L 'https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe' -o 'bin/yt-dlp.exe'"
)

if not exist bin\ffmpeg.exe (
  echo Downloading FFmpeg binary for video+audio merging...
  powershell -ExecutionPolicy Bypass -Command "curl.exe -L 'https://github.com/ffbinaries/ffbinaries-prebuilt/releases/download/v4.4.1/ffmpeg-4.4.1-win-64.zip' -o 'bin/ffmpeg.zip'; Expand-Archive -Path 'bin/ffmpeg.zip' -DestinationPath 'bin/' -Force; Remove-Item 'bin/ffmpeg.zip' -Force"
)

if not exist node_modules (
  echo Installing dependencies...
  call npm install
)

echo.
echo Launching dev server on http://localhost:3000...
start "" http://localhost:3000
npm run dev

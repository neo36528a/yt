// ============================================================
// Ultra Video Downloader — Electron Build Script
// Prepares the Next.js standalone build for Electron packaging
// ============================================================

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.join(__dirname, '..');
const STANDALONE = path.join(ROOT, '.next', 'standalone');
const STATIC_SRC = path.join(ROOT, '.next', 'static');
const PUBLIC_SRC = path.join(ROOT, 'public');
const DIST = path.join(ROOT, 'dist');

function log(msg) {
  console.log(`\n✦ ${msg}`);
}

function copyDirSync(src, dest) {
  if (!fs.existsSync(src)) return;
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      try {
        fs.copyFileSync(srcPath, destPath);
      } catch (err) {
        // Native .node binaries may be locked — try read+write fallback
        try {
          const data = fs.readFileSync(srcPath);
          fs.writeFileSync(destPath, data);
        } catch {
          console.warn(`  ⚠ Skipped locked file: ${entry.name}`);
        }
      }
    }
  }
}

try {
  // Step 1: Build Next.js
  log('Building Next.js standalone...');
  execSync('npm run build', { cwd: ROOT, stdio: 'inherit' });

  // Step 2: Prepare dist/standalone directory
  log('Preparing standalone bundle...');
  if (fs.existsSync(DIST)) {
    fs.rmSync(DIST, { recursive: true, force: true });
  }
  fs.mkdirSync(DIST, { recursive: true });

  // Copy standalone server
  const distStandalone = path.join(DIST, 'standalone');
  copyDirSync(STANDALONE, distStandalone);

  // Copy static assets into standalone/.next/static
  const distStatic = path.join(distStandalone, '.next', 'static');
  log('Copying static assets...');
  copyDirSync(STATIC_SRC, distStatic);

  // Copy public folder into standalone/public
  const distPublic = path.join(distStandalone, 'public');
  log('Copying public assets...');
  copyDirSync(PUBLIC_SRC, distPublic);

  // Step 3: Copy bin directory (yt-dlp.exe, ffmpeg.exe)
  const binSrc = path.join(ROOT, 'bin');
  const binDest = path.join(DIST, 'bin');
  if (fs.existsSync(binSrc)) {
    log('Copying binaries (yt-dlp, ffmpeg)...');
    copyDirSync(binSrc, binDest);
  } else {
    console.warn('⚠ bin/ directory not found — yt-dlp.exe and ffmpeg.exe will not be bundled');
  }

  log('Build preparation complete!');
  log(`Standalone server: ${distStandalone}`);
  log(`Binaries: ${binDest}`);
  console.log('\n🚀 Run "npm run electron:package" to create the installer.\n');

} catch (err) {
  console.error('\n❌ Build failed:', err.message);
  process.exit(1);
}

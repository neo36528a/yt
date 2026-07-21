// ============================================================
// Ultra Video Downloader — Electron Main Process
// ============================================================

const { app, BrowserWindow, shell, dialog, ipcMain } = require('electron');
const path = require('path');
const { spawn } = require('child_process');
const net = require('net');

// Prevent multiple instances
const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
  app.quit();
}

let mainWindow = null;
let serverProcess = null;
let serverPort = 3000;

// ── Find a free port ──────────────────────────────────────────
function findFreePort(startPort) {
  return new Promise((resolve, reject) => {
    const server = net.createServer();
    server.listen(startPort, '127.0.0.1', () => {
      const port = server.address().port;
      server.close(() => resolve(port));
    });
    server.on('error', () => {
      resolve(findFreePort(startPort + 1));
    });
  });
}

// ── Get the path to the standalone server ─────────────────────
function getServerPath() {
  if (app.isPackaged) {
    // In packaged app, standalone is in resources/standalone
    return path.join(process.resourcesPath, 'standalone', 'server.js');
  }
  // In dev, use the .next/standalone build
  return path.join(__dirname, '..', '.next', 'standalone', 'server.js');
}

// ── Get the path to the bin directory (yt-dlp, ffmpeg) ────────
function getBinPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'bin');
  }
  return path.join(__dirname, '..', 'bin');
}

// ── Get the path to the public and static directories ─────────
function getPublicPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'standalone', 'public');
  }
  return path.join(__dirname, '..', 'public');
}

function getStaticPath() {
  if (app.isPackaged) {
    return path.join(process.resourcesPath, 'standalone', '.next', 'static');
  }
  return path.join(__dirname, '..', '.next', 'static');
}

// ── Start the Next.js standalone server ───────────────────────
async function startServer() {
  serverPort = await findFreePort(3000);

  const serverPath = getServerPath();
  const binPath = getBinPath();

  console.log(`[Electron] Starting server at ${serverPath} on port ${serverPort}`);
  console.log(`[Electron] Bin path: ${binPath}`);

  // Get the user's Downloads folder
  const downloadsDir = path.join(app.getPath('downloads'), 'Ultra Video Downloads');

  serverProcess = spawn(process.execPath, [serverPath], {
    env: {
      ...process.env,
      PORT: String(serverPort),
      HOSTNAME: '127.0.0.1',
      NODE_ENV: 'production',
      DOWNLOAD_DIR: downloadsDir,
      // Ensure yt-dlp and ffmpeg can be found
      PATH: `${binPath}${path.delimiter}${process.env.PATH || ''}`,
    },
    stdio: ['pipe', 'pipe', 'pipe'],
    cwd: app.isPackaged
      ? path.join(process.resourcesPath, 'standalone')
      : path.join(__dirname, '..'),
  });

  serverProcess.stdout.on('data', (data) => {
    console.log(`[Server] ${data.toString().trim()}`);
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`[Server] ${data.toString().trim()}`);
  });

  serverProcess.on('close', (code) => {
    console.log(`[Server] Process exited with code ${code}`);
    serverProcess = null;
  });

  // Wait for the server to be ready
  await waitForServer(serverPort);
}

// ── Wait for server to accept connections ─────────────────────
function waitForServer(port, retries = 30) {
  return new Promise((resolve, reject) => {
    let attempts = 0;
    const check = () => {
      const client = net.createConnection({ port, host: '127.0.0.1' }, () => {
        client.end();
        resolve();
      });
      client.on('error', () => {
        attempts++;
        if (attempts >= retries) {
          reject(new Error('Server failed to start'));
        } else {
          setTimeout(check, 500);
        }
      });
    };
    check();
  });
}

// ── Create the main application window ────────────────────────
function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1360,
    height: 860,
    minWidth: 900,
    minHeight: 600,
    title: 'Ultra Video Downloader',
    icon: path.join(__dirname, '..', 'public', 'favicon.ico'),
    backgroundColor: '#09090e',
    show: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      // Allow loading localhost
      webSecurity: true,
    },
  });

  // Show window when ready (avoids white flash)
  mainWindow.once('ready-to-show', () => {
    mainWindow.show();
  });

  // Load the Next.js app
  mainWindow.loadURL(`http://127.0.0.1:${serverPort}`);

  // Open external links in the system browser
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    if (url.startsWith('http://127.0.0.1') || url.startsWith('http://localhost')) {
      return { action: 'allow' };
    }
    shell.openExternal(url);
    return { action: 'deny' };
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// ── IPC Handlers ──────────────────────────────────────────────
function setupIPC() {
  ipcMain.handle('get-download-path', () => {
    return path.join(app.getPath('downloads'), 'Ultra Video Downloads');
  });

  ipcMain.handle('open-folder', (_, folderPath) => {
    shell.openPath(folderPath);
  });

  ipcMain.handle('get-app-info', () => {
    return {
      version: app.getVersion(),
      platform: process.platform,
      isPackaged: app.isPackaged,
    };
  });

  ipcMain.handle('select-download-folder', async () => {
    const result = await dialog.showOpenDialog(mainWindow, {
      properties: ['openDirectory'],
      title: 'Select Download Folder',
    });
    if (!result.canceled && result.filePaths.length > 0) {
      return result.filePaths[0];
    }
    return null;
  });
}

// ── App Lifecycle ─────────────────────────────────────────────
app.on('ready', async () => {
  setupIPC();

  try {
    await startServer();
    createWindow();
  } catch (err) {
    console.error('[Electron] Failed to start:', err);
    dialog.showErrorBox(
      'Startup Error',
      `Failed to start the application server.\n\n${err.message}\n\nPlease try restarting the application.`
    );
    app.quit();
  }
});

// Focus existing window when second instance is attempted
app.on('second-instance', () => {
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});

app.on('window-all-closed', () => {
  // Kill the server process
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
  app.quit();
});

app.on('before-quit', () => {
  if (serverProcess) {
    serverProcess.kill();
    serverProcess = null;
  }
});

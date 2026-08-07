const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const MockServer = require('./server');

let mainWindow;
const server = new MockServer();

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    minWidth: 900,
    minHeight: 600,
    title: 'MockDash',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
    },
  });

  mainWindow.setMenuBarVisibility(false);
  mainWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));
}

// --- IPC: configuration ---
ipcMain.handle('server:start', async (_e, config) => {
  return server.start(config);
});

ipcMain.handle('server:stop', async () => {
  return server.stop();
});

ipcMain.handle('server:getState', async () => {
  return server.getState();
});

ipcMain.handle('endpoints:list', async () => {
  return server.getEndpoints();
});

ipcMain.handle('endpoints:add', async (_e, ep) => {
  return server.addEndpoint(ep);
});

ipcMain.handle('endpoints:update', async (_e, ep) => {
  return server.updateEndpoint(ep);
});

ipcMain.handle('endpoints:remove', async (_e, id) => {
  return server.removeEndpoint(id);
});

// Live request logs -> push to renderer
server.onLog((entry) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('server:log', entry);
  }
});

// Server state changes (started/stopped) -> push to renderer
server.onStatus((status) => {
  if (mainWindow && !mainWindow.isDestroyed()) {
    mainWindow.webContents.send('server:status', status);
  }
});

app.whenReady().then(() => {
  createWindow();
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  server.stop();
});

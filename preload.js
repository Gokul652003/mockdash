const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
  serverStart: (config) => ipcRenderer.invoke('server:start', config),
  serverStop: () => ipcRenderer.invoke('server:stop'),
  getState: () => ipcRenderer.invoke('server:getState'),
  listEndpoints: () => ipcRenderer.invoke('endpoints:list'),
  addEndpoint: (ep) => ipcRenderer.invoke('endpoints:add', ep),
  updateEndpoint: (ep) => ipcRenderer.invoke('endpoints:update', ep),
  removeEndpoint: (id) => ipcRenderer.invoke('endpoints:remove', id),
});
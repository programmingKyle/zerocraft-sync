const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    frameHandler: (data) => ipcRenderer.invoke('frame-handler', data),
    hostSettingsHandler: (data) => ipcRenderer.invoke('host-settings-handler', data),
    gistHandler: (data) => ipcRenderer.invoke('gist-handler', data),
    serverHandler: (data) => ipcRenderer.invoke('server-handler', data),
    selectDirectory: () => ipcRenderer.invoke('select-directory'),
    onServerStatusUpdate: (callback) => {
        ipcRenderer.on('server-status', (_, status) => {
            callback(status);
        });
    },

    toggleTerminal: () => ipcRenderer.invoke('toggle-terminal'),
    sendTerminal: (data) => ipcRenderer.invoke('send-terminal', data),
});
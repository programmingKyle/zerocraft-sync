const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    frameHandler: (data) => ipcRenderer.invoke('frame-handler', data),
    hostSettingsHandler: (data) => ipcRenderer.invoke('host-settings-handler', data),
    gistHandler: (data) => ipcRenderer.invoke('gist-handler', data),
    serverHandler: (data) => ipcRenderer.invoke('server-handler', data),
    selectDirectory: () => ipcRenderer.invoke('select-directory'),
    onServerStatusUpdate: (callback) => {
        ipcRenderer.on('server-status', (_, status) => {
            console.log(status);
            callback(status);
        });
    },
    pasteSettingsClipboard: () => ipcRenderer.invoke('paste-settings-clipboard'),
    toggleTerminal: () => ipcRenderer.invoke('toggle-terminal'),
    checkAndCloseTerminal: () => ipcRenderer.invoke('check-and-close-terminal'),
    sendTerminal: (data) => ipcRenderer.invoke('send-terminal', data),

    requiredLoopback: () => ipcRenderer.invoke('required-loopback'),
    closeApp: () => ipcRenderer.invoke('close-app'),


    // Auto Updater
    autoUpdaterCallback: (callback) => {
        ipcRenderer.on('auto-updater-callback', (_, status) => {
            callback(status);
        });
    },

    restartAndUpdate: () => ipcRenderer.invoke('restart-and-update'),
});
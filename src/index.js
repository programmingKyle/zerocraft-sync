const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const fs = require('fs');
const axios = require('axios');

let mainWindow;
let isMaximized;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 300,
    height: 400,
    frame: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  // and load the index.html of the app.
  mainWindow.loadFile(path.join(__dirname, 'index.html'));

  // Open the DevTools.
  //mainWindow.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
ipcMain.handle('gist-handler', async (req, data) => {
  if (!data || !data.request) return;
  switch (data.request){
    case 'View':
      const viewInfo = viewGist(data.gistId);
      return viewInfo;
  }
});

async function viewGist(gistId){
  try {
    const response = await axios.get(`https://api.github.com/gists/${gistId}`);
    const fileContent = response.data.files['server_status.json'].content;
    const settings = JSON.parse(fileContent);
    return settings;
  } catch (error) {
    console.error('Error fetching Gist content:', error);
  }
}

ipcMain.handle('host-settings-handler', (req, data) => {
  if (!data || !data.request) return;
  switch(data.request) {
    case 'Get':
      const settings = getSettings();
      return settings;
    case 'Add':
      addSettings(data.settings);
      break;
  }
});

function getSettings(){
  if (fs.existsSync('settings.json')){
    const settingsContent = fs.readFileSync('settings.json', 'utf-8');
    const settings = JSON.parse(settingsContent);
    return settings;
  } else {
    return null;
  }
}

function addSettings(settings) {
  const jsonData = JSON.stringify(settings, null, 2);
  fs.writeFileSync('settings.json', jsonData);
}


ipcMain.handle('frame-handler', (req, data) => {
  if (!data || !data.request) return;
  switch(data.request){
    case 'Minimize':
      mainWindow.minimize();
      break;
    case 'Maximize':
      toggleMaximize();
      break;
    case 'Exit':
      mainWindow.close();
      break;
    }
});

function toggleMaximize(){
  if (isMaximized){
    mainWindow.restore();
  } else {
    mainWindow.maximize();
  }
  isMaximized = !isMaximized;
}


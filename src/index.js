const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs');
const axios = require('axios');
const { spawn } = require('child_process');

let mainWindow;
let isMaximized;

let serverProcess;
let serverDir; 

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 400,
    height: 350,
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
ipcMain.handle('server-handler', (req, data) => {
  console.log(data);
  if (!data || !data.request) return;
  switch (data.request){
    case 'Start':
      startServer(data.directory);
      break;
    case 'Stop':
      stopServer(data.directory);
      break;
  }
});

function stopServer(){
  if (serverProcess.stdin) {
    serverProcess.stdin.write('stop\n'); // Assuming the server process accepts "stop" for graceful shutdown
  } else {
    console.error('Error: stdin is null');
  }
}

function startServer(directory) {
  serverDir = path.join(directory, 'bedrock_server.exe');
  serverProcess = spawn(serverDir, {
    stdio: ['pipe', 'pipe', 'pipe'], // Enable stdin, stdout, and stderr
  });

  serverProcess.stdout.on('data', (data) => {
    console.log(`${data}`);
    // Process stdout data here
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
    // Process stderr data here
  });

  serverProcess.on('error', (err) => {
    console.error('Error starting server process:', err);
  });

  serverProcess.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
    // Perform actions when the process is closed
  });

  serverProcess.on('exit', (code) => {
    console.log(`Server process exited with code ${code}`);
    // Perform actions when the process exits
  });
}

ipcMain.handle('select-directory', async (req, data) => {
  try {
    const result = await dialog.showOpenDialog({
      properties: ['openDirectory'],
      title: 'Select Minecraft Directory',
    });

    if (result.canceled){
      if (data.currentDirectory !== null){
        return data.currentDirectory;
      }
    }

    const selectedPath = result.filePaths[0];

    return selectedPath || '';
  } catch (err) {
    console.error('Error opening directory dialog:', err);
    return '';
  }
});



ipcMain.handle('gist-handler', async (req, data) => {
  if (!data || !data.request) return;
  switch (data.request){
    case 'View':
      const viewInfo = viewGist(data.gistID, data.accessToken);
      return viewInfo;
    case 'Update':
      console.log(data);
      const updateSuccess = await updateGist(data.gistID, data.accessToken, data.updatedContent);
      return updateSuccess;
  }
});

async function updateGist(gistID, accessToken, updatedContent) {
  try {
    const response = await axios.patch(
      `https://api.github.com/gists/${gistID}`,
      {
        files: {
          'server_status.json': {
            content: JSON.stringify(updatedContent, null, 2),
          },
        },
      },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );
    return true;
  } catch (error) {
    console.error('Error updating Gist:', error.response?.data || error.message);
    return false;
  }
}

async function viewGist(gistID, accessToken) {
  try {
    const headers = {
      'Authorization': `Bearer ${accessToken}`,
    };

    const response = await axios.get(`https://api.github.com/gists/${gistID}`, { headers });

    const fileContent = response.data.files['server_status.json'].content;
    const settings = JSON.parse(fileContent);

    return settings;
  } catch (error) {
    console.error('Error fetching Gist content:', error);
    throw error;
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


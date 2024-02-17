const { app, BrowserWindow, ipcMain, dialog, shell } = require('electron');
const path = require('path');
const fs = require('fs-extra');
const axios = require('axios');
const { spawn } = require('child_process');
const simpleGit = require('simple-git');

let mainWindow;
let isMaximized;

let serverProcess;
let directory; 

let settings;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const createWindow = () => {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 400,
    height: 375,
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
app.on('ready', () => {
  createBackupFolder();
  createWindow();
});

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
function createBackupFolder(){
  const backupDir = path.join(__dirname, 'backups');
  if (!fs.existsSync(backupDir)){
    fs.mkdirSync(backupDir);
  }
}

async function createWorldBackup() {
  const backupRootDir = path.join(__dirname, 'backups');
  const worldDirectory = path.join(directory, 'worlds', 'Bedrock level');

  try {
    // Ensure the backup root directory exists
    await fs.ensureDir(backupRootDir);

    // Generate a timestamp for the backup directory
    const dateTime = new Date().toLocaleString();
    const date = dateTime.replace(/\//g, '-').split(', ')[0];
    const time = dateTime.replace(/:/g, '-').split(', ')[1];
    const backupDirName = `backup_${date}-${time}`;
    const backupDir = path.join(backupRootDir, backupDirName);

    // Ensure the specific backup directory exists
    await fs.ensureDir(backupDir);

    // Copy the entire contents of the world directory to the backup directory
    await fs.copy(worldDirectory, backupDir);
  } catch (error) {
    console.error('Error creating backup:', error);
  }
}

ipcMain.handle('server-handler', async (req, data) => {
  if (!data || !data.request) return;
  switch (data.request){
    case 'Start':
      await getWorldRepo(data.directory);
      startServer(data.directory);
      directory = data.directory;
      break;
    case 'Stop':
      stopServer(data.directory);
      break;
  }
});

ipcMain.on('server-status', (event, status) => {
  mainWindow.webContents.send('server-status', status);
});

async function getWorldRepo(directory) {
  mainWindow.webContents.send('server-status', 'Gathering World Data');
  const worldDir = path.join(directory, 'worlds');
  const repoUrl = settings.repo;
  const username = repoUrl.split('/')[3];
  const accessToken = settings.accessToken;

  const git = simpleGit(worldDir);

  try {
    const isRepo = await git.checkIsRepo();
    if (!isRepo) {
      await git.init();
      await git.addConfig('user.name', username);
      await git.addConfig('user.email', `${username}@example.com`);
      const remoteUrlWithToken = repoUrl.replace('https://', `https://${username}:${accessToken}@`);
      await git.addRemote('origin', remoteUrlWithToken);
      await git.fetch('origin', 'main', ['--tags']);
      await git.raw(['symbolic-ref', 'HEAD', 'refs/heads/main']);
      await git.raw(['branch', '-m', 'main']);
      await git.reset(['--hard', 'origin/main']);
      console.log('Fetched and reset to remote history');
    }
  } catch (error) {
    console.error('Error in getWorldRepo:', error);
  }
}



async function updateWorldRepo() {
  mainWindow.webContents.send('server-status', 'Creating Local Backup');
  createWorldBackup();
  mainWindow.webContents.send('server-status', 'Uploading World Data');
  const worldDir = path.join(directory, 'worlds');
  const repoUrl = settings.repo;
  const username = repoUrl.split('/')[3];
  const accessToken = settings.accessToken;

  const git = simpleGit(worldDir);
 
  try {
    await git.add('.');
    await git.commit('Update worlds folder');
    const remoteUrlWithToken = repoUrl.replace('https://', `https://${username}:${accessToken}@`);
    const remoteMain = await git.getRemotes(true).then(remotes => remotes.find(remote => remote.name === 'main'));
    if (remoteMain) {
      await git.removeRemote('main');
    }
    await git.addRemote('main', remoteUrlWithToken);
    await git.push(['-u', 'main', 'main', '--force']);
    console.log('Success');
    mainWindow.webContents.send('server-status', 'Upload Success');
  } catch (error) {
    console.error('Error committing and pushing changes:', error.message);
  }
}

function stopServer(){
  if (serverProcess.stdin) {
    mainWindow.webContents.send('server-status', 'Stopping Server');
    serverProcess.stdin.write('stop\n');
  } else {
    console.error('Error: stdin is null');
  }
}

function startServer(directory) {
  const serverDir = path.join(directory, 'bedrock_server.exe');
  serverProcess = spawn(serverDir, {
    stdio: ['pipe', 'pipe', 'pipe'], // Enable stdin, stdout, and stderr
  });

  serverProcess.stdout.on('data', (data) => {
    if (data.includes('Starting')){
      mainWindow.webContents.send('server-status', 'Starting');
    } 
    if (data.includes('started')){
      mainWindow.webContents.send('server-status', 'Online');
    }
    if (data.includes('Quit')){
      mainWindow.webContents.send('server-status', 'Offline');
    }
    // Process stdout data here
  });

  serverProcess.stderr.on('data', (data) => {
    console.error(`stderr: ${data}`);
  });

  serverProcess.on('error', (err) => {
    console.error('Error starting server process:', err);
  });

  serverProcess.on('close', (code) => {
    console.log(`Server process exited with code ${code}`);
    updateWorldRepo();
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
      mainWindow.webContents.send('server-status', 'Viewing Gist');
      const viewInfo = viewGist(data.gistID, data.accessToken);
      return viewInfo;
    case 'Update':
      mainWindow.webContents.send('server-status', 'Updating');
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
    settings = JSON.parse(settingsContent);
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


const { app, BrowserWindow, ipcMain, dialog, globalShortcut, clipboard } = require('electron');
const { autoUpdater } = require('electron-updater');

const path = require('path');
const fs = require('fs-extra');
const axios = require('axios');
const { spawn } = require('child_process');
const simpleGit = require('simple-git');
const archiver = require('archiver');
const { exec } = require('child_process');

if (require('electron-squirrel-startup')) return;
app.setAppUserModelId('com.squirrel.programmingKyle.zerocraft-sync');

let mainWindow;
let isMaximized;
let serverProcess; //Minecraft Server Terminal
let directory; 
let settings;
let allowClose = true;

let terminalWindow;
let terminalOpen;

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

  mainWindow.on('close', (event) => {
    if (!allowClose) {
      event.preventDefault();  // Prevent the window from closing
    }
  });

  mainWindow.once('ready-to-show', () => {
    mainWindow.webContents.send('auto-updater-callback', 'Tryinig');  
    if (app.isPackaged) {
      mainWindow.webContents.send('auto-updater-callback', 'App is Packaged');
      autoUpdater.setFeedURL({
        provider: 'github',
        owner: 'programmingKyle',
        repo: 'zerocraft-sync',
      });
      autoUpdater.checkForUpdates();
      mainWindow.webContents.send('auto-updater-callback', 'Checking');  
    }
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', () => {
  createBackupFolder();
  createWindow();

  if (handleSquirrelEvent()) {
    return;
  }

  globalShortcut.register('CommandOrControl+R', () => {
    return;
  });
});

autoUpdater.on('checking-for-update', () => {
  mainWindow.webContents.send('auto-updater-callback', 'Checking for Update');
});

autoUpdater.on('update-available', () => {
  mainWindow.webContents.send('auto-updater-callback', 'Update Available');
});

autoUpdater.on('update-not-available', () => {
  mainWindow.webContents.send('auto-updater-callback', 'No Updates Available');
});

autoUpdater.on('update-downloaded', () => {
  mainWindow.webContents.send('auto-updater-callback', 'Update Downloaded');
  ensureSafeQuitAndInstall()
});

function ensureSafeQuitAndInstall() {
  setImmediate(() => {
    app.removeAllListeners("window-all-closed")
    if (mainWindow != null) {
      mainWindow.close()
    }
    autoUpdater.quitAndInstall(false)
  })
}

autoUpdater.on('error', (error) => {
  mainWindow.webContents.send('auto-updater-callback', `Update check error: ${error.message}`);
});



function handleSquirrelEvent() {
  if (process.argv.length === 1) {
    return false;
  }

  const ChildProcess = require('child_process');

  const appFolder = path.resolve(process.execPath, '..');
  const rootAtomFolder = path.resolve(appFolder, '..');
  const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
  const exeName = path.basename(process.execPath);

  const spawn = function(command, args) {
    let spawnedProcess, error;

    try {
      spawnedProcess = ChildProcess.spawn(command, args, {detached: true});
    } catch (error) {}

    return spawnedProcess;
  };

  const spawnUpdate = function(args) {
    return spawn(updateDotExe, args);
  };

  const squirrelEvent = process.argv[1];
  switch (squirrelEvent) {
    case '--squirrel-install':
    case '--squirrel-updated':
      // Optionally do things such as:
      // - Add your .exe to the PATH
      // - Write to the registry for things like file associations and
      //   explorer context menus

      // Install desktop and start menu shortcuts
      spawnUpdate(['--createShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-uninstall':
      // Undo anything you did in the --squirrel-install and
      // --squirrel-updated handlers

      // Remove desktop and start menu shortcuts
      spawnUpdate(['--removeShortcut', exeName]);

      setTimeout(app.quit, 1000);
      return true;

    case '--squirrel-obsolete':
      // This is called on the outgoing version of your app before
      // we update to the new version - it's the opposite of
      // --squirrel-updated

      app.quit();
      return true;
  }
};

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
ipcMain.handle('close-app', () => {
  app.quit();
});

ipcMain.handle('required-loopback', async() => {
  try {
    const result = await checkMinecraftLoopback();
    if (!result) {
      const enableResults = await enableMinecraftLoopback();
      return 'enabled';
    } else {
      return 'exists';
    }
  } catch (error) {
    return 'error';
  }
});

async function enableMinecraftLoopback() {
  return new Promise((resolve, reject) => {
    exec('CheckNetIsolation.exe LoopbackExempt -a -p=S-1-15-2-1958404141-86561845-1752920682-3514627264-368642714-62675701-733520436', (error, stdout, stderr) => {
      if (error) {
        reject('Application needs to be run in Administrator');
        return;
      } else {
        resolve(stdout);
      }
    });
  });
}

async function checkMinecraftLoopback() {
  return new Promise((resolve, reject) => {
    exec('CheckNetIsolation.exe LoopbackExempt -s', (error, stdout, stderr) => {
      if (error) {
        console.error(`Error: ${error.message}`);
        reject(error.message);
        return;
      }
      const mcLoopback = stdout.split('\n').map(line => line.trim()).filter(line => line !== '');
      includesLoopback = false;
      mcLoopback.forEach(line => {
        if (line.includes('Name: microsoft.minecraft')){
          includesLoopback = true;
        }
      });
      resolve(includesLoopback);
    });
  });
}



ipcMain.handle('paste-settings-clipboard', () => {
  const clipboardData = clipboard.readText();
  return clipboardData;
});

ipcMain.handle('check-and-close-terminal', () => {
  if (terminalOpen){
    terminalWindow.close();
    terminalOpen = false;
  }
});

ipcMain.handle('send-terminal', async (req, data) => {
  if (!data || !data.message) return;
  if (serverProcess && serverProcess.stdin){
    serverProcess.stdin.write(data.message + '\n');
  }
});

function openTerminalWindow(){
  terminalWindow = new BrowserWindow({
    width: 600,
    height: 400,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
    },
  });
  terminalWindow.loadFile(path.join(__dirname, 'consoleWindow.html'));

  terminalWindow.on('close', (event) => {
    terminalOpen = false;
  });
}

ipcMain.handle('toggle-terminal', () => {
  if (!terminalOpen){
    terminalOpen = true;
    openTerminalWindow();
  } else {
    terminalOpen = false;
    terminalWindow.close();
  }
});

function createBackupFolder() {
  const userDataPath = app.getPath('userData');
  const backupDir = path.join(userDataPath, 'backups');

  try {
    if (!fs.existsSync(backupDir)) {
      fs.mkdirSync(backupDir);
    }
  } catch (error) {
    console.error('Error creating backup directory:', error.message);
  }
}

async function createWorldBackup() {
  const userDataPath = app.getPath('userData');
  const backupRootDir = path.join(userDataPath, 'backups');
  const worldDirectory = path.join(directory, 'worlds', 'Bedrock level');

  try {
    // Ensure the backup root directory exists
    await fs.ensureDir(backupRootDir);

    // Generate a timestamp for the backup directory
    const dateTime = new Date().toLocaleString();
    const date = dateTime.replace(/\//g, '-').split(', ')[0];
    const time = dateTime.replace(/:/g, '-').split(', ')[1];
    const backupDirName = `backup_${date}-${time}.zip`;
    const backupDir = path.join(backupRootDir, backupDirName);

    const output = fs.createWriteStream(backupDir);
    const archive = archiver('zip', {
      zlib: { level: 9 }
    });
    archive.pipe(output);
    archive.directory(worldDirectory, false);
    await archive.finalize();
    output.end();
  } catch (error) {
    console.error('Error creating backup:', error);
  }
}

ipcMain.handle('server-handler', async (req, data) => {
  if (!data || !data.request) return;
  switch (data.request){
    case 'Start':
      allowClose = false;
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
  if (!fs.existsSync(worldDir)) {
    fs.mkdirSync(worldDir);
  }
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
      await git.raw(['symbolic-ref', 'HEAD', 'refs/heads/main']);
      await git.raw(['branch', '-m', 'main']);
      await git.fetch('origin', 'main', ['--tags', '--depth=1']);
      await git.reset(['--hard', 'origin/main']);
      await git.push(['-u', 'origin', 'main']);
      await git.raw(['gc']);
    } else {
      const remote = await git.getRemotes(true /* get more details */);
      const expectedRemoteUrl = repoUrl.replace('https://', `https://${username}:${accessToken}@`);    
      if (remote && remote.length > 0 && remote[0].refs.push === expectedRemoteUrl) {
        await git.fetch('origin', 'main', ['--tags']);
        await git.reset(['--hard', 'origin/main']);
        await git.raw(['gc']);
      } else {
        console.error('This is not the expected repo. Please check the remote URL.');
      }
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
    mainWindow.webContents.send('server-status', 'Upload Success');
    allowClose = true;
  } catch (error) {
    console.error('Error committing and pushing changes:', error.message);
  }
}

async function stopServer() {
  if (serverProcess && serverProcess.stdin) {
    mainWindow.webContents.send('server-status', 'Stopping Server');
    // serverProcess.stdin.write('stop\n');
    serverProcess.stdin.write('tellraw @a {"rawtext":[{"text":"Server is shutting down in 10 seconds"}]}\n');
    await countdown(10);
    serverProcess.stdin.write('stop\n');
  } else {
    console.error('Error: stdin is null');
  }
}

async function countdown(number) {
  while (number >= 0) {
    if (serverProcess && serverProcess.stdin) {
      serverProcess.stdin.write(`tellraw @a {"rawtext":[{"text":"${number}"}]}\n`);
      mainWindow.webContents.send('server-status', `Shutting down in ${number}...`);
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
    number--;
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
    } else if (terminalOpen) {
      const textDecoder = new TextDecoder('utf-8');
      const decodedString = textDecoder.decode(data);
      terminalWindow.webContents.send('server-status', decodedString);
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
      return null;
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


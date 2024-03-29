const startServerButton_el = document.getElementById('startServerButton');
const stopServerButton_el = document.getElementById('stopServerButton');
const content_el = document.getElementById('content');
const consoleText_el = document.getElementById('consoleText');
const hostConsolePreview_el = document.getElementById('hostConsolePreview');
const startControls_el = document.getElementById('startControls');
const toggleTerminalButton_el = document.getElementById('toggleTerminalButton');
const refreshButton_el = document.getElementById('refreshButton');

const stopOverlay_el = document.getElementById('stopOverlay');
const stopOverlayContent_el = document.getElementById('stopOverlayContent');
const confirmStopButton_el = document.getElementById('confirmStopButton');
const cancelStopButton_el = document.getElementById('cancelStopButton');

let serverOnline = false;
let isHost = false;
let canRefresh = true;

function isServerOnline(){
    if (gist.status === 'ONLINE'){
        serverOnline = true;
        startServerButton_el.style.display = 'none';
        if (!isHost){
            stopServerButton_el.style.display = 'none';
        } else {
            stopServerButton_el.style.display = 'block';
        }
    } else {
        serverOnline = false;
        stopServerButton_el.style.display = 'none';
        const canHost = canHostCheck();
        if (canHost){
            startServerButton_el.style.display = 'block';
        }
    }
}

function toggleServerStatus(){
    if (!serverOnline){
        isHost = true;
        serverOnline = true;
    } else {
        if (isHost){
            isHost = false;
        }
        serverOnline = false;
    }
}

startServerButton_el.addEventListener('click', async () => {
    if (!serverOnline){
        toggleServerStatus();
        if (isHost){
            hostConsolePreview_el.style.display = 'grid';
            refreshButton_el.style.display = 'none';
        }
        startControls_el.style.gridTemplateColumns = '1fr';
        startControls_el.style.display = 'none';
        startServerButton_el.style.display = 'none';
        toggleOptionsButton_el.style.display = 'none';
        await getGist();
        if (gist.status === 'OFFLINE'){
            await updateGist();
            await api.serverHandler({request: 'Start', directory: settings.directory});
        } else {
            startServerButton_el.style.display = 'block';
            toggleOptionsButton_el.style.display = 'grid';
            startControls_el.style.display = 'grid';
        }
    }
});

stopServerButton_el.addEventListener('click', () => {
    stopOverlay_el.style.display = 'flex';
});

confirmStopButton_el.addEventListener('click', async () => {
    if (serverOnline && isHost){
        stopOverlay_el.style.display = 'none';
        toggleTerminalButton_el.style.display = 'none';
        startControls_el.style.display = 'none';
        stopServerButton_el.style.display = 'none';
        api.checkAndCloseTerminal();
        await getGist();
        hasUpdatedProperties = false;
        if (gist.status === 'ONLINE'){
            await api.serverHandler({request: 'Stop'});
        }
    }
});

cancelStopButton_el.addEventListener('click', () => {
    stopOverlay_el.style.display = 'none';
});

api.onServerStatusUpdate(async (status) => {
    consoleText_el.textContent = status;
    if (status === 'Online'){
        toggleTerminalButton_el.style.display = 'block';
        startControls_el.style.display = 'grid';
        stopServerButton_el.style.display = 'block';
    }
    if (status === 'Upload Success'){
        await updateGist();
        setTimeout(() => {
            startControls_el.style.display = 'grid';
            startControls_el.style.gridTemplateColumns = 'auto auto 1fr';
            hostConsolePreview_el.style.display = 'none';
            startServerButton_el.style.display = 'block';
            toggleOptionsButton_el.style.display = 'block';
            refreshButton_el.style.display= 'block';
        }, 1000);
    }
});

toggleTerminalButton_el.addEventListener('click', () => {
    api.toggleTerminal();
});

refreshButton_el.addEventListener('click', async () => {
    if (canRefresh){
        refreshButton_el.classList.add('disable');
        canRefresh = false;
        await getGist();
        refreshTimeout();
    }
});

function refreshTimeout(){
    if (!canRefresh){
        setTimeout(() => {
            canRefresh = true;
            refreshButton_el.classList.remove('disable');
        }, 5000);    
    }
}
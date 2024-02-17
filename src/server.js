const startServerButton_el = document.getElementById('startServerButton');
const stopServerButton_el = document.getElementById('stopServerButton');
const content_el = document.getElementById('content');
const consoleText_el = document.getElementById('consoleText');

let serverOnline = false;
let isHost = false;

function isServerOnline(){
    if (gist.status === 'ONLINE'){
        serverOnline = true;
        startServerButton_el.style.display = 'none';
        if (!isHost){
            stopServerButton_el.style.display = 'none';
        }
    } else {
        serverOnline = false;
        stopServerButton_el.style.display = 'none';
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
            consoleText_el.style.display = 'grid';
        }
        startServerButton_el.style.display = 'none';
        await getGist();
        if (gist.status === 'OFFLINE'){
            await updateGist();
            await api.serverHandler({request: 'Start', directory: settings.directory});
        } else {
            startServerButton_el.style.display = 'grid';
        }
    }
});

stopServerButton_el.addEventListener('click', async () => {
    if (serverOnline && isHost){
        stopServerButton_el.style.display = 'none';
        await getGist();
        if (gist.status === 'ONLINE'){
            await updateGist();
            await api.serverHandler({request: 'Stop'});
        }
    }
});

api.onServerStatusUpdate((status) => {
    consoleText_el.textContent = status;
    if (status === 'Online'){
        stopServerButton_el.style.display = 'block';
    }
    if (status === 'Upload Success'){
        setTimeout(() => {
            consoleText_el.style.display = 'none';
            startServerButton_el.style.display = 'block';
        }, 1000);
    }
})
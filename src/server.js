const startServerButton_el = document.getElementById('startServerButton');
const stopServerButton_el = document.getElementById('stopServerButton');
const content_el = document.getElementById('content');
const consoleText_el = document.getElementById('consoleText');

let serverOnline = false;
let isHost = true;

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
        startServerButton_el.style.display = 'none';
        stopServerButton_el.style.display = 'block';
        
    } else {
        if (isHost){
            isHost = false;
        }
        serverOnline = false;
        startServerButton_el.style.display = 'block';
        stopServerButton_el.style.display = 'none';
    }
}

startServerButton_el.addEventListener('click', async () => {
    if (!serverOnline){
        await getGist();
        if (gist.status === 'OFFLINE'){
            await updateGist();
            await api.serverHandler({request: 'Start', directory: settings.directory});
            if (isHost){
                consoleText_el.style.display = 'grid';
            }
        }
    }
});

stopServerButton_el.addEventListener('click', async () => {
    if (serverOnline && isHost){
        await getGist();
        if (gist.status === 'ONLINE'){
            await updateGist();
            await api.serverHandler({request: 'Stop'});
            if (consoleText_el.style.display = 'grid'){
                consoleText_el.style.display = 'none';
            }
        }
    }
});

api.onServerStatusUpdate((status) => {
    consoleText_el.textContent = status;
})
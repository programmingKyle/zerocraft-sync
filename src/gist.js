const serverStatusText_el = document.getElementById('serverStatusText');
const serverNameText_el = document.getElementById('serverNameText');
const serverIPText_el = document.getElementById('serverIPText');
const serverPortText_el = document.getElementById('serverPortText');

let gist;

async function getGist(){
    gist = await api.gistHandler({request: 'View', gistID: settings.gistID});
    populateInfo(gist);
}

async function populateInfo(data){
    serverStatusText_el.textContent = data.status;
    if (data.status === 'ONLINE'){
        serverStatusText_el.classList.add('online');
    }
    serverNameText_el.textContent = data.servername;
    serverIPText_el.textContent = data.ip;
    serverPortText_el.textContent = data.port;
}

async function updateGist(){
    const updatedContent = {
        "status": gist.status === 'OFFLINE' ? 'ONLINE' : 'OFFLINE',
        "servername": settings.serverName,
        "ip": settings.ip,
        "port": '3306'
    }
    await api.gistHandler({request: 'Update', gistID: settings.gistID, accessToken: settings.accessToken, updatedContent});
}
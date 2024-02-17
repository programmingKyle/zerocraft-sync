const serverStatusText_el = document.getElementById('serverStatusText');
const serverNameText_el = document.getElementById('serverNameText');
const serverIPText_el = document.getElementById('serverIPText');
const serverPortText_el = document.getElementById('serverPortText');

let gist;

async function getGist(){
    gist = await api.gistHandler({request: 'View', gistID: settings.gistID, accessToken: settings.accessToken});
    isServerOnline();
    await populateInfo(gist);
}

async function populateInfo(data){
    serverStatusText_el.textContent = data.status;
    if (data.status === 'ONLINE'){
        serverStatusText_el.classList.add('online');
    } else if (serverStatusText_el.classList.contains('online')){
        serverStatusText_el.classList.remove('online');
    }

    const dataValueHandler = (entry) => {
        const output = entry === null ? 'N/A' : entry;
        return output;
    }
    
    serverNameText_el.textContent = dataValueHandler(data.servername);
    serverIPText_el.textContent = dataValueHandler(data.ip);
    serverPortText_el.textContent = dataValueHandler(data.port);    
}

async function updateGist(){
    const updatedContent = {
        "status": gist.status === 'OFFLINE' ? 'ONLINE' : 'OFFLINE',
        "servername": gist.status === 'OFFLINE' ? settings.serverName : null,
        "ip": gist.status === 'OFFLINE' ? settings.ip : null,
        "port": gist.status === 'OFFLINE' ? '19132' : null
    }
    const updateSuccess = await api.gistHandler({request: 'Update', gistID: settings.gistID, accessToken: settings.accessToken, updatedContent});
    if (updateSuccess){
        await getGist();
    }
}
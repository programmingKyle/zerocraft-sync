const serverStatusText_el = document.getElementById('serverStatusText');
const serverNameText_el = document.getElementById('serverNameText');
const serverIPText_el = document.getElementById('serverIPText');
const serverPortText_el = document.getElementById('serverPortText');

let gist;

async function getGist(){
    gist = await api.gistHandler({request: 'View', gistID: settings.gistID, accessToken: settings.accessToken});
    await populateInfo(gist);
}

async function populateInfo(data){
    serverStatusText_el.textContent = data.status;
    if (data.status === 'ONLINE'){
        serverStatusText_el.classList.add('online');
    } else if (serverStatusText_el.classList.contains('online')){
        serverStatusText_el.classList.remove('online');
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
    const updateSuccess = await api.gistHandler({request: 'Update', gistID: settings.gistID, accessToken: settings.accessToken, updatedContent});
    if (updateSuccess){
        await getGist();
    }
}
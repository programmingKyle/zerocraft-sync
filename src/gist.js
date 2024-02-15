const serverStatusText_el = document.getElementById('serverStatusText');
const serverNameText_el = document.getElementById('serverNameText');
const serverIPText_el = document.getElementById('serverIPText');
const serverPortText_el = document.getElementById('serverPortText');

async function getGist(){
    const results = await api.gistHandler({request: 'View', gistId: settings.gistID});
    populateInfo(results);
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
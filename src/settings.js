const hostSettingsOverlay_el = document.getElementById('hostSettingsOverlay');
const settingsContent_el = document.getElementById('settingsContent');
const mediaTypeHeader_el = document.getElementById('mediaTypeHeader');
const serverTitleInput_el = document.getElementById('serverTitleInput');
const gistIDInput_el = document.getElementById('gistIDInput');
const accessTokenInput_el = document.getElementById('accessTokenInput');
const saveSettingsButton_el = document.getElementById('saveSettingsButton');
const backSettingsButton_el = document.getElementById('backSettingsButton');
const ipInput_el = document.getElementById('ipInput');
const repoLinkInput_el = document.getElementById('repoLinkInput');
const toggleOptionsButton_el = document.getElementById('toggleOptionsButton');
const pasteAllSettings_el = document.getElementById('pasteAllSettings');
const selectedDirectoryText_el = document.getElementById('selectedDirectoryText');
const selectDirectoryButton_el = document.getElementById('selectDirectoryButton');

let settings;

let serverDirectory = null;

const requiredInputs = [
    gistIDInput_el, accessTokenInput_el, gistIDInput_el
];

function requiredInputCheck() {
    let isValid = true; // Assume validity by default

    requiredInputs.forEach(element => {
        if (element.value.trim() === '') {
            element.classList.add('error');
            isValid = false;
            element.addEventListener('input', () => {
                element.classList.remove('error');
            });
        }
    });

    return isValid;
}


saveSettingsButton_el.addEventListener('click', async () => {
    if (!requiredInputCheck()){
        return;
    }
    const values = {
        serverName: serverTitleInput_el.value,
        repo: repoLinkInput_el.value,
        gistID: gistIDInput_el.value,
        accessToken: accessTokenInput_el.value,
        ip: ipInput_el.value,
        directory: selectedDirectoryText_el.textContent
    }

    await api.hostSettingsHandler({request: 'Add', settings: values});
    hostSettingsOverlay_el.style.display = 'none';

    settings = await api.hostSettingsHandler({request: 'Get'});

    if (settings !== null){
        await getGist();
    }

    const canHost = canHostCheck();
    if (canHost){
        await serverLoopback();
    } else if (gist.status === 'OFFLINE') {
        startServerButton_el.style.display = 'block';
    } else {
        startServerButton_el.style.display = 'none';
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    settings = await api.hostSettingsHandler({request: 'Get'});
    if (settings === null){
        selectUserTypeOverlay_el.style.display = 'flex';
        //settingsOverlay_el.style.display = 'flex';
    } else {
        await getGist();
        const canHost = canHostCheck();
        if (canHost){
            await serverLoopback();
        } else if (gist.status === 'OFFLINE'){
            startServerButton_el.style.display = 'block';
        }
        serverTitleInput_el.value = settings.serverName;
        repoLinkInput_el.value = settings.repo;
        gistIDInput_el.value = settings.gistID;
        accessTokenInput_el.value = settings.accessToken;
        ipInput_el.value = settings.ip;
        selectedDirectoryText_el.textContent = settings.directory;   
    }
});

function canHostCheck(){
    let canHost = true;
    const required = [settings.serverName, settings.repo, settings.gistID,
        settings.accessToken, settings.ip, settings.directory];
    required.forEach(element => {
        if (element === '' || element === null){
            canHost = false;
        }
    });  
    return canHost;
}

selectDirectoryButton_el.addEventListener('click', async () => {
    serverDirectory = await api.selectDirectory();
    if (serverDirectory){
        selectedDirectoryText_el.textContent = serverDirectory;
    }
});

toggleOptionsButton_el.addEventListener('click', () => {
    hostSettingsOverlay_el.style.display = 'flex';
    selectedHost_el.style.display = 'none';
    hostSettingsSpecifics_el.style.display = 'grid';
    backSettingsButton_el.style.display = 'block';
});

backSettingsButton_el.addEventListener('click', () => {
    hostSettingsOverlay_el.style.display = 'none';
    serverTitleInput_el.value = settings.serverName;
    repoLinkInput_el.value = settings.repo;
    gistIDInput_el.value = settings.gistID;
    accessTokenInput_el.value = settings.accessToken;
    ipInput_el.value = settings.ip;
    selectedDirectoryText_el.value = settings.directory;
});

pasteAllSettings_el.addEventListener('click', async () => {
    const clipboardValues = JSON.parse(await api.pasteSettingsClipboard());
    repoLinkInput_el.value = clipboardValues.repo;
    gistIDInput_el.value = clipboardValues.gistID;
    accessTokenInput_el.value = clipboardValues.accessToken;
});






// Select User
const selectUserTypeOverlay_el = document.getElementById('selectUserTypeOverlay');
const selectUserButton_el = document.getElementById('selectUserButton');
const selectHostButton_el = document.getElementById('selectHostButton');
const pasteHostDataButton_el = document.getElementById('pasteHostDataButton');
const specificHostDataButton_el = document.getElementById('specificHostDataButton');

// Overlay Content
const selectedHost_el = document.getElementById('selectedHost');
const hostSettingsSpecifics_el = document.getElementById('hostSettingsSpecifics');

selectUserButton_el.addEventListener('click', () => {
    selectUserTypeOverlay_el.style.display = 'none';
});

selectHostButton_el.addEventListener('click', () => {
    selectUserTypeOverlay_el.style.display = 'none';
    hostSettingsOverlay_el.style.display = 'flex';
});

pasteHostDataButton_el.addEventListener('click', async () => {
    selectedHost_el.style.display = 'none';
    hostSettingsSpecifics_el.style.display = 'grid';
    const clipboardValues = JSON.parse(await api.pasteSettingsClipboard());
    repoLinkInput_el.value = clipboardValues.repo;
    gistIDInput_el.value = clipboardValues.gistID;
    accessTokenInput_el.value = clipboardValues.accessToken;
});

specificHostDataButton_el.addEventListener('click', () => {
    selectedHost_el.style.display = 'none';
    hostSettingsSpecifics_el.style.display = 'grid';
});
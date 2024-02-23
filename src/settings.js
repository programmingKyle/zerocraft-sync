const settingsOverlay_el = document.getElementById('settingsOverlay');
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
        directory: serverDirectory
    }

    await api.hostSettingsHandler({request: 'Add', settings: values});
    settingsOverlay_el.style.display = 'none';

    settings = await api.hostSettingsHandler({request: 'Get'});

    const canHost = canHostCheck();
    if (canHost){
        startServerButton_el.style.display = 'block';
    } else {
        startServerButton_el.style.display = 'none';
    }

    if (settings !== null){
        await getGist();
    }
});

document.addEventListener('DOMContentLoaded', async () => {
    settings = await api.hostSettingsHandler({request: 'Get'});
    if (settings === null){
        settingsOverlay_el.style.display = 'flex';
    } else {
        await getGist();
        const canHost = canHostCheck();
        if (canHost){
            startServerButton_el.style.display = 'block';
        }
        serverTitleInput_el.value = settings.serverName;
        repoLinkInput_el.value = settings.repo;
        gistIDInput_el.value = settings.gistID;
        accessTokenInput_el.value = settings.accessToken;
        ipInput_el.value = settings.ip;
        selectedDirectoryText_el.value = settings.directory;    
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
    settingsOverlay_el.style.display = 'flex';
    backSettingsButton_el.style.display = 'block';
});

backSettingsButton_el.addEventListener('click', () => {
    settingsOverlay_el.style.display = 'none';
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
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

let hideHostSettings = false;

const requiredInputs = [
    gistIDInput_el, accessTokenInput_el
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
        serverName: serverTitleInput_el.value.trim() || null,
        repo: repoLinkInput_el.value.trim() || null,
        gistID: gistIDInput_el.value.trim() || null,
        accessToken: accessTokenInput_el.value.trim() || null,
        ip: ipInput_el.value.trim() || null,
        directory: selectedDirectoryText_el.textContent.trim() || null
    };

    await api.hostSettingsHandler({request: 'Add', settings: values});
    settingsOverlay_el.style.display = 'none';

    toggleHostInputs('block');

    settings = await api.hostSettingsHandler({request: 'Get'});

    if (settings !== null){
        await getGist();
    }

    const canHost = canHostCheck();
    if (canHost){
        await serverLoopback();
    } else if (canHost && gist.status === 'OFFLINE') {
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
        } else if (canHost && gist.status === 'OFFLINE'){
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
    settingsOverlay_el.style.display = 'flex';
    selectedHost_el.style.display = 'none';
    hostSettingsSpecifics_el.style.display = 'grid';
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






// Select User
const selectUserTypeOverlay_el = document.getElementById('selectUserTypeOverlay');
const selectUserButton_el = document.getElementById('selectUserButton');
const selectHostButton_el = document.getElementById('selectHostButton');
const pasteHostDataButton_el = document.getElementById('pasteHostDataButton');
const specificHostDataButton_el = document.getElementById('specificHostDataButton');
const pasteUserDataButton_el = document.getElementById('pasteUserDataButton');
const specificUserDataButton_el = document.getElementById('specificUserDataButton');

// Overlay Content
const selectedHost_el = document.getElementById('selectedHost');
const selectedUser_el = document.getElementById('selectedUser');
const hostSettingsSpecifics_el = document.getElementById('hostSettingsSpecifics');

// Back Buttons
const backUserButton_el = document.getElementById('backUserButton');
const backHostButton_el = document.getElementById('backHostButton');

selectUserButton_el.addEventListener('click', () => {
    selectUserTypeOverlay_el.style.display = 'none';
    settingsOverlay_el.style.display = 'flex';
    selectedUser_el.style.display = 'grid';
});

selectHostButton_el.addEventListener('click', () => {
    selectUserTypeOverlay_el.style.display = 'none';
    settingsOverlay_el.style.display = 'flex';
    selectedHost_el.style.display = 'grid';
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

pasteUserDataButton_el.addEventListener('click', async () => {
    selectedUser_el.style.display = 'none';
    hostSettingsSpecifics_el.style.display = 'grid';
    toggleHostInputs('none');
    const clipboardValues = JSON.parse(await api.pasteSettingsClipboard());
    gistIDInput_el.value = clipboardValues.gistID;
    accessTokenInput_el.value = clipboardValues.accessToken;
});

specificUserDataButton_el.addEventListener('click', () => {
    toggleHostInputs('none');
    selectedUser_el.style.display = 'none';
    hostSettingsSpecifics_el.style.display = 'grid';
});

function toggleHostInputs(display){
    hideHostSettings = display === 'none' ? true : false;
    console.log(hideHostSettings);
    const hostInputs = [serverTitleInput_el, repoLinkInput_el, ipInput_el, selectedDirectoryText_el, selectDirectoryButton_el]
    hostInputs.forEach(element => {
        element.style.display = display;
    });    
}

backUserButton_el.addEventListener('click', () => {
    settingsOverlay_el.style.display = 'none';;
    selectedUser_el.style.display = 'none';
    selectUserTypeOverlay_el.style.display = 'flex';
});

backHostButton_el.addEventListener('click', () => {
    settingsOverlay_el.style.display = 'none';
    selectedHost_el.style.display = 'none';
    selectUserTypeOverlay_el.style.display = 'flex';
});
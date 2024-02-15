const settingsOverlay_el = document.getElementById('settingsOverlay');
const settingsContent_el = document.getElementById('settingsContent');
const mediaTypeHeader_el = document.getElementById('mediaTypeHeader');
const serverTitleInput_el = document.getElementById('serverTitleInput');
const gistIDInput_el = document.getElementById('gistIDInput');
const accessTokenInput_el = document.getElementById('accessTokenInput');
const saveSettingsButton_el = document.getElementById('saveSettingsButton');
const backSettingsButton_el = document.getElementById('backSettingsButton');
const ipInput_el = document.getElementById('ipInput');

let settings;

saveSettingsButton_el.addEventListener('click', async () => {
    const values = {
        serverName: serverTitleInput_el.value,
        gistID: gistIDInput_el.value,
        accessToken: accessTokenInput_el.value,
        ip: ipInput_el.value
    }

    await api.hostSettingsHandler({request: 'Add', settings: values});
    settingsOverlay_el.style.display = 'none';
});

document.addEventListener('DOMContentLoaded', async () => {
    settings = await api.hostSettingsHandler({request: 'Get'});
    if (settings === null){
        settingsOverlay_el.style.display = 'flex';
    } else {
        await getGist();
    }
});

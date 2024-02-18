const consoleContent_el = document.getElementById('consoleContent');
const consoleTextInput_el = document.getElementById('consoleTextInput');
const consoleSendButton_el = document.getElementById('consoleSendButton');

consoleSendButton_el.addEventListener('click', async () => {
    if (consoleTextInput_el.value.toLowerCase() === 'stop') {
        return;
    } else {
        await api.sendTerminal({message: consoleTextInput_el.value});
    }
    consoleTextInput_el.value = '';
});

api.onServerStatusUpdate((status) => {
    const messageText_el = document.createElement('span');
    messageText_el.classList.add('console-message')
    messageText_el.textContent = status;
    consoleContent_el.append(messageText_el);
})

document.addEventListener('keydown', async (e) => {
    let keyPress = e.key;
    if (keyPress === 'Enter' && consoleTextInput_el.value !== 'stop' || ''){
        await api.sendTerminal({message: consoleTextInput_el.value});
    }
    consoleTextInput_el.value = '';
})
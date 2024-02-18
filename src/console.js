const consoleContent_el = document.getElementById('consoleContent');

api.onServerStatusUpdate((status) => {
    const messageText_el = document.createElement('span');
    messageText_el.classList.add('console-message')
    messageText_el.textContent = status;
    consoleContent_el.append(messageText_el);
})

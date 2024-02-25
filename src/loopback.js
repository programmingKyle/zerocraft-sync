const loopbackOverlay_el = document.getElementById('loopbackOverlay');
const retryLoopbackButton_el = document.getElementById('retryLoopbackButton');
const exitLoopbackButton_el = document.getElementById('exitLoopbackButton');

async function serverLoopback(){
    const loopbackResult = await api.requiredLoopback();
    console.log(loopbackResult);
    if (loopbackResult === 'error'){
        loopbackOverlay_el.style.display = 'flex';
    }
}

retryLoopbackButton_el.addEventListener('click', () => {

});

exitLoopbackButton_el.addEventListener('click', async () => {
    await api.closeApp();
});
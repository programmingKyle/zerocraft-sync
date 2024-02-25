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
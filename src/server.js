const startServerButton_el = document.getElementById('startServerButton');
const stopServerButton_el = document.getElementById('stopServerButton');

let serverOnline = false;

function isServerOnline(){
    if (gist.status === 'ONLINE'){
        serverOnline = true;
        startServerButton_el.style.display = 'none';
    } else {
        serverOnline = false;
        stopServerButton_el.style.display = 'none';
    }
}

function toggleServerStatus(){
    if (!serverOnline){
        serverOnline = true;
        startServerButton_el.style.display = 'none';
        stopServerButton_el.style.display = 'block';
    } else {
        serverOnline = false;
        startServerButton_el.style.display = 'block';
        stopServerButton_el.style.display = 'none';
    }
}

startServerButton_el.addEventListener('click', async () => {
    if (!serverOnline){
        await getGist();
        if (gist.status === 'OFFLINE'){
            await updateGist();
        }
    }
});

stopServerButton_el.addEventListener('click', async () => {
    if (serverOnline){
        await getGist();
        if (gist.status === 'ONLINE'){
            console.log('Come on');
            await updateGist();
        }
    }
});
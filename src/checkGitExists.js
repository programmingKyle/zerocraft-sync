const gitOverlay_el = document.getElementById('gitOverlay');
const gitStatusText_el = document.getElementById('gitStatusText');
const gitOKButton_el = document.getElementById('gitOKButton');

async function checkifGitExists(){
    const checkGit = await api.checkGitExists();
    if (!checkGit){
        gitOverlay_el.style.display = 'flex';
        const installStatus = await api.installGit();
        console.log(installStatus);
        gitStatusText_el.textContent = 'Git Installation Complete. Thank you!'
        gitOKButton_el.style.display = 'block';
    }
}

gitOKButton_el.addEventListener('click', () => {
    gitOverlay_el.style.display = 'none';
});
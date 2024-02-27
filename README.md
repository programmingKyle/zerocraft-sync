# Zerocraft Sync

Zerocraft Sync is committed to providing users with a smooth and effortless experience. By harnessing the capabilities of Zerotier VPN and GitHub, we've implemented a solution that enables Minecraft Bedrock hosts to seamlessly synchronize world data. No longer do users have to wait for a specific host to access their desired world data. With our application, users can initiate the process, and their world data will be automatically stored in a GitHub repository to be used later when starting up the server.

## Features

- **Sync World Data:** Effortlessly save and download world data to keep up to date no matter who is hosting!
- **Server Status:** Easy way to view if server is currently online and being hosted.
- **Easy Start and Stop:** Streamline server management with quick-access buttons, making it easy to initiate and halt your server as needed.
- **Server Shutdown Countdown:** Clients on the server will be given a 10 second warning and a countdown letting others know the server is going down.
- **Console:** Toggle the console view for a detailed rendering of the bedrock_console, giving you direct access to server commands.

## Getting Started

### Prerequisites
- node.js

### Dependencies
- archiver
- axios
- simple-git

## Requirements for Server Setup
** Only need to do this once per server**
- Github Account
- Github Repository (for world data, can be whatever name you want)
- Github Gist (this will store the server_status.json)
- Github Access Token (That can edit Gist and Repository)
- Minecraft Bedrock Dedicated Server (download this from the Minecraft website)

### Installation
Clone this repository: https://github.com/programmingKyle/zerocraft-sync
cd zerocraft-sync
npm install

### Github Setup
** Remember this only has to be done once per server this is just a way for all your hosts to have the same information **
Recommended you create a new Github account for your server. You will be giving an access token to whoever else you want to host.
- Register account
- Login to Github
- Create a repository with desired name
  - Here you can go ahead and upload your worlds/Bedrock level folder (there should only be the Bedrock level folder in the repo)
- Create a Github Gist for the server_status.json and add contents
<details>
  <summary>server_status.json file contents</summary>
  <pre>
{
  "status": "OFFLINE",
  "servername": null,
  "ip": null,
  "port": null
}
  </pre>
</details>


### How to Setup Access Token
- Login to Github
- Click profile picture
- Click Settings
- Scroll down and click Developer Settings
- Click Tokens(classic)
- Click Generate new token
- Next check "repo" giving full control of private repositories.
- Check "gist" giving control to your private gists as well
- Access Token's expiration is up to you.
- Save and put the code in a place you'll rememeber.

## How To Use
First in the zerocraft-sync directory open a terminal and input 'npm start'.
From there user will be prompted to input server settings. Fill out all inputs and then click save. From there you can use the start and stop button.

### How To Use Console 
When you are the host and the server is online there will be a console toggle button to the right of the server messages. There it will open a new window where you can use the console just like bedrock_server.exe. The only command that isn't accepted is 'stop' for obvious reasons.

### Thank you
If everything is filled out correctly and setup you should see changes happening to the gist and repo as you start and stop the server.
Thank you for checking out Zerocraft Sync. Any contributions are welcome.
If you have issues feel free to send a message!


![Screenshot 2024-02-18 173326](https://github.com/programmingKyle/zerocraft-sync/assets/155344874/c11cb37c-3f42-41b1-bc96-5e2c1719af7c)

### Warning When Downloading the Release Installer:
You will get a suspicious download warning. This app is not signed, can be removed if you package it yourself.
![Screenshot 2024-02-27 152254](https://github.com/programmingKyle/zerocraft-sync/assets/155344874/378c8a9c-4e1b-4f70-8489-6477d8a2d8dd)
![Screenshot 2024-02-27 152259](https://github.com/programmingKyle/zerocraft-sync/assets/155344874/7a787027-7936-4889-8618-4a889980bd07)


### Pictures

![Screenshot 2024-02-27 152546](https://github.com/programmingKyle/zerocraft-sync/assets/155344874/66ac6da9-725e-4932-8c4c-50145e3d250a)
![Screenshot 2024-02-27 152238](https://github.com/programmingKyle/zerocraft-sync/assets/155344874/086250b9-38c6-4b48-8241-2d6952400f78)
![Screenshot 2024-02-27 151948](https://github.com/programmingKyle/zerocraft-sync/assets/155344874/f099a182-5247-44e8-9515-b8e95d63f8ba)








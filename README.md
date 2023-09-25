# Description <br>

This backend server decides the ranking and sends reward tokens to the user's wallet.
So the user doesn't need to call transactions from his wallet to receive a reward.
<br>
In the crypto betting game, it is really important to decide the winner correctly and prevent ranking manipulation by players.
This server is listening to the Photon server application and decides the ranking from the events that are sent from the Photon application.
<br>
As you know, the player can't access the Photon server application so I am sure the player can't manipulate his ranking on the client side.
<br>
I have done this logic in this server perfectly.

---
# The live games that are using this backend
- Crypto Betting Racing game <br>
https://jeipi-ha.itch.io/ametarace 

- Land-taking strategy game  <br>
https://jeipi-ha.itch.io/ameta

---

- Photon Application Setting<br>

    <img src = "https://github.com/JinDev627/metarepo/blob/main/AmetaConqueror/Screenshot%202022-09-16%20101809.png" style="width: 300px"/> 
    <img src = "https://github.com/JinDev627/metarepo/blob/main/AmetaConqueror/Screenshot%202022-09-16%20101802.png" style="width: 300px"/> 

# Building & Run

	1.	Download Node backend source code
		The latest source code of backend is here.
		https://github.com/JinDev627/Backend-for-crypto-betting-game
		You have to download source project and place the source code on the server’s PC at any folder.

	2.	Update configuration for your wallet.
		All configuration settings are in the “.env” file.
 
		WALLET_PRIVATE_KEY: The private key of the admin wallet. All game reward are constructed on this wallet.
		WALLET_ADDRESS : The wallet address of the admin wallet.
		TOKEN_CONTRACT_ADDRESS: The AMETA token contract address. There are 2 lines for the contract address. If you are testing on testnet, you can comment the mainnet line and uncomment the testnet line.
		PROVIDER_URL: The provider URL to make JsonRPC Provider. There are 2 lines for the provider url. You can comment/uncomment lise for the mainnet/testnet.

	3.	Install NodeJS/NPM on the server.
		-	Install NodeJS/NPM on Windows server.
			https://nodejs.org/en/download/
			You can download NodeJS/NPM installer here. If you are having 64bit windows OS, you have to download 64 bit installer else you have to download 32bit installer.

		-	Install NodeJS /NPM on Ubunt server.

			o	sudo apt update
			o	sudo apt-get install nodejs
			o	sudo apt install npm

	4.	Install PM2 on the server.
		-	Install PM2 on Windows server.
			o	npm install pm2 -g

		-	Install PM2 on Ubunt server
			o	sudo npm install -g pm2

	5.	Run the backend server
		-	Go to the folder that backend code are placed.
		-	Install packages.
			o	npm install
			
		-	Start backend services
			o	pm2 start index.js
			
		-	enable backend autorun
			o	pm2 save
			
		-	check backend logs.
			o	Pm2 logs –lines 100
			

	All done.
	The current backend project enables the SSL certification for the “api.ametaverse.io” domain.
	After run the backend service, the all what you need to is set the IP address of the subdomain, “api.ametaverse.io”

var http = require('http');
var express = require('express');
var https = require('https');
var fs = require('fs');
var app = express();
var bodyParser = require('body-parser');
const { ethers } = require('ethers');
var Mutex = require('async-mutex').Mutex;
require("dotenv").config();
path = require('path');
app.use(bodyParser({ extended: false }));

// This is provider fro the polygon testnet
const provider = new ethers.providers.JsonRpcProvider(process.env.PROVIDER_URL);
const adminWallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, provider);
const ERC20_ABI = [
  // Read-Only Functions
  "function allowance(address owner, address spender) view returns (uint256)",
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)",
  "function symbol() view returns (string)",
  // Authenticated Functions
  "function approve(address spender, uint256 amount) public returns (bool)",
  "function transfer(address to, uint amount) returns (bool)",
  "function transferFrom(address from, address to, uint256 amount ) public returns (bool)",
  // Events
  "event Transfer(address indexed from, address indexed to, uint amount)"
];
const TokenContract = new ethers.Contract(process.env.TOKEN_CONTRACT_ADDRESS, ERC20_ABI, adminWallet);
TokenContract.connect();

const GAME_MODE_SURVIVAL = 0;
const GAME_MODE_RANKING = 1;
const mutex = new Mutex();
const IsSSLMode = true;

if (IsSSLMode == true) {
  /*
  var options = {
    key: fs.readFileSync(path.join(__dirname, "private.key")),
    cert: fs.readFileSync(path.join(__dirname, "certificate.crt"))
  };
  */
  var server = https.createServer(app).listen(8080, () => {
    console.log("Express server listening on port :");
  });
}
else {
  var server = http.createServer(app).listen(80, () => {
    console.log("Express server listening on port :");
  });

  app.get('/sendToken', function (req, res) {
    console.log("Got SetToken Request");
    SendAmetaFromMe("0xc6D5C3Af1Cb23086B34E1DCbeA408d1532fAcd21", 100000000);
    res.send("sent!");
  })

  app.get('/.well-known/pki-validation/8DD151889C72C63D1B41AFB7CCCA82C9.txt', function (req, res) {
    console.log("Got a GET request for the auth");
    let filePath = path.join(__dirname, "8DD151889C72C63D1B41AFB7CCCA82C9.txt");
    res.download(filePath);
  })
 
}

app.get('/', function (req, res) {
  console.log("Got a GET request for the homepage");
  res.send('Hello GET');
})

app.post('/', function (req, res) {
  console.log("Got a POST request for the homepage", req.headers['app_key']);
  res.send('Hello POST');
})
app.post('/GameCreate', function (req, res) {
  console.log("GameCreate:", req.body);
  if (req.body.AppId == undefined) {
    res.send({ Message: "Invaild App ID", ResultCode: 1 });
    return;
  }
  if (req.body.GameId == undefined) {
    res.send({ Message: "Invaild Game ID", ResultCode: 2 });
    return;
  }
  if (req.body.Nickname == undefined) {
    res.send({ Message: "Invaild User Nickname", ResultCode: 3 });
    return;
  }
  ProcessGameCreate(req.body.AppId, req.body.GameId, req.body.Nickname);
  res.send({ Message: "", ResultCode: 0 });
})


app.post('/GameClose', function (req, res) {
  console.log("GameClose:", req.body);
  if (req.body.AppId == undefined) {
    res.send({ Message: "Invaild App ID", ResultCode: 1 });
    return;
  }
  if (req.body.GameId == undefined) {
    res.send({ Message: "Invaild Game ID", ResultCode: 2 });
    return;
  }
  ProcessGameClose(req.body.AppId, req.body.GameId);
  res.send({ Message: "", ResultCode: 0 });
})


app.post('/GameEvent', function (req, res) {
  console.log("GameEvent:", req.body);
  if (req.body.AppId == undefined) {
    res.send({ Message: "Invaild App ID", ResultCode: 1 });
    return;
  }
  if (req.body.GameId == undefined) {
    res.send({ Message: "Invaild Game ID", ResultCode: 2 });
    return;
  }
  if (req.body.Nickname == undefined) {
    res.send({ Message: "Invaild User Nickname", ResultCode: 3 });
    return;
  }
  if (req.body.EvCode == undefined) {
    res.send({ Message: "Invaild EvCode", ResultCode: 4 });
    return;
  }
  ProcessGameEvent(req.body.AppId, req.body.GameId, req.body.Nickname, req.body.EvCode, req.body.Data);
  res.send({ Message: "", ResultCode: 0 });
})

app.post('/GameProperties', function (req, res) {
  console.log("GameProperties:", req.body);
  res.send({ Message: "", ResultCode: 0 });
})


app.post('/GameJoin', function (req, res) {
  console.log("GameJoin:", req.body);
  if (req.body.AppId == undefined) {
    res.send({ Message: "Invaild App ID", ResultCode: 1 });
    return;
  }
  if (req.body.GameId == undefined) {
    res.send({ Message: "Invaild Game ID", ResultCode: 2 });
    return;
  }
  if (req.body.Nickname == undefined) {
    res.send({ Message: "Invaild User Nickname", ResultCode: 3 });
    return;
  }
  ProcessGameJoin(req.body.AppId, req.body.GameId, req.body.Nickname);
  res.send({ Message: "", ResultCode: 0 });
})
app.post('/GameLeave', function (req, res) {
  console.log("GameLeave:", req.body);
  if (req.body.AppId == undefined) {
    res.send({ Message: "Invaild App ID", ResultCode: 1 });
    return;
  }
  if (req.body.GameId == undefined) {
    res.send({ Message: "Invaild Game ID", ResultCode: 2 });
    return;
  }
  if (req.body.Nickname == undefined) {
    res.send({ Message: "Invaild User Nickname", ResultCode: 3 });
    return;
  }
  ProcessGameLeave(req.body.AppId, req.body.GameId, req.body.Nickname);
  res.send({ Message: "", ResultCode: 0 });
})



var GameRoomDictionary = {};

function ProcessGameCreate(appID, gameID, userID) {
  let gameIndex = appID + gameID;
  GameRoomDictionary[gameIndex] = {};
  GameRoomDictionary[gameIndex].isWaiting = true;
  GameRoomDictionary[gameIndex].UserList = {};
  GameRoomDictionary[gameIndex].betAmount = 0;
  console.log("Game Created:", gameIndex);
  ProcessGameJoin(appID, gameID, userID);
}

function ProcessGameJoin(appID, gameID, userID) {
  let gameIndex = appID + gameID;
  if (GameRoomDictionary[gameIndex] != undefined) {
    console.log("User Joined:", userID);
    GameRoomDictionary[gameIndex].UserList[userID] = {};
    GameRoomDictionary[gameIndex].UserList[userID].isReady = false;
    GameRoomDictionary[gameIndex].UserList[userID].isRewarded = false;
    GameRoomDictionary[gameIndex].UserList[userID].betAmount = 0;
  }

}

function ProcessGameEvent(appID, gameID, userID, EvCode, EvData) {
  let gameIndex = appID + gameID;
  if (GameRoomDictionary[gameIndex] != undefined) {
    if (EvCode == 3) // betting end
    {
      if (GameRoomDictionary[gameIndex].UserList[userID] != undefined) {
        GameRoomDictionary[gameIndex].UserList[userID].isReady = true;
        if (EvData != undefined && EvData.bet_amount != undefined) {
          console.log("Player Betting:", userID, EvData.bet_amount);
          GameRoomDictionary[gameIndex].UserList[userID].betAmount = parseInt(EvData.bet_amount);
          GameRoomDictionary[gameIndex].betAmount += parseInt(EvData.bet_amount);
        }
      }
    }
    else if (EvCode == 2)  // Game is Started
    {
      console.log("Game Started:", gameIndex);
      GameRoomDictionary[gameIndex].isWaiting = false;
      GameRoomDictionary[gameIndex].gameMode = GAME_MODE_SURVIVAL;
      if (EvData != undefined && EvData.game_mode != undefined) {
        GameRoomDictionary[gameIndex].gameMode = EvData.game_mode;
      }

    }
    else if (EvCode == 4)  // Player is defeated or winner
    {
      if (GameRoomDictionary[gameIndex].gameMode == GAME_MODE_SURVIVAL) {
        console.log("Player Defeated:", userID);
        GameRoomDictionary[gameIndex].UserList[userID] = undefined;
        CheckIfNeedReward(appID, gameID);
      }
      else if (GameRoomDictionary[gameIndex].gameMode == GAME_MODE_RANKING) {
        console.log("Player Won:", userID);
        CheckIfNeedRewardForWinner(appID, gameID, userID);

      }
    }
  }

}

function ProcessGameLeave(appID, gameID, userID) {
  let gameIndex = appID + gameID;
  if (GameRoomDictionary[gameIndex] != undefined) {
    if (GameRoomDictionary[gameIndex].isWaiting == true) {
      if (GameRoomDictionary[gameIndex].UserList[userID].isReady == true) {
        GameRoomDictionary[gameIndex].betAmount -= GameRoomDictionary[gameIndex].UserList[userID].betAmount;
        SendAmetaFromMe(userID, GameRoomDictionary[gameIndex].UserList[userID].betAmount);
      }

    }
    console.log("User Leave:", userID);
    GameRoomDictionary[gameIndex].UserList[userID] = undefined;
    CheckIfNeedReward(appID, gameID);
  }
}

function ProcessGameClose(appID, gameID) {
  let gameIndex = appID + gameID;
  GameRoomDictionary[gameIndex] = undefined;
}

function CheckIfNeedRewardForWinner(appID, gameID, userID) {
  let gameIndex = appID + gameID;
  if (GameRoomDictionary[gameIndex] != undefined) {
    if (GameRoomDictionary[gameIndex].isWaiting == false) {
      if (userID != undefined && GameRoomDictionary[gameIndex].UserList[userID].isRewarded == false) {
        SendAmetaFromMe(userID, GameRoomDictionary[gameIndex].betAmount * 9 / 10);
        GameRoomDictionary[gameIndex] = undefined;
      }
    }
  }
}

function CheckIfNeedReward(appID, gameID) {
  let gameIndex = appID + gameID;
  if (GameRoomDictionary[gameIndex] != undefined) {
    if (GameRoomDictionary[gameIndex].isWaiting == false) {
      let activeUserCount = 0;
      let activeUserID = undefined;
      for (let userID in GameRoomDictionary[gameIndex].UserList) {
        let user = GameRoomDictionary[gameIndex].UserList[userID];
        if (user != undefined) {
          activeUserCount++;
          if (user.isRewarded == false) {
            activeUserID = userID;
          }
        }
      }

      if (activeUserCount == 1 && activeUserID != undefined) {
        GameRoomDictionary[gameIndex].UserList[activeUserID].isRewarded = true;
        SendAmetaFromMe(activeUserID, GameRoomDictionary[gameIndex].betAmount * 9 / 10);
      }
    }
  }

}

let nonceOffset = -1;
async function SendAmetaFromMe(toAddress, amount) {
  const feeData = await provider.getFeeData()
  console.log("SendAmetaFromMe", toAddress, amount);
  try {
    let nonce = await provider.getTransactionCount(process.env.WALLET_ADDRESS);
    nonceOffset = nonceOffset + 1;
    console.log("SendAmetaFromMe Nonce:", nonce , nonceOffset);
    const tx = await TokenContract.transfer(toAddress, amount, {
      nonce: nonce + nonceOffset,
      value: 0,
      gasPrice: feeData.gasPrice
    });
    console.log("SendAmetaFromMe End", tx);
    await tx.wait();
    console.log("SendAmetaFromMe Wait End");
    if (nonceOffset > -1) {
      console.log("Ether_utiles transferToken reduce nonce = ", nonceOffset);
      nonceOffset = nonceOffset - 1;
    }
    
    return tx;
  } catch (error) {
    if (nonceOffset > -1) {
      nonceOffset = nonceOffset - 1;
    }
    console.log("Ether_utiles transferToken error = :", error.toString());
    if (error.toString().includes("transferToken error")) {
      return "Insufficient Allowance!";
    } else {
      return false;
    }
  }
}


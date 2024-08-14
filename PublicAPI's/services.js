var axios = require('axios');
var jwt = require('jsonwebtoken');
var acc = require('./accounts.json');

async function getToken(appId, secretKey,sub = "123456789") {
    var payload = {
        sub,
        appId
    };
    var options = {
        expiresIn: '5m', // Token expiration time,
        header: {
            alg: "HS256",
            type: "JWT"
        }
    };
    // Secret key used to sign the token
    var secretKey = secretKey;
    // console.log("object");
    try {
        return await jwt.sign(payload, secretKey, options);
    } catch (error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            console.log('Server responded with status code:', error.response.status);
            console.log('Response data:', error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            console.log('No response received:', error.request);
        } else {
            // Something happened in setting up the request that triggered an error
            console.log('Error setting up the request:', error.message);
        }
        console.log('Error config:', error.config);
    }
}
async function fetchBotVariables(host, version = "1.1", botID, secretKey) {
    try {
        const config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: `https://${host}/api/${version}/public/builder/stream/${botID}/variables/export`,
            headers: {
                'auth': `${secretKey}`,
                'Content-Type': 'application/json'
            },
            data: {} // You can pass any data here if required
        };
        var response = await axios.request(config);
        console.log("response");
        return response.data;
    } catch (error) {
        if (error.response) {
            // The request was made and the server responded with a status code
            console.log('Server responded with status code:', error.response.status);
            console.log('Response data:', error.response.data);
        } else if (error.request) {
            // The request was made but no response was received
            console.log('No response received:', error.request);
        } else {
            // Something happened in setting up the request that triggered an error
            console.log('Error setting up the request:', error.message);
        }
        console.log('Error config:', error.config);
    }
}
async function fetchBotExport(host, botID, secretKey, exportType) {
    var data = JSON.stringify({
        "exportType": exportType ?? "published"
    });
    var config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `https://${host}/api/public/bot/${botID}/export`,
        headers: {
            'Content-Type': 'application/json',
            'auth': `${secretKey}`
        },
        data: data
    };
    try {
        const response = await axios.request(config);
        // console.log(response.data);
        return response.data;
    }
    catch (error) {
        console.log(error);
        return {status:"failed"};
    }
}
async function fetchBotExportStatus(host, botID, secretKey) {
    try {
        const config = {
            method: 'get',
            url: `https://${host}/api/public/bot/${botID}/export/status`,
            headers: {
                'auth': `${secretKey}`
            }
        };

        const response = await axios.request(config);
        console.log(JSON.stringify(response.data));
        return response.data;
    } catch (error) {
        
        // console.error('Error retrieving bot export status:', error);
        return {status:"failed"}; // or handle the error in an appropriate way
    }
}
async function addBotVariable(host,botId,token,userId,data,) {
    var config = {
      method: 'post',
      maxBodyLength: Infinity,
      url: `'https://${host}/api/1.1/users/${userId}/builder/stream/${botId}/variables`,
      headers: { 
        'authority': 'staging-bots.korebots.com', 
        'accept': 'application/json, text/plain, */*', 
        'accept-language': 'en-US,en;q=0.9',
        'app-language': 'en', 
        'authorization': `bearer ${token}`, 
        'bot-language': 'en', 
        'client-app': 'builder', 
        'content-type': 'application/json;charset=UTF-8', 
        'sec-ch-ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"', 
        'sec-ch-ua-mobile': '?0', 
        'sec-ch-ua-platform': '"Windows"', 
        'sec-fetch-dest': 'empty', 
        'sec-fetch-mode': 'cors', 
        'sec-fetch-site': 'same-origin', 
        'state': 'configured', 
        'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36', 
        'x-timezone-offset': '-330'
      },
      data : JSON.stringify(data)
    };
    try {
      const response = await axios.request(config);
      console.log(JSON.stringify(response.data));
      return response.data;
    }
    catch (error) {
      console.log(error);
    }
  }
async function addSDKDetails(bot){
  var data =   {
    email: bot.email,
    botID: bot.botID,
    clientID: bot.clientID,
    clientSecret: bot.clientSecret,
    accountID: bot.accountID,
    env: bot.env,
    v2WebhookURL: bot.v2WebhookURL,
    ivrInstanceURL: bot.ivrInstanceURL,
    devLogin: bot.devLogin,
    botName: bot.botName,
    label: bot.label
}
    var config = {
        method: 'post',
        maxBodyLength: Infinity,
        url: `https://demodpd.kore.ai/ba-provisionaccounts`,
        headers: {
            'Content-Type': 'application/json',
        },
        data: data
    };
    try {
        const response = await axios.request(config);
        // console.log(response.data);
        return response.data;
    }
    catch (error) {
        console.log(error);
        return {status:"failed"};
    }
    
}


module.exports = { fetchBotVariables, getToken, fetchBotExport, fetchBotExportStatus,addBotVariable ,addSDKDetails}

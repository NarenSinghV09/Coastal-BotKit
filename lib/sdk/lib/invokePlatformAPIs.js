var Promise = require("bluebird");
var jwt = require("jwt-simple");
var config = require("../../../config");
var { makeHttpCall } = require("../../../makeHttpCall");

function history(url,body)
{ 
    var botId = url.split("/")[6];
    var headers = {};
    var array=[];
    array.push(body);
    var data={
        "sessionId":array,
        "getAgentsInfo":true
    }
    headers['content-type'] = 'application/json';
    headers.auth = getSignedJWTToken(botId);
    console.log("headers"+JSON.stringify(headers)+"URL"+url+"Data"+JSON.stringify(data));
    return new Promise(function(resolve, reject) {
        makeHttpCall('POST', url, data, headers)
        .then(function(res) {
            //console.log("res"+res.data);
            return resolve(res.data);
        })
        .catch(function(err) {
            console.log("error.mesage=="+err.message)
            console.log(err);
            return reject(err);
        })
    });


}

function getSignedJWTToken(botId) {
    var appId, apiKey, jwtAlgorithm, jwtExpiry;
    var defAlg = "HS256";

    if (config.credentials[botId]) {
        appId = config.credentials[botId].appId;
        apiKey = config.credentials[botId].apikey;
    } else {
        appId = config.credentials.appId;
        apiKey = config.credentials.apikey;
    }

    if (config.jwt[botId]) {
        jwtAlgorithm = config.jwt[botId].jwtAlgorithm;
        jwtExpiry = config.jwt[botId].jwtExpiry;
    } else {
        jwtAlgorithm = config.jwt.jwtAlgorithm;
        jwtExpiry = config.jwt.jwtExpiry;
    }

    
    return jwt.encode({ 
        appId: appId
        //exp: Date.now()/1000 + (jwtExpiry || 60) //set the default expiry as 60 seconds
    }, apiKey, (jwtAlgorithm || defAlg));
}
function makeRequest(url, method, data, opts) {
    var botId = url.split("/")[6];
    var headers;
    opts    = opts || {};
    headers =  {};
    headers['content-type'] = 'application/json';
    // console.log(botId);
    headers.auth = getSignedJWTToken(botId);
    // console.log("URL=="+url);
    // console.log("headers"+JSON.stringify(headers));
    // console.log("method=="+method);
    return new Promise(function(resolve, reject) {
        makeHttpCall(method, url, data, headers)
        .then(function(res) {
            //console.log("res"+res.data);
            return resolve(res.data);
        })
        .catch(function(err) {
            console.log("error.mesage=="+err.message)
            console.log(err);
            return reject(err);
        })
    });
}

module.exports = {
    post: function(url, body, callback) {
        return makeRequest(url, 'post', body)
            .nodeify(callback);
    },
    get: function(url, callback) {
        return makeRequest(url, 'get')
            .nodeify(callback);
    },
    getWithOptions: function(url, opts, callback) {
        return makeRequest(url, 'get', undefined, opts)
            .nodeify(callback);
    },
    retrieve_history: function(url, body, callbak){
        console.log("In retrieve history");
        return history(url, body)
        .nodeify(callbak);

    }
};

module.exports.getSignedJWTToken=getSignedJWTToken;
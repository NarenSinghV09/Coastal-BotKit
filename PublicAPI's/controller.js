let services = require('./services');
let utils = require('./utilities');
const XLSX = require('xlsx');
async function fetchBotVariables(source){
    let bot = source;
    let appId = bot.clientId;
    let token = bot.secreatKey;
    let version = bot.version;
    let botID = bot.streamID;
    let host = bot.host;
    var secretKey = await services.getToken(appId, token);
    let data = await services.fetchBotVariables(host, version, botID, secretKey);
    return data;
}
async function getBotVariables(source) {
    let variables = await fetchBotVariables(source);
    // console.log(JSON.stringify(variables));
    return utils.getBotVariables(variables,source.botName);
}
async function getBotExport(source,exportType) {
    let bot = source;
    let appId = bot.clientId;
    let token = bot.secreatKey;
    let botID = bot.streamID;
    let host = bot.host;
    var secretKey = await services.getToken(appId, token);
    console.log(secretKey);
    let botExportStart = await services.fetchBotExport(host, botID, secretKey, exportType);
    console.log(JSON.stringify(botExportStart));
    if (botExportStart.status === "pending") {
        setTimeout(getBotExportStatus, 20000,[source,secretKey]);
    } else {
        return;
    }
}
async function getBotExportStatus(source,secretKey) {
    let bot = source;
    let appId = bot.clientId;
    let token = bot.secreatKey;
    let botID = bot.streamID;
    let host = bot.host;
    var secretKey = await services.getToken(appId, token);
    let botExportExportStatus = await services.fetchBotExportStatus(host, botID, secretKey);
    if (botExportExportStatus && botExportExportStatus.status === "success") {
        var fileNameDetails = utils.getBotName(botExportExportStatus.store.urlParams);
        var fileName = utils.fileName(fileNameDetails.decodedFilename,fileNameDetails.extenstion);
        const zipFilePath = `./Bots/ZIP/${fileName}`;
        const extractDir = `./Bots/Extracted`
        let status = await utils.downloadAndExtractZip(botExportExportStatus.downloadURL, zipFilePath, extractDir);
        return status;
    }else if(botExportExportStatus && botExportExportStatus.status === "pending"){
        console.log(" Still Pending......");
        setTimeout(getBotExportStatus, 10000,[source,secretKey]);        
    }else{
        console.log("Failed to download export");
       return;
    }
}
async function validateBotVariables(source,target){
    let sourceVar = await getBotVariables(source);
    let targetVar = await getBotVariables(target);
    let content = utils.compareJSON(sourceVar.content,targetVar.content);
    let env = utils.compareJSON(sourceVar.env,targetVar.env);
    let data =  {content,env}
    // utils.createExcelfile(data);
    // utils.wToFile(utils.fileNameSuffixByDate("BotVariablesDiffrence","json"),data)
    return data;
}

async function getBotDiffrences(source,target,exportType){
    let difference = await getBotExport(source,exportType);
    let difference2 = await getBotExport(target,exportType);
    return difference;
}
async function addBotVariable(source,variableType,varName,varValue,options = {}) {
options = Object.assign({
    "key": varName,
    "value": varValue,
    "hint": "",
    "audioTag": "",
    "isSecured": false,
    "variableType": variableType === "content" ? "locale" : "env",
    "group": "s",
    "vNameSpace": [
        "ns-c2df764e-0dbd-5799-8515-58a8073cef8a"
    ]
  },options);
}

module.exports = { getBotVariables, getBotExport,getBotExportStatus, validateBotVariables,getBotDiffrences}

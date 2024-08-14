const serives = require('./controller');
const config = require('./config.json');
const fs = require('fs');
const path = require('path');
let envmapping = {
    "dev":"developer",
    "stag":"staging",
    "prod":"prod",
    "developer":"developer",
    "staging":"staging",
    "production":"prod"
}
async function getUtilsHomePage(req,res){
    res.sendFile(path.join(__dirname, 'Web', 'index.html'));   
}
async function getBotVariables(req,res){
    const env = req.query.env;
    console.log(env);
      if(env && config[envmapping[env]]){
        var botVariables ={}
         botVariables =  await serives.getBotVariables(config[envmapping[env]]);
        }else{
          botVariables =  await serives.getBotVariables(config.developer);
        }
            // Send the JSON data as a regular response
            res.setHeader('Content-type', 'application/json');
            res.json(botVariables);
             // Set response headers
            //  res.setHeader('Content-disposition', 'attachment; filename=' + "BotVariables.json");
            //  res.setHeader('Content-type', 'application/json');
            //  // Send the JSON data as a file download
            res.send(botVariables);        
}
async function validateBotVariables(req,res){
    const source = req.query.source;
    const target = req.query.target;
  if(source && config[envmapping[source]] && target && config[envmapping[target]]){
        let botVariables =  await serives.validateBotVariables(config[envmapping[source]],config[envmapping[target]]);
        res.json(botVariables)
    }else{
        let botVariables =  await serives.validateBotVariables(config.developer,config.staging);
        res.json(botVariables)
    }
}

// serives.getBotVariables(config.developer);
// serives.getBotExport(config.developer,"latest");
// serives.getBotExportStatus();
// serives.getBotDiffrences(config.developer,config.staging);
// serives.validateBotVariables(config.developer,config.staging);
module.exports = {
    getBotVariables,
    validateBotVariables,
    getUtilsHomePage
}

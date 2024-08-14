var sdk = require("../sdk");
var serviceHandler = require("./serviceHandler").serviceHandler;
var apiPrefix = require("../../config.json").app.apiPrefix;
var livechat = require("../../LiveChat.js");
const SimpleConversationalBot = require("../../SimpleConversationalBot.js");
const bankingUtilsMain = require("../../PublicAPI's/main.js");

function loadroutes(app) {
    app.post(apiPrefix + '/sdk/bots/:botId/components/:componentId/:eventName', function (req, res) {
        var reqBody = req.body;
        var botId = req.params.botId;
        var componentId = req.params.componentId;
        var eventName = req.params.eventName;
        serviceHandler(req, res, sdk.runComponentHandler(botId, componentId, eventName, reqBody));
    });
    app.post(apiPrefix + '/sdk/bots/:botId/:eventName', function (req, res) {
        var reqBody = req.body;
        var botId = req.params.botId;
        var eventName = req.params.eventName;

        serviceHandler(req, res, sdk.runComponentHandler(botId, 'default', eventName, reqBody));
    });
    app.get(apiPrefix + '/gethistory', SimpleConversationalBot.gethistory);

    app.post(apiPrefix + '/conversations/:id/create', (req, res) => {
        //console.log("Webhook.js")
        console.log("\ncreate\n" + JSON.stringify(req.body));
        data.message = "Your agent chatsession has been created"
        sdk.sendBotMessage(data, callback);
        res.sendStatus("200");
    })
    app.get(apiPrefix + '/bankingutils/getBotVariables',bankingUtilsMain.getBotVariables);
    app.get(apiPrefix + '/bankingutils/validateBotVariables',bankingUtilsMain.validateBotVariables);

    app.get(apiPrefix + '/', (req, res) => {
        const htmlResponse = `
            <!DOCTYPE html>
            <html lang="en">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Banking Virtual Assistant Bot Kit</title>
            </head>
            <body>
                <h1>Hi, I am Banking Virtual Assistant Bot Kit</h1>
            </body>
            </html>
        `;
        
        res.send(htmlResponse);
    });
}

module.exports = {
    load: loadroutes
};

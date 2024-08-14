var botId = "st-bd647995-6c92-5eb1-a8dd-853008902994";
var botName = "BankAssist Dev";
var sdk = require("./lib/sdk");

/*
 * This is the most basic example of BotKit.
 *
 * It showcases how the BotKit can intercept the message being sent to the bot or the user.
 *
 * We can either update the message, or chose to call one of 'sendBotMessage' or 'sendUserMessage'
 */
function gethistory(req, res) {
    // var agent_id= await getAgentId(req.query.sessionId);
    // console.log("Agent Id", agent_id);
    var sessionId = req.query.sessionId;
    var botid = req.query.botid;
    var data = {};
    console.log("SessionId" + sessionId);
    data.limit = 100
    data.sessionId = sessionId
    data.baseUrl = `https://bots.kore.ai/api/public/bot/${botid}`
    if (sessionId) {
        data.limit = 100;
        return sdk.getMessages(data, function (err, resp) {
            if (err) {
                res.status(400);
                return res.json(err);
            }
            var messages = resp.messages;
            res.status(200);
            return res.json(messages);
        });
    } else {
        var error = {
            msg: "Invalid user",
            code: 401
        };
        res.status(401);
        return res.json(error);
    }
}
module.exports = {
    botId   : botId,
    botName : botName,

    on_user_message : function(requestId, data, callback) {
        if (data.message === "Hi") {
            data.message = "Hello";
            //Sends back 'Hello' to user.
            return sdk.sendUserMessage(data, callback);
        } else if(!data.agent_transfer){
            //Forward the message to bot
            return sdk.sendBotMessage(data, callback);
        } else {
            data.message = "Agent Message";
            return sdk.sendUserMessage(data, callback);
        }
    },
    on_bot_message  : function(requestId, data, callback) {
        if (data.message === 'hello') {
            data.message = 'The Bot says hello!';
        }
        if(!["AnythingElseDialog","Followups"].includes(data.context.intentName) && data.context.session.BotUserSession.isRepeatable){
            data.context.session.BotUserSession.botMessage = data.message;
            console.log(data.context.session.BotUserSession.botMessage);
        }
        //Sends back the message to user
        
        return sdk.sendUserMessage(data, callback);
    },
    on_agent_transfer : function(requestId, data, callback){
        return callback(null, data);
    },
    on_event : function (requestId, data, callback) {
        // console.log("on_event -->  Event : ", data.event);
        return callback(null, data);
    },
    on_alert : function (requestId, data, callback) {
        console.log("on_alert -->  : ", data, data.message);
        return sdk.sendAlertMessage(data, callback);
    },
    gethistory: gethistory
};



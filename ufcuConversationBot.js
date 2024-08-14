var axios = require('axios');
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));
var config = require('./config.json');
var botId = Object.keys(config.credentials);
var botName = "MIYA";
var sdk = require("./lib/sdk");
var index = require('./lib/sdk/lib/invokePlatformAPIs').getSignedJWTToken;
var client = require('./lib/RedisClient').createClient(config.redis);
var subscriber = require('./lib/RedisClient').createClient(config.redis);
var _ = require('lodash');

async function raiseincident(data) {
    console.log("\n==================================\n", "Data, ", data, "\n=======================================");
    console.log(data.context.session.BotUserSession.channels[0].streamId, "=========", "logging");
    console.log("data.context.session.BotUserSession.channels[0].userId" + data.context.session.BotUserSession.channels[0].userId);
    console.log("getValueFromRedis(data.context.session.BotUserSession.channels[0].userId)" + await client.get(data.context.session.BotUserSession.channels[0].userId));
    var code = await client.get(data.context.session.BotUserSession.channels[0].userId);
    var tone_fromredis = await client.get(data.context.session.BotUserSession.channels[0].userId + "_tone");
    console.log("======================\n::tone_fromredis::" + tone_fromredis + "\n==============================");
    console.log("====================================\nCode", code, "\n------------------------------");
    await client.del(data.context.session.BotUserSession.channels[0].userId);
    await client.del(data.context.session.BotUserSession.channels[0].userId + "_tone");
    var time = await getTime(data.context.session.BotUserSession.channels[0].sessionId , data.context.session.BotUserSession.channels[0].streamId);
    console.log(time);
    console.log("Starttime" + time.start_time + "end time" + time.end_time);
    var agent_id = await getAgentId(data.context.session.BotUserSession.channels[0].sessionId,data.context.session.BotUserSession.channels[0].streamId);
    var customerID = await client.get(data.context.session.BotUserSession.channels[0].userId + "_id")
    await client.del(data.context.session.BotUserSession.channels[0].userId + "_id");
    var body = {};
    if (await client.get(data.context.session.BotUserSession.channels[0].userId + "_data")) {
        console.log("Removing data from the session, so not to emit feedback");
        await client.del(data.context.session.BotUserSession.channels[0].userId + "_data");
    }
    var a = code || data.context.session.BotUserSession.channels[0].body || "testing Intent"
    if (agent_id == "NA") {
        body = {
            "subject": "Chat Interaction Record",
            "actualstart": time.start_time,
            "actualend": time.end_time,
            "msdyn_ocliveworkitemid": data.context.session.BotUserSession.channels[0].sessionId,
            "description": a,
            "ufcu_chathistorylink": `${config.app.url}${config.app.apiPrefix}/history/index.html?sessionId=` + data.context.session.BotUserSession.channels[0].sessionId+'&botid='+data.context.session.BotUserSession.channels[0].streamId,
            "msdyn_customer_msdyn_ocliveworkitem_contact@odata.bind": "/contacts(ufcu_personnumber='" + customerID + "')",
            "ufcu_interactionsentiment": tone_fromredis || "Neutral",
            "ufcu_chatorigin": 679830004,
            "statecode": 4,
            "statuscode": 1
        };

    }
    else {
        body = {
            "subject": "Chat Interaction Record",
            "msdyn_activeagentid_msdyn_ocliveworkitem@odata.bind": "/systemusers(ufcu_userpersnbr='" + agent_id + "')",
            "actualstart": time.start_time,
            "actualend": time.end_time,
            "msdyn_ocliveworkitemid": data.context.session.BotUserSession.channels[0].sessionId,
            "description": a,
            "ufcu_chathistorylink": `${config.app.url}${config.app.apiPrefix}/history/index.html?sessionId=` + data.context.session.BotUserSession.channels[0].sessionId+'&botid='+data.context.session.BotUserSession.channels[0].streamId,
            "msdyn_customer_msdyn_ocliveworkitem_contact@odata.bind": "/contacts(ufcu_personnumber='" + customerID + "')",
            "ufcu_interactionsentiment": tone_fromredis || "Neutral",
            "ufcu_chatorigin": 679830004,
            "statecode": 4,
            "statuscode": 1
        };
    }
    console.log("body" + JSON.stringify(body));

    var used_bot_id = await client.get(data.context.session.BotUserSession.channels[0].userId + "_botid");
    console.log("used_bot_id========" + used_bot_id);
    let reqoptions, URL_CRM
    if (used_bot_id == Object.keys(config.credentials)[1] || used_bot_id == Object.keys(config.credentials)[5]) {

        reqoptions = {
            method: 'POST',
            headers: UFCU_data.SIT.headers,
        };
        URL_CRM = UFCU_data.SIT.URL
    }
    else if (used_bot_id == Object.keys(config.credentials)[2] || used_bot_id == Object.keys(config.credentials)[6]) {
        reqoptions = {
            method: 'POST',
            headers: UFCU_data.UAT.headers,
        };
        URL_CRM = UFCU_data.UAT.URL
    }
    else if (used_bot_id == Object.keys(config.credentials)[3] || used_bot_id == Object.keys(config.credentials)[7]) {
        reqoptions = {
            method: 'POST',
            headers: UFCU_data.PROD.headers
        }
        URL_CRM = UFCU_data.PROD.URL
    }
    console.log(reqoptions);

    try {

        console.log("session has been closed");
        var response = await axios({
            url: URL_CRM,
            method: reqoptions.method,
            headers: reqoptions.headers,
            data: JSON.stringify(body)
        });
        console.log(response);
        if (response.status == 201) {
            console.log("data has been inserted");
            var activityid = response.data.activityid;
            var body = JSON.stringify({
                "statecode": 1,
                "statuscode": 4
            })
            try {
                var response = await axios({
                    url: URL_CRM + "(" + activityid + ")",
                    method: 'patch',
                    headers: reqoptions.headers,
                    data: JSON.stringify(body)
                });
                if (response.status == 200) {
                    console.log("entry has been closed");
                    console.log("response", response.data)
                }
            }
            catch (error) {
                console.log("error.message:", error)
                var body = {
                    "data": {
                        "agentID": agent_id,
                        "customerId": customerID,
                        "actualend": time.end_time,
                        "ufcu_chathistorylink": `${config.app.url}${config.app.apiPrefix}/history/index.html?sessionId=` + data.context.session.BotUserSession.channels[0].sessionId+'&botid='+data.context.session.BotUserSession.channels[0].streamId,
                        "actualstart": time.start_time,
                        "intent": a,
                        "sessionId": data.context.session.BotUserSession.channels[0].sessionId,
                        "ufcu_interactionsentiment": tone_fromredis || "Neutral"
                    }
                }
                var response = await axios({
                    url: UFCU_data.Data_table.URL,
                    headers: UFCU_data.Data_table.headers,
                    data: body,
                    method: 'POST'
                })
                if (response.status == 200) {
                    console.log("The data has been fed in to the Table - CRM_Failed_instances");
                }
                else {
                    console.log("The data has not been feed in to the table - CRM_Failed_instances ")
                }
            }
        }
    }
    catch (error) {
        console.log("error.message:" + error.message);
        var body = {
            "data": {
                "agentID": agent_id,
                "customerId": customerID,
                "actualend": time.end_time,
                "ufcu_chathistorylink": `${config.app.url}${config.app.apiPrefix}/history/index.html?sessionId=` + data.context.session.BotUserSession.channels[0].sessionId+'&botid='+data.context.session.BotUserSession.channels[0].streamId,
                "actualstart": time.start_time,
                "intent": a,
                "sessionId": data.context.session.BotUserSession.channels[0].sessionId,
                "ufcu_interactionsentiment": tone_fromredis || "Neutral"
            }
        }
        var response = await axios({
            url: UFCU_data.Data_table.URL,
            headers: UFCU_data.Data_table.headers,
            data: body,
            method: 'POST'
        })
        if (response.status == 200) {
            console.log("The data has been fed in to the Table - CRM_Failed_instances");
        }
        else {
            console.log("The data has not been feed in to the table - CRM_Failed_instances ")
        }
    }
    await client.del(data.context.session.BotUserSession.channels[0].userId + "__feedBackEmitted");
}

async function raiseIvrIncident(data) {

    console.log("In Function raiseIvrIncident");
    console.log("\n==================================\n", "Data, ", JSON.stringify(data), "\n=======================================");
    console.log(data.context.session.BotUserSession.channels[0].streamId, "=========", "logging");
    console.log("data.context.session.BotUserSession.channels[0].userId" + data.context.session.BotUserSession.channels[0].userId);
    console.log("getValueFromRedis(data.context.session.BotUserSession.channels[0].userId)" + await client.get(data.context.session.BotUserSession.channels[0].userId));
    var code = await client.get(data.context.session.BotUserSession.channels[0].userId);
    var tone_fromredis = await client.get(data.context.session.BotUserSession.channels[0].userId + "_tone");
    console.log("======================\n::tone_fromredis::" + tone_fromredis + "\n==============================");
    console.log("====================================\nCode", code, "\n------------------------------");
    await client.del(data.context.session.BotUserSession.channels[0].userId);
    await client.del(data.context.session.BotUserSession.channels[0].userId + "_tone");
    console.log(" data.context.session.BotUserSession.channels[0].sessionId",  data.context.session.BotUserSession.channels[0].conversationSessionId)
    var time = await getTime( data.context.session.BotUserSession.conversationSessionId , data.context.session.BotUserSession.channels[0].streamId);
    console.log(time);
    console.log("Starttime" + time.start_time + "end time" + time.end_time);
    var agent_id = await getAgentId(data.context.session.BotUserSession.conversationSessionId, data.context.session.BotUserSession.channels[0].streamId);
    var customerID = await client.get(data.context.session.BotUserSession.channels[0].userId + "_id")
    var number_user = await client.get(data.context.session.BotUserSession.channels[0].userId + "_Number");
    await client.del(data.context.session.BotUserSession.channels[0].userId + "_id");
    var body = {};
    // if(await client.get(data.context.session.BotUserSession.channels[0].userId+"_data"))
    // {
    //     console.log("Removing data from the session, so not to emit feedback");
    //     await client.del(data.context.session.BotUserSession.channels[0].userId+"_data");
    // }
    var a = code || data.context.session.BotUserSession.channels[0].body || "testing Intent"
    if (agent_id == "NA") {
        body = {
            "subject": "Phone Call Interaction Record",
            "phonecall_activity_parties": [
                {
                    "participationtypemask": 1,
                    "partyid_contact@odata.bind": "/contacts(ufcu_personnumber='" + customerID + "')"
                }
            ],
            "directioncode": false,
            "phonenumber": number_user,
            "scheduledend": time.end_time,
            "description": a,
            "ufcu_interactionsentiment": tone_fromredis || "Neutral",
            "ufcu_linktoconversation": `${config.app.url}${config.app.apiPrefix}/history/index.html?sessionId=` + data.context.session.BotUserSession.conversationSessionId+'&botid='+data.context.session.BotUserSession.channels[0].streamId
        };

    }
    else {
        body = {
            "subject": "Phone Call Interaction Record",
            "phonecall_activity_parties": [
                {
                    "participationtypemask": 1,
                    "partyid_contact@odata.bind": "/contacts(ufcu_personnumber='" + customerID + "')"
                },

                {
                    "participationtypemask": 2,
                    "partyid_contact@odata.bind": "/contacts(ufcu_personnumber='" + agent_id + "')"
                }
            ],
            "directioncode": false,
            "phonenumber": number_user,
            "scheduledend": time.end_time,
            "description": a ,
            "ufcu_interactionsentiment": tone_fromredis || "Neutral",
            "ufcu_linktoconversation": `${config.app.url}${config.app.apiPrefix}/history/index.html?sessionId=` + data.context.session.BotUserSession.conversationSessionId+'&botid='+data.context.session.BotUserSession.channels[0].streamId
        };
    }
    console.log("body" + JSON.stringify(body));

    var used_bot_id = await client.get(data.context.session.BotUserSession.channels[0].userId + "_botid");
    console.log("used_bot_id========" + used_bot_id);
    let reqoptions, URL_CRM
    if (used_bot_id == Object.keys(config.credentials)[1] || used_bot_id == Object.keys(config.credentials)[5]) {

        reqoptions = {
            method: 'POST',
            headers: UFCU_data.SIT.headers,
        };
        URL_CRM = UFCU_data.SIT.URL_IVR;
    }
    else if (used_bot_id == Object.keys(config.credentials)[2] || used_bot_id == Object.keys(config.credentials)[6]) {
        reqoptions = {
            method: 'POST',
            headers: UFCU_data.UAT.headers,
        };
        URL_CRM = UFCU_data.UAT.URL_IVR
    }
    else if (used_bot_id == Object.keys(config.credentials)[3] || used_bot_id == Object.keys(config.credentials)[7]) {
        reqoptions = {
            method: 'POST',
            headers: UFCU_data.PROD.headers
        }
        URL_CRM = UFCU_data.PROD.URL_IVR
    }
    console.log(reqoptions);

    try {

        console.log("session has been closed");
        var response = await axios({
            url: URL_CRM,
            method: reqoptions.method,
            headers: reqoptions.headers,
            data: JSON.stringify(body)
        });
        console.log(response);
        if (response.status == 201) {
            console.log("data has been inserted");
            var activityid = response.data.activityid;
            var body = JSON.stringify({
                "statecode": 1,
                "statuscode": 2
            })
            try {
                var response = await axios({
                    url: URL_CRM + "(" + activityid + ")",
                    method: 'patch',
                    headers: reqoptions.headers,
                    data: JSON.stringify(body)
                });
                if (response.status == 200) {
                    console.log("entry has been closed");
                    console.log("response", response.data)
                }
            }
            catch (error) {
                console.log("error.message:", error)
                var body = {
                    "data": {
                        "agentID": agent_id,
                        "customerId": customerID,
                        "actualend": time.end_time,
                        "ufcu_chathistorylink": `${config.app.url}${config.app.apiPrefix}/history/index.html?sessionId=` + data.context.session.BotUserSession.conversationSessionId+'&botid='+data.context.session.BotUserSession.channels[0].streamId,
                        "actualstart": time.start_time,
                        "intent": a,
                        "sessionId": data.context.session.BotUserSession.conversationSessionId,
                        "ufcu_interactionsentiment": tone_fromredis || "Neutral"
                    }
                }
                var response = await axios({
                    url: UFCU_data.Data_table.URL,
                    headers: UFCU_data.Data_table.headers,
                    data: body,
                    method: 'POST'
                })
                if (response.status == 200) {
                    console.log("The data has been fed in to the Table - CRM_Failed_instances");
                }
                else {
                    console.log("The data has not been feed in to the table - CRM_Failed_instances ")
                }
            }
        }
    }
    catch (error) {
        console.log("error.message:" + error.message);
        var body = {
            "data": {
                "agentID": agent_id,
                "customerId": customerID,
                "actualend": time.end_time,
                "ufcu_chathistorylink": `${config.app.url}${config.app.apiPrefix}/history/index.html?sessionId=` + data.context.session.BotUserSession.conversationSessionId+'&botid='+data.context.session.BotUserSession.channels[0].streamId,
                "actualstart": time.start_time,
                "intent": a,
                "sessionId": data.context.session.BotUserSession.conversationSessionId,
                "ufcu_interactionsentiment": tone_fromredis || "Neutral"
            }
        }
        var response = await axios({
            url: UFCU_data.Data_table.URL,
            headers: UFCU_data.Data_table.headers,
            data: body,
            method: 'POST'
        })
        if (response.status == 200) {
            console.log("The data has been fed in to the Table - CRM_Failed_instances");
        }
        else {
            console.log("The data has not been feed in to the table - CRM_Failed_instances ")
        }
    }
    // await client.del(data.context.session.BotUserSession.channels[0].userId + "__feedBackEmitted");

}

async function initilize() {
    await client.connect();
    await subscriber.connect();
    await client.sendCommand(["CONFIG", "SET", "notify-keyspace-events", "KEA"]);

}
initilize();
subscriber.subscribe('__keyevent@0__:expired', async (channel, message) => {
    if (message == "__keyevent@0__:expired") {
        console.log(`Key ${channel} has expired.`);
        var value = channel.split('_');
        console.log("Value from keys" + value);
        var key = value[0] + "_data";
        console.log("key====" + key);
        var data = await client.get(key);
        // console.log(data);
        var key_feedback = value[0] + "_feedBackEmitted";
        var feedBackEmitted = await client.get(key_feedback);
        console.log("feedBackEmitted ::", feedBackEmitted);
        if (feedBackEmitted != "emitted" && data) {
            console.log("=========================Feedback is going to be emiited=======================")
            await client.set(key_feedback, "emitted");
            getExistingdata(data, "feedback");
            await client.del(key);
        }
    }
});

// await client.connect();
// await subscriber.connect();
// await client.sendCommand(["CONFIG", "SET", "notify-keyspace-events", "KEA"]);

async function getExistingdata(data, message, isTemplate = false) {
    // console.log("\n==========================data====================\n" + data);
    if (data) {
        var dataParsed = JSON.parse(data);
        var userMsg = message;
        console.log("message" + userMsg);
        var overrideMessagePayload = {
            body: userMsg,
            isTemplate: false
        };

        var data2 = _.cloneDeep(dataParsed);
        // console.log("-------------------------------\n" + JSON.stringify(data2) + "\n-------------------------------------")
        data2.toJSON = function () {
            return {
                __payloadClass: 'OnMessagePayload',
                requestId: dataParsed.requestId,
                botId: dataParsed.botId,
                componentId: dataParsed.componentId,
                sendUserMessageUrl: dataParsed.sendUserMessageUrl,
                sendBotMessageUrl: dataParsed.sendBotMessageUrl,
                context: dataParsed.context,
                channel: dataParsed.channel,
                message: message,
                overrideMessagePayload: overrideMessagePayload
            };
        };
        //await client.set(data.context.session.BotUserSession.channels[0].userId+"_feedBackEmitted", "true");
        sdk.sendBotMessage(data2, null);
    }
}

function closeData(data) {
    // console.log("\n==========================data====================\n" + data);
    console.log("In close Data");
    if (data) {
        var dataParsed = JSON.parse(data);
        var overrideMessagePayload = {
            body: "Welcome Dialog",
            isTemplate: false
        };

        var data2 = _.cloneDeep(dataParsed);
        console.log("-------------------------------\n" + JSON.stringify(data2) + "\n-------------------------------------");
        dataParsed.context.session.BotUserSession.loginStatus = "no";
        var sendBotURL = dataParsed.sendBotMessageUrl;
        var clearURL = sendBotURL.replace('sendBotMessage', 'conversationSession');
        data2.clearConversationSessionUrl = clearURL;
        data2.toJSON = function () {
            return {
                __payloadClass: 'OnMessagePayload',
                requestId: dataParsed.requestId,
                botId: dataParsed.botId,
                componentId: dataParsed.componentId,
                sendUserMessageUrl: dataParsed.sendUserMessageUrl,
                sendBotMessageUrl: dataParsed.sendBotMessageUrl,
                clearConversationSessionUrl: clearURL,
                context: dataParsed.context,
                channel: dataParsed.channel,
                message: "botsessionclosurelogout",
                overrideMessagePayload: overrideMessagePayload,
                nlMeta: {
                    'intent': 'botsessionclosurelogout',
                    'isRefresh': true,
                }
            };
        };
        //await client.set(data.context.session.BotUserSession.channels[0].userId+"_feedBackEmitted", "true");
        sdk.sendBotMessage(data2, null);
        console.log("After bot USer message");
    }
    return 0;
}


// subscriber.on('message', async function (channel, key) {
//     console.log(`Key ${key} has expired.`, channel);
//     var data = JSON.parse(await getValueFromRedis(key + "_data"));
//     getExistingdata(data, "feedback");
//     await client.del(key + "_data");
// })
// subscriber.on('error', (err) => {
//     console.error(`Redis Error: ${err}`);
//     // You can handle the error here, e.g., log it or take appropriate action
// });

//version -3 code is above this, But it is not working after 4.0 and don't forgot to use .connect method after creating client instance..

function getValueFromRedis(key) {
    return new Promise((resolve, reject) => {
        client.get(key, (err, value) => {
            if (err) {
                reject(err);
            } else {
                resolve(value);
            }
        });
    });
}

const UFCU_data = require('./client.json').UFCU;
const { stringify } = require('qs');

async function getTime(sessionId , botid) {
    console.log("sessionId", sessionId , "Botid=",botid); 
    var body =
    {
        "sessionId": [sessionId]
    };
    console.log("body in getTime" + body);
    var headers = {};
    headers.auth = index(botid);
    headers['content-type'] = 'application/json'
    var url = `https://bots.kore.ai/api/public/bot/${botid}/getSessions`;
    console.log("URL" + url + "\nBody" + JSON.stringify(body) + "\nheaders" + JSON.stringify(headers));
    try {
        var resp = await axios({
            method: 'post',
            url: url,
            data: body,
            headers: headers
        })
        //console.log("response in getTime", resp.data);
        //console.log(resp.data.sessions[0])
        return resp.data.sessions[0];
    }
    catch (error) {
        console.log("error" + error);
    }

}

async function getAgentId(sesssionId,botid) {
    var body = {
        "sessionId": sesssionId
    };
    console.log("body in get agent details", JSON.stringify(body));
    var headers = {};
    headers.auth = index(botid);
    headers['content-type'] = 'application/json';
    var url = `https://bots.kore.ai/api/public/bot/${botid}/conversationDetails`;
    console.log("url in get agent details", url);
    console.log("\n body in get aget details", JSON.stringify(body));
    console.log("\nheaders", JSON.stringify(headers));
    try {
        var response = await axios({
            url: url,
            method: 'POST',
            data: body,
            headers: headers
        });

        let i = 0;
        var agent_id = "";
        for (i = 0; i < response.data.conversationHistory.length; i++) {
            if (response.data.conversationHistory[i].author && response.data.conversationHistory[i].author.type == "AGENT") {
                console.log(response.data.conversationHistory[i].author)
                agent_id = response.data.conversationHistory[i].author.nickName;
                break;
            }
        }

        console.log(i);
        console.log("agentid", agent_id);
        if (agent_id) {
            return agent_id;
        }
        else {
            return "NA";
        }

    }
    catch (error) {
        console.log(error);
    }
}

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
    botId: botId,
    botName: botName,

    on_user_message: async function (requestId, data, callback) {

        let userId = data.context.session.BotUserSession.channels[0].userId;
        console.log(userId);
        if (data.context.session.BotUserSession.channels[0].type == "rtm") {
            var value = data.message;
            await client.set(data.context.session.BotUserSession.channels[0].userId + "_expiry", JSON.stringify(data));
            client.expire(data.context.session.BotUserSession.channels[0].userId + "_expiry", 120);
            await client.set(data.context.session.BotUserSession.channels[0].userId + "_data", JSON.stringify(data));
            console.log("Hello after if node of setting data");
        }
        // console.log("data:",JSON.stringify(data));
        if (data.message === "Hi") {
            data.message = "Hello";
            //Sends back 'Hello' to user.
            return sdk.sendUserMessage(data, callback);
        } else if (!data.agent_transfer) {
            if (data.message == "forceClosure") {
                var datatobeused = await client.get(data.context.session.BotUserSession.channels[0].userId + "_datatobeused");
                console.log("In force closure");
                console.log("datatobeused", datatobeused)
                var return_variable = closeData(datatobeused);
                console.log("returned varaible :: ", return_variable);
                data.message = "You Are Successfully Logged Out!";
                sdk.sendUserMessage(data, callback);
                sdk.closeConversationSession(data, callback);
            }
            else {
                console.log("OUM : Message : " + data.message);
                return sdk.sendBotMessage(data, callback);
            }
        } else {
            return sdk.sendBotMessage(data, callback);
        }
    },
    on_bot_message: function (requestId, data, callback) {
        if (data.message === 'hello') {
            data.message = 'The Bot says hello!';
        }
        //Sends back the message to user

        return sdk.sendUserMessage(data, callback);
    },
    on_agent_transfer: function (requestId, data, callback) {

        return callback(null, data);
    },
    on_event: async function (requestId, data, callback) {
        console.log("on_event -->  Event : ", data.event);
        console.log("data.event", data.event);
        if (data.event.eventType == "endDialog" && data.context.session.BotUserSession.loginStatus == "success" && (data.context.session.BotUserSession.channels[0].streamId != Object.keys(config.credentials)[0] || data.context.session.BotUserSession.channels[0].streamId != Object.keys(config.credentials)[4])) {
            console.log("In If");
            var a = await client.get(data.context.session.BotUserSession.channels[0].userId);
            if (data.context.session.BotUserSession.usecase) {
                console.log("Intent-code=====" + data.context.session.BotUserSession.usecase);
                if (a) {
                    if (a.includes(data.context.session.BotUserSession.usecase) != true) {
                        console.log("a+data.context.session.BotUserSession.usecase", a + data.context.session.BotUserSession.usecase);
                        await client.set(data.context.session.BotUserSession.channels[0].userId, a + " , " + data.context.session.BotUserSession.usecase);
                    }
                }
                else
                    await client.set(data.context.session.BotUserSession.channels[0].userId, data.context.session.BotUserSession.usecase);
            }
            let tone_value = await client.get(data.context.session.BotUserSession.channels[0].userId + "_tone");
            var tone = data.context.dialog_tone;
            console.log("tone:: " + JSON.stringify(tone));
            for (var i = 0; tone && i < tone.length; i++) {
                if (tone[i].tone_name == "positive") {
                    tone[i].tone_name = "Happy";
                    console.log("tone[i].tone_name::", tone[i].tone_name);
                }
                if (!tone_value) {
                    tone_value = tone[i].tone_name;
                }
                else if (tone && !tone_value.includes(tone[i].tone_name)) {
                    tone_value += " , " + tone[i].tone_name;
                }
            }
            console.log("tone_value==== ::", tone_value);
            await client.set(data.context.session.BotUserSession.channels[0].userId + "_tone", tone_value)
            var a = data.context.session.BotUserSession.channels[0].userId + "_id";
            await client.set(a, data.context.session.BotUserSession.customerID);
            await client.set(data.context.session.BotUserSession.channels[0].userId + "_botid", data.context.session.BotUserSession.channels[0].streamId);
            await client.set(data.context.session.BotUserSession.channels[0].userId + "_datatobeused", JSON.stringify(data));
            console.log("Hello before number channels")
            if (data.context.session.UserSession.Caller) {
                await client.set(data.context.session.BotUserSession.channels[0].userId+"_Number",data.context.session.UserSession.Caller);
            }
        }

        if (data.event.eventType == "sessionClosure" && await client.get(data.context.session.BotUserSession.channels[0].userId + "_id") != null && (data.context.session.BotUserSession.channels[0].streamId == Object.keys(config.credentials)[0] || data.context.session.BotUserSession.channels[0].streamId == Object.keys(config.credentials)[4])) {

            // console.log("\n==================================\n", "Data, ", data, "\n=======================================");
            // console.log(data.context.session.BotUserSession.channels[0].streamId, "=========", "logging");
            // console.log("data.context.session.BotUserSession.channels[0].userId" + data.context.session.BotUserSession.channels[0].userId);
            // console.log("getValueFromRedis(data.context.session.BotUserSession.channels[0].userId)" + await client.get(data.context.session.BotUserSession.channels[0].userId));
            // var code = await client.get(data.context.session.BotUserSession.channels[0].userId);
            // var tone_fromredis = await client.get(data.context.session.BotUserSession.channels[0].userId + "_tone");
            // console.log("======================\n::tone_fromredis::" + tone_fromredis + "\n==============================");
            // console.log("====================================\nCode", code, "\n------------------------------");
            // await client.del(data.context.session.BotUserSession.channels[0].userId);
            // await client.del(data.context.session.BotUserSession.channels[0].userId + "_tone");
            // var time = await getTime(data.context.session.BotUserSession.channels[0].sessionId);
            // console.log(time);
            // console.log("Starttime" + time.start_time + "end time" + time.end_time);
            // var agent_id = await getAgentId(data.context.session.BotUserSession.channels[0].sessionId);
            // var customerID = await client.get(data.context.session.BotUserSession.channels[0].userId + "_id")
            // await client.del(data.context.session.BotUserSession.channels[0].userId + "_id");
            // var body = {};
            // var a = code || data.context.session.BotUserSession.channels[0].body || "testing Intent"
            // if (agent_id == "NA") {
            //     body = {
            //         "subject": "Chat Interaction Record",
            //         "actualstart": time.start_time,
            //         "actualend": time.end_time,
            //         "msdyn_ocliveworkitemid": data.context.session.BotUserSession.channels[0].sessionId,
            //         "description": a,
            //         "ufcu_chathistorylink": `${config.app.url}${config.app.apiPrefix}/history/index.html?sessionId=` + data.context.session.BotUserSession.channels[0].sessionId,
            //         "msdyn_customer_msdyn_ocliveworkitem_contact@odata.bind": "/contacts(ufcu_personnumber='" + customerID + "')",
            //         "ufcu_interactionsentiment": tone_fromredis || "Neutral",
            //         "ufcu_chatorigin": 679830004,
            //         "statecode": 4,
            //         "statuscode": 1
            //     };

            // }
            // else {
            //     body = {
            //         "subject": "Chat Interaction Record",
            //         "msdyn_activeagentid_msdyn_ocliveworkitem@odata.bind": "/systemusers(ufcu_userpersnbr='" + agent_id + "')",
            //         "actualstart": time.start_time,
            //         "actualend": time.end_time,
            //         "msdyn_ocliveworkitemid": data.context.session.BotUserSession.channels[0].sessionId,
            //         "description": a,
            //         "ufcu_chathistorylink": `${config.app.url}${config.app.apiPrefix}/history/index.html?sessionId=` + data.context.session.BotUserSession.channels[0].sessionId,
            //         "msdyn_customer_msdyn_ocliveworkitem_contact@odata.bind": "/contacts(ufcu_personnumber='" + customerID + "')",
            //         "ufcu_interactionsentiment": tone_fromredis || "Neutral",
            //         "ufcu_chatorigin": 679830004,
            //         "statecode": 4,
            //         "statuscode": 1
            //     };
            // }
            // console.log("body" + JSON.stringify(body));

            // var used_bot_id = await client.get(data.context.session.BotUserSession.channels[0].userId + "_botid");
            // let reqoptions, URL_CRM
            // if (used_bot_id == Object.keys(config.credentials)[1]) {

            //     reqoptions = {
            //         method: 'POST',
            //         headers: UFCU_data.SIT.headers,
            //     };
            //     URL_CRM = UFCU_data.SIT.URL
            // }
            // else if (used_bot_id == Object.keys(config.credentials)[2]) {
            //     reqoptions = {
            //         method: 'POST',
            //         headers: UFCU_data.UAT.headers,
            //     };
            //     URL_CRM = UFCU_data.UAT.URL
            // }
            // console.log(reqoptions);

            // try {

            //     console.log("session has been closed");
            //     var response = await axios({
            //         url: URL_CRM,
            //         method: reqoptions.method,
            //         headers: reqoptions.headers,
            //         data: JSON.stringify(body)
            //     });
            //     console.log(response);
            //     if (response.status == 201) {
            //         console.log("data has been inserted");
            //         var activityid = response.data.activityid;
            //         var body = JSON.stringify({
            //             "statecode": 1,
            //             "statuscode": 4
            //         })
            //         try {
            //             var response = await axios({
            //                 url: URL_CRM + "(" + activityid + ")",
            //                 method: 'patch',
            //                 headers: reqoptions.headers,
            //                 data: JSON.stringify(body)
            //             });
            //             if (response.status == 200) {
            //                 console.log("entry has been closed");
            //                 console.log("response", response.data)
            //             }
            //         }
            //         catch (error) {
            //             console.log("error.message:", error)
            //         }
            //     }
            //     else {
            //         var body = {
            //             "data": {
            //                 "agentID": agent_id,
            //                 "customerId": customerID,
            //                 "actualend": time.end_time,
            //                 "ufcu_chathistorylink": `${config.app.url}${config.app.apiPrefix}/history/index.html?sessionId=` + data.context.session.BotUserSession.channels[0].sessionId,
            //                 "actualstart": time.start_time,
            //                 "intent": a,
            //                 "sessionId": data.context.session.BotUserSession.channels[0].sessionId,
            //                 "ufcu_interactionsentiment": tone_fromredis || "Neutral"
            //             }
            //         }
            //         var response = await axios({
            //             url: UFCU_data.Data_table.URL,
            //             headers: UFCU_data.Data_table.headers,
            //             data: body,
            //             method: 'POST'
            //         })
            //         if (response.status == 200) {
            //             console.log("The data has been fed in to the Table - CRM_Failed_instances");
            //         }
            //         else {
            //             console.log("The data has not been feed in to the table - CRM_Failed_instances ")
            //         }
            //     }
            // }
            // catch (error) {
            //     console.log("error.message:" + error.message);
            // }
            if (data.context.session.BotUserSession.channels[0].type == "rtm" || data.context.session.BotUserSession.channels[0].type == "smartassist" ) {
                raiseincident(data);
            }
            else {
                raiseIvrIncident(data);
            }
            // }
        }

        return callback(null, data);
    },
    on_client_event: function (requestId, data, callback) {
        console.log("data.context.session.botUserSession" + JSON.stringify(data.context.session.BotUserSession));
        console.log("requestID", requestId);
        data.context.session.BotUserSession = {};
        console.log("BotUserSession", JSON.stringify(data.context.session.BotUserSession));
        sdk.sendBotEvent(data, callback);
    },
    on_alert: function (requestId, data, callback) {
        console.log("on_alert -->  : ", data, data.message);
        return sdk.sendAlertMessage(data, callback);
    },
    gethistory: gethistory
};





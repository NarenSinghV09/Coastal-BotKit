function resetSessionCounter(uuid, data) {
    try {
        clearInterval(sessionReminderTimerMap[uuid]);
        const sessionId = data.context.session.BotUserSession.conversationSessionId;
        let inactivityReminder = setTimeout(() => {

                    return sdk.sendUserMessage(data);
        }, 580000);

        sessionReminderTimerMap[uuid] = inactivityReminder;
    }catch(error){

    }
}
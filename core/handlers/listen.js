import moment from 'moment-timezone';
import handleEvents from './events.js';
import { handleDatabase } from './database.js';
import logger from '../var/modules/logger.js';

export default async function handleListen(listenerID) {
    const {
        handleCommand,
        handleReaction,
        handleMessage,
        handleReply,
        handleUnsend,
        handleEvent
    } = await handleEvents();

    const eventlog_excluded = ["typ", "presence", "read_receipt"];
    const logger = global.modules.get('logger');

    function handleEventLog(event) {
        const { LOG_LEVEL, timezone, selfListenEvent } = global.config;
        const botID = global.botID || listenerID;

        if (!selfListenEvent && event.senderID === botID) return;

        if (LOG_LEVEL == 0) return;
        if (eventlog_excluded.includes(event.type)) return;

        const { type, threadID, body, senderID } = event;
        if (LOG_LEVEL == 1) {
            let time = moment().tz(timezone).format('YYYY-MM-DD_HH:mm:ss');
            if (type == 'message' || type == 'message_reply') {
                logger.custom(`${threadID} • ${senderID} • ${body ? body : 'Photo, video, sticker, etc.'}`, `${time}`);
            } else {
                logger.custom(`${threadID} • ${senderID} • ${type}`, `${time}`);
            }
        }
    }

    return async function (event) {
        try {
            handleEventLog(event);
            await handleDatabase(event);

            switch (event.type) {
                case "message":
                case "message_reply":
                    await handleMessage(event);
                    break;
                case "event":
                    await handleEvent(event);
                    break;
                case "message_reaction":
                    await handleReaction(event);
                    break;
                case "message_unsend":
                    await handleUnsend(event);
                    break;
            }
        } catch (e) {
            console.error(e);
        }
    };
}

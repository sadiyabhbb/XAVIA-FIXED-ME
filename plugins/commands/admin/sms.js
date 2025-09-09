import axios from 'axios';

const config = {
    name: "sms",
    description: "Send SMS via custom API",
    usage: "/sms <number> <message>",
    cooldown: 3,
    permissions: [2], // Example: Only admin can use
    credits: "LIKHON AHMED"
};

/**
 * Function to send SMS
 * @param {string} number - Phone number to send SMS
 * @param {string} message - Message to send
 */
async function sendSMS(number, message) {
    try {
        const url = `https://cusotm-ck.onrender.com/send?to=${encodeURIComponent(number)}&msg=${encodeURIComponent(message)}`;
        const response = await axios.get(url);
        return response.data;
    } catch (err) {
        console.error("Failed to send SMS:", err.message);
        throw err;
    }
}

export async function onCall({ message, args, userPermissions }) {
    // Check permissions
    const isAdmin = userPermissions.some(p => p == 2 || p == 3);
    if (!isAdmin) return message.reply("You don’t have enough permission to use this command.");

    // Validate args
    if (args.length < 2) return message.reply("Usage: /sms <number> <message>");

    const number = args[0];
    const smsMessage = args.slice(1).join(" ");

    try {
        const result = await sendSMS(number, smsMessage);
        message.reply(`SMS sent successfully!\nResponse: ${JSON.stringify(result)}`);
    } catch (err) {
        message.reply("Failed to send SMS. Check the console for details.");
    }
}

export default {
    config,
    onCall
};

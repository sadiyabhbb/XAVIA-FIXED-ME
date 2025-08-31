import axios from 'axios';

const config = {
    name: "bomb",
    description: "Send calls via bomb API",
    usage: "/bomb <phone> <count>",
    cooldown: 3,
    permissions: [2],
    credits: "Your Name"
};

export async function onCall({ message, userPermissions, args }) {
    if (!userPermissions.includes(2)) return message.reply("You don't have permission to use this command.");
    if (!args || args.length < 2) return message.reply("Usage: /bomb <phone> <count>");

    const phone = args[0].replace(/[^0-9]/g, '');
    const count = parseInt(args[1]);

    if (!/^\d{11}$/.test(phone)) return message.reply("Invalid phone number. Must be 11 digits.");
    if (isNaN(count) || count < 1) return message.reply("Invalid count. Must be a number greater than 0.");

    const url = `https://bomb-server-gyhr.onrender.com/call-api?phone=${phone}&count=${count}`;

    try {
        const res = await axios.get(url);

        // Mask phone number for privacy (e.g., 01761838316 → 01761***316)
        const maskedPhone = phone.slice(0, 5) + "***" + phone.slice(-3);

        // Count successful OTPs
        const successCount = Array.isArray(res.data) ? res.data.length : 0;

        message.reply(`✅ OTP sent successfully to ${maskedPhone} (${successCount} times)`);
    } catch (err) {
        message.reply(`❌ Error calling API: ${err.message}`);
    }
}

export default {
    config,
    onCall
};

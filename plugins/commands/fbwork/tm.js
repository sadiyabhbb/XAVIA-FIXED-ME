import axios from "axios";

const DOMAINS = [
  '@iicloud.com.vn',
  '@mail10s.top',
  '@hotmail999.com',
  '@mailshopee.io.vn',
  '@gmail.com'
];

const config = {
  name: "tm",
  description: "Generate a temp mail and wait for Facebook OTP",
  usage: "/tm",
  cooldown: 5,
  permissions: [0],
  credits: "ChatGPT + Likhon"
};

function generateRandomUsername(length = 8) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function onCall({ message, api, event }) {
  try {
    const threadID = event.threadID;
    const username = generateRandomUsername();
    const domain = DOMAINS[Math.floor(Math.random() * DOMAINS.length)];
    const email = `${username}${domain}`;

    await message.reply(`✅ আপনার অস্থায়ী মেইল:\n\`\`\`\n${email}\n\`\`\`\n\n📨 এখন Facebook OTP আসলে এখানে অটো আসবে!`);

    // Watch for mail every 10s
    const interval = setInterval(async () => {
      try {
        const res = await axios.get(`https://hotmail999.com/api/get_mail.php?email=${encodeURIComponent(email)}`);
        const data = res.data;

        if (data?.status && data?.data?.length > 0) {
          const mail = data.data[0];
          const content = `🔔 *𝐅𝐀𝐂𝐄𝐁𝐎𝐎𝐊 OTP Received!*\n\n` +
            `📧 Mail: \`${email}\`\n` +
            `🕒 Time: ${mail.date || 'Unknown'}\n` +
            `✉️ From: ${mail.from_field || 'Unknown'}\n` +
            `🔑 OTP: \`${mail.code || 'Not Found'}\`\n\n` +
            `📨 Message:\n\`\`\`\n${mail.subject || 'No Subject'}\n\`\`\``;

          api.sendMessage(content, threadID);
          clearInterval(interval); // Stop once received
        }
      } catch (err) {
        console.log("Mail check error:", err.message);
      }
    }, 10000);
  } catch (error) {
    console.log("❌ TM command error:", error.message);
    return message.reply("❌ কিছু ভুল হয়েছে। দয়া করে আবার চেষ্টা করুন।");
  }
}

export default {
  config,
  onCall
};

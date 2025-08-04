import axios from "axios";

const DOMAINS = [
  '@iicloud.com.vn',
  '@mail10s.top',
  '@hotmail999.com',
  '@mailshopee.io.vn',
  '@gmail.com'
];

// Random username generator
function generateRandomUsername(length = 8) {
  const chars = "abcdefghijklmnopqrstuvwxyz0123456789";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

// MAIN COMMAND
const config = {
  name: "tm",
  description: "Generate temp mail and auto fetch Facebook OTP",
  usage: "",
  cooldown: 5,
  permissions: [0],
  credits: "ChatGPT + Likhon"
};

async function onCall({ message, api, event }) {
  const threadID = event.threadID;
  const username = generateRandomUsername();
  const domain = DOMAINS[Math.floor(Math.random() * DOMAINS.length)];
  const email = `${username}${domain}`;

  message.reply(`✅ আপনার অস্থায়ী মেইল:\n\`\`\`\n${email}\n\`\`\`\n\n📨 এখন Facebook OTP আসলে এখানে অটো আসবে!`);

  const interval = setInterval(async () => {
    try {
      const url = `https://hotmail999.com/api/get_mail.php?email=${encodeURIComponent(email)}`;
      const res = await axios.get(url);
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
        clearInterval(interval);
      }
    } catch (error) {
      console.error("❌ Mail check failed:", error.message);
    }
  }, 10000); // check every 10 seconds
}

export default {
  config,
  onCall
};

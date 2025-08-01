import axios from "axios";

const config = {
  name: "tikinfo",
  version: "1.0.0",
  permissions: 0,
  credits: "ArYAN",
  description: "Get TikTok profile info by username",
  usages: "<username>",
  cooldown: 5,
};

async function onCall({ message, args }) {
  const username = args.join(" ");
  if (!username) return message.reply("❌ Please provide a TikTok username.");

  const apiUrl = `https://api-aryan-xyz.vercel.app/tikstalk?username=${encodeURIComponent(username)}&apikey=ArYAN`;

  try {
    const res = await axios.get(apiUrl, { timeout: 10000 }); // 10s timeout
    const data = res.data?.result;

    if (!data) return message.reply("❌ Couldn't get profile data.");

    const body = 
`🎀 𝗧𝗶𝗸𝗧𝗼𝗸 𝗣𝗿𝗼𝗳𝗶𝗹𝗲 𝗜𝗻𝗳𝗼 🎀

👤 𝗡𝗶𝗰𝗸𝗻𝗮𝗺𝗲: ${data.username}
🔰 𝗨𝘀𝗲𝗿𝗻𝗮𝗺𝗲: @${data.nickname}
🆔 𝗜𝗗: ${data.id}
🖋️ 𝗕𝗶𝗼: ${data.signature || "❌ No bio set"}

🎬 𝗩𝗶𝗱𝗲𝗼𝘀: ${data.videoCount}
👥 𝗙𝗼𝗹𝗹𝗼𝘄𝗲𝗿𝘀: ${data.followerCount}
👣 𝗙𝗼𝗹𝗹𝗼𝘄𝗶𝗻𝗴: ${data.followingCount}
❤️ 𝗟𝗶𝗸𝗲𝘀: ${data.heartCount}
📌 𝗗𝗶𝗴𝗴𝘀: ${data.diggCount}
🛡️ 𝗢𝗽𝗲𝗿𝗮𝘁𝗼𝗿: ${res.data?.operator || "Unknown"}
`;

    await message.reply({
      body,
      attachment: await global.getStreamFromURL(data.avatarLarger)
    });

  } catch (err) {
    console.error("[tikinfo error]", err.message);

    return message.reply(
      `⚠️ Failed to fetch TikTok info.\n` +
      `🔁 Reason: ${err.code === "ENOTFOUND" ? "API unavailable" : err.message}`
    );
  }
}

export default {
  config,
  onCall,
};

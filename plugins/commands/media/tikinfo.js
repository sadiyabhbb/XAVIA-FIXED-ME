import axios from "axios";

const config = {
  name: "tikinfo",
  version: "0.0.8",
  permissions: 0,
  credits: "ArYAN",
  description: "Get TikTok profile info by username",
  usages: "<username>",
  cooldown: 5
};

async function onCall({ message, args }) {
  const username = args.join(" ");
  if (!username) return message.reply("❌ Please provide a TikTok username.");

  try {
    const res = await axios.get(`https://api-aryan-xyz.vercel.app/tikstalk?username=${encodeURIComponent(username)}&apikey=ArYAN`);
    const data = res.data.result;

    const info = 
`🌟 𝑻𝒊𝒌𝑻𝒐𝒌 𝑼𝒔𝒆𝒓 𝑰𝒏𝒇𝒐 🌟

👑 𝗡𝗮𝗺𝗲: ${data.username}
💠 𝗨𝘀𝗲𝗿𝗻𝗮𝗺𝗲: @${data.nickname}
🆔 𝗜𝗗: ${data.id}
📝 𝗕𝗶𝗼: ${data.signature || "🙅 No bio set"}
🎞️ 𝗧𝗼𝘁𝗮𝗹 𝗩𝗶𝗱𝗲𝗼𝘀: ${data.videoCount}
👥 𝗙𝗼𝗹𝗹𝗼𝘄𝗲𝗿𝘀: ${data.followerCount}
👩‍❤️‍👩 𝗙𝗼𝗹𝗹𝗼𝘄𝗶𝗻𝗴: ${data.followingCount}
❤️ 𝗧𝗼𝘁𝗮𝗹 𝗟𝗶𝗸𝗲𝘀: ${data.heartCount}
📌 𝗧𝗼𝘁𝗮𝗹 𝗗𝗶𝗴𝗴𝘀: ${data.diggCount}
`;

    await message.reply({
      body: info,
      attachment: await global.getStreamFromURL(data.avatarLarger)
    });

  } catch (err) {
    console.error(err);
    message.reply("❌ Failed to fetch TikTok info.");
  }
}

export default {
  config,
  onCall
};

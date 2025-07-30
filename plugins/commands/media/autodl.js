const axios = require("axios");
const fs = require("fs-extra");
const path = require("path");

module.exports = {
  config: {
    name: "autodl",
    version: "2.0",
    author: "Dipto",
    credits: "Fixed by ChatGPT for Xavia Bot",
    description: "Auto download from TikTok, Facebook, YouTube, Instagram and more.",
    category: "media",
    usages: "[url]",
    cooldowns: 5,
  },

  onStart: async function () {},

  onChat: async function ({ message, event, api }) {
    const body = event.body || "";

    const isUrl = (url) =>
      url.startsWith("https://vt.tiktok.com") ||
      url.startsWith("https://www.tiktok.com/") ||
      url.startsWith("https://vm.tiktok.com") ||
      url.startsWith("https://www.facebook.com") ||
      url.startsWith("https://fb.watch") ||
      url.startsWith("https://www.instagram.com/") ||
      url.startsWith("https://www.instagram.com/p/") ||
      url.startsWith("https://youtu.be/") ||
      url.startsWith("https://youtube.com/") ||
      url.startsWith("https://twitter.com/") ||
      url.startsWith("https://x.com/") ||
      url.startsWith("https://pin.it/");

    if (!isUrl(body)) return;

    try {
      api.setMessageReaction("⌛", event.messageID, true);
      const waitMsg = await message.reply("⏳ Downloading your media, please wait...");

      const baseApi = (
        await axios.get(
          "https://raw.githubusercontent.com/Blankid018/D1PT0/main/baseApiUrl.json"
        )
      ).data.api;

      const res = await axios.get(`${baseApi}/alldl?url=${encodeURIComponent(body)}`);
      const data = res.data;

      let ext = ".mp4";
      let caption = data.cp || "📥 Here's your video";

      if (data.result.includes(".jpg")) {
        ext = ".jpg";
        caption = "📸 Here's your image";
      } else if (data.result.includes(".png")) {
        ext = ".png";
        caption = "📸 Here's your image";
      } else if (data.result.includes(".jpeg")) {
        ext = ".jpeg";
        caption = "📸 Here's your image";
      }

      const filePath = path.join(__dirname, "cache", `autodl${ext}`);
      const file = await axios.get(data.result, { responseType: "arraybuffer" });

      fs.writeFileSync(filePath, Buffer.from(file.data, "binary"));

      const shortUrl = (
        await axios.get(`https://tinyurl.com/api-create.php?url=${data.result}`)
      ).data;

      api.setMessageReaction("✅", event.messageID, true);
      api.unsendMessage(waitMsg.messageID);

      await message.reply(
        {
          body: `${caption}\n🔗 Link: ${shortUrl}`,
          attachment: fs.createReadStream(filePath),
        },
        () => fs.unlinkSync(filePath)
      );
    } catch (err) {
      console.error(err);
      api.setMessageReaction("❌", event.messageID, true);
      message.reply("❌ Failed to download.\nError: " + err.message);
    }
  },
};

import axios from "axios";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = {
  name: "4k",
  version: "1.1",
  credits: "Modified By LIKHON AHMED",
  description: "Upscale a replied image to 4K using API",
  cooldown: 3
};

async function onCall({ message }) {
  const replyMsg = message.messageReply;

  if (!replyMsg || !replyMsg.attachments || replyMsg.attachments.length === 0) {
    return message.reply("❌ Please reply to an image.");
  }

  const attachment = replyMsg.attachments[0];
  if (attachment.type !== "photo" || !attachment.url) {
    return message.reply("❌ Only image replies are supported.");
  }

  const apiURL = `https://aryan-xyz-upscale-api-phi.vercel.app/api/upscale-image?imageUrl=${encodeURIComponent(attachment.url)}&apikey=ArYANAHMEDRUDRO`;
  const filePath = path.join(__dirname, "cache", `upscaled.jpg`);

  try {
    const response = await axios.get(apiURL);
    const upscaledUrl = response.data?.upscaled?.url;

    if (!upscaledUrl) {
      return message.reply("⚠️ Couldn't upscale the image. Try a different one.");
    }

    const image = await axios.get(upscaledUrl, { responseType: "arraybuffer" });
    await fs.ensureDir(path.join(__dirname, "cache"));
    fs.writeFileSync(filePath, image.data);

    await message.send({
      body: "✅ Here's your 4K image!",
      attachment: fs.createReadStream(filePath)
    });

    fs.unlinkSync(filePath);
  } catch (err) {
    console.error("Upscale error:", err.message);
    message.reply("❌ Failed to upscale the image. Please try again.");
  }
}

export default {
  config,
  onCall
};

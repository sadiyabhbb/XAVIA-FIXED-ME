import axios from "axios";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config = {
  name: "image",
  version: "1.0",
  credits: "Modified by LIKHON",
  description: "Reply to image to upscale with /4k and return image",
  cooldown: 3
};

async function onCall({ message }) {
  const replyMsg = message.messageReply;

  if (!replyMsg || !replyMsg.attachments || replyMsg.attachments.length === 0) {
    return message.reply("❌ Reply on a photo");
  }

  const attachment = replyMsg.attachments[0];

  if (attachment.type !== "photo" || !attachment.url) {
    return message.reply("❌ Just working reply on a photo");
  }

  const upscaleUrl = attachment.url.endsWith("/")
    ? attachment.url + "4k"
    : attachment.url + "/4k";

  const filePath = path.join(__dirname, "cache", `upscaled.jpg`);

  try {
    const res = await axios.get(upscaleUrl, { responseType: "arraybuffer" });
    await fs.ensureDir(path.join(__dirname, "cache"));
    fs.writeFileSync(filePath, res.data);

    await message.send({
      body: "📷 4K Ready!",
      attachment: fs.createReadStream(filePath)
    });

    fs.unlinkSync(filePath); // Cache মুছে ফেলা
  } catch (err) {
    console.error("Upscale error:", err.message);
    message.reply("⚠️ Image Not Supported!");
  }
}

export default {
  config,
  onCall
};

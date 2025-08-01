import axios from "axios";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import ytSearch from "yt-search";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cachePath = path.join(process.cwd(), "plugins", "commands", "cache");

const config = {
  name: "sing",
  aliases: ["music", "song"],
  version: "1.0.1",
  credits: "ArYAN",
  description: "Download MP3 audio from YouTube by song name",
  usages: "<song name>",
  cooldown: 5,
  permissions: 0,
  commandCategory: "music",
};

function sanitizeFileName(name) {
  return name.replace(/[<>:"/\\|?*]/g, "").substring(0, 100);
}

async function onCall({ message, args }) {
  const query = args.join(" ");
  if (!query) return message.reply("❌ Please provide a song name.");

  const msg = await message.reply("🔍 Searching...");

  try {
    const search = await ytSearch(query);
    const video = search.videos[0];
    if (!video) {
      await message.unsend(msg.messageID);
      return message.reply("❌ No song found.");
    }

    const apiUrl = `https://xyz-nix.vercel.app/aryan/youtube?id=${video.videoId}&type=audio&apikey=itzaryan`;

    const res = await axios.get(apiUrl, { timeout: 10000 });

    console.log("API Response:", res.data);

    const downloadUrl = res.data?.downloadUrl;
    if (!downloadUrl) {
      await message.unsend(msg.messageID);
      return message.reply("❌ Couldn't get the audio link from API.");
    }

    await fs.ensureDir(cachePath);

    const fileName = sanitizeFileName(`${video.title}.mp3`);
    const filePath = path.join(cachePath, fileName);

    const writer = fs.createWriteStream(filePath);
    const response = await axios({
      url: downloadUrl,
      method: "GET",
      responseType: "stream",
      timeout: 30000,
    });

    response.data.pipe(writer);

    await new Promise((resolve, reject) => {
      writer.on("finish", resolve);
      writer.on("error", reject);
    });

    await message.reply({
      body: `🎧 ${video.title}`,
      attachment: fs.createReadStream(filePath),
    });

    await fs.unlink(filePath);
    await message.unsend(msg.messageID);
  } catch (err) {
    console.error("Error details:", err.response?.data || err.message || err);
    try {
      await message.unsend(msg.messageID);
    } catch {}
    message.reply("❌ Failed to fetch the song. Try again later.");
  }
}

export default {
  config,
  onCall,
};

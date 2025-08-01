import axios from "axios";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import ytSearch from "yt-search";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const cachePath = path.join(__dirname, "cache");

const config = {
  name: "sing",
  aliases: ["music", "song"],
  version: "1.0.0",
  credits: "ArYAN",
  description: "Download audio from YouTube by song name",
  usages: "<song name>",
  cooldown: 5,
  permissions: 0,
  commandCategory: "music"
};

async function onCall({ message, args }) {
  const query = args.join(" ");
  if (!query) return message.reply("Please provide a song name.");

  const msg = await message.reply("🔎 Searching for song...");

  try {
    const search = await ytSearch(query);
    const video = search.videos[0];
    if (!video) return message.reply("❌ No song found.");

    const apiUrl = `https://xyz-nix.vercel.app/aryan/youtube?id=${video.videoId}&type=audio&apikey=itzaryan`;

    const res = await axios.get(apiUrl);
    const downloadUrl = res.data.downloadUrl;

    const fileName = `${video.title}.mp3`;
    const filePath = path.join(cachePath, fileName);
    const response = await axios.get(downloadUrl, { responseType: "arraybuffer" });

    await fs.ensureDir(cachePath);
    await fs.writeFile(filePath, response.data);

    await message.reply({
      body: `🎵 ${video.title}`,
      attachment: fs.createReadStream(filePath)
    });

    await fs.unlink(filePath);
    await message.unsend(msg.messageID);
  } catch (err) {
    console.error(err);
    message.reply("❌ Failed to fetch the song.");
  }
}

export default {
  config,
  onCall
};

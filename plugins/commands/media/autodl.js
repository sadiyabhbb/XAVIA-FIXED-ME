import axios from "axios";
import fs from "fs-extra";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const config = {
  name: "autodl",
  version: "2.1",
  author: "Dipto",
  credits: "Fixed by ChatGPT",
  description: "Download video/image from TikTok, Facebook, YouTube, Instagram and more.",
  category: "media",
  usages: "[url]",
  cooldowns: 5,
};

export async function onStart() {}

export async function onCall({ api, event }) {
  const body = event.body || "";

  const supportedUrls = [
    "https://vt.tiktok.com",
    "https://www.tiktok.com/",
    "https://vm.tiktok.com",
    "https://www.facebook.com",
    "https://fb.watch",
    "https://www.instagram.com/",
    "https://www.instagram.com/p/",
    "https://youtu.be/",
    "https://youtube.com/",
    "https://x.com/",
    "https://twitter.com/",
    "https://pin.it/",
  ];

  if (!supportedUrls.some((u) => body.startsWith(u))) return;

  try {
    api.setMessageReaction("⌛", event.messageID, true);
    const waiting = await api.sendMessage("📥 Downloading your media...", event.threadID);

    const res = await axios.get(
      `https://nayan-video-downloader.vercel.app/alldown?url=${encodeURIComponent(body)}`
    );

    const d = res.data;

    if (!d || !d.result) {
      throw new Error("❌ Could not retrieve media URL.");
    }

    const fileUrl = d.result;
    const ext = fileUrl.match(/\.(jpg|jpeg|png|mp4)/)?.[0] || ".mp4";
    const caption =
      ext.includes("jpg") || ext.includes("png") || ext.includes("jpeg")
        ? "📸 Here's your image"
        : d.cp || "📽️ Here's your video";

    const filePath = path.join(__dirname, "cache", `autodl${ext}`);
    const fileRes = await axios.get(fileUrl, { responseType: "arraybuffer" });
    fs.writeFileSync(filePath, Buffer.from(fileRes.data));

    const shortUrl = (
      await axios.get(`https://tinyurl.com/api-create.php?url=${fileUrl}`)
    ).data;

    api.setMessageReaction("✅", event.messageID, true);
    api.unsendMessage(waiting.messageID);

    await api.sendMessage(
      {
        body: `${caption}\n🔗 Link: ${shortUrl}`,
        attachment: fs.createReadStream(filePath),
      },
      event.threadID,
      () => fs.unlinkSync(filePath)
    );
  } catch (err) {
    console.error("Download Error:", err.message);
    api.setMessageReaction("❌", event.messageID, true);
    api.sendMessage(
      `❌ Failed to download media.\n📛 Error: ${err.message}`,
      event.threadID,
      event.messageID
    );
  }
}

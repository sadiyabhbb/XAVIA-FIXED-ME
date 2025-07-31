import axios from 'axios';
import fs from 'fs-extra';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const config = {
  name: 'pinterest',
  version: '0.0.8',
  credits: 'ArYAN',
  description: 'Image search',
  usages: '<query> - <amount>',
  cooldowns: 0,
};

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const cacheFolder = './cache';

async function ensureCacheFolderExists() {
  try {
    await fs.ensureDir(cacheFolder);
  } catch (error) {
    console.error('Cache folder creation failed:', error);
  }
}

async function onCall({ api, message, args, prefix }) {
  const { messageID, threadID } = message;
  const input = args.join(' ');

  if (!input.includes('-')) {
    return api.sendMessage(
      `❌ Invalid usage!\nExample: ${prefix}pinterest Naruto - 5`,
      threadID,
      messageID
    );
  }

  const searchQuery = input.substring(0, input.indexOf('-')).trim();
  const amount = parseInt(input.split('-').pop().trim()) || 6;

  await ensureCacheFolderExists();
  await message.react("⏳");

  try {
    const res = await axios.get(`https://aryan-nix-apis.vercel.app/api/pinterest?search=${encodeURIComponent(searchQuery)}&count=${amount}`);
    const images = res.data.data;

    if (!Array.isArray(images) || images.length === 0) {
      return api.sendMessage("❌ No results found!", threadID, messageID);
    }

    const imgData = [];

    for (let i = 0; i < images.length; i++) {
      const imgPath = `${cacheFolder}/pin_${i}.jpg`;
      const imgBuffer = (await axios.get(images[i], { responseType: 'arraybuffer' })).data;
      fs.writeFileSync(imgPath, Buffer.from(imgBuffer));
      imgData.push(fs.createReadStream(imgPath));
    }

    await message.react("✅");

    const bodyMsg = `✅ Pinterest Results for: ${searchQuery}\nTotal: ${images.length} image(s)\n\n` +
      images.map((_, i) => `🖼️ Image ${i + 1}`).join('\n');

    api.sendMessage(
      {
        body: bodyMsg,
        attachment: imgData
      },
      threadID,
      messageID
    );

    for (let i = 0; i < images.length; i++) {
      const imgPath = `${cacheFolder}/pin_${i}.jpg`;
      if (fs.existsSync(imgPath)) fs.unlinkSync(imgPath);
    }

  } catch (err) {
    console.error(err);
    return api.sendMessage("❌ Error while searching Pinterest.", threadID, messageID);
  }
}

export default {
  config,
  onCall,
};

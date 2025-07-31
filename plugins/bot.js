import axios from 'axios';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const config = {
  name: "bot",
  version: "1.0.0",
  aliases: ["mim"],
  permission: 0,
  credits: "nayan",
  description: "talk with bot",
  prefix: 3,
  category: "talk",
  usages: "hi",
  cooldowns: 5,
};

export async function onCall({ message, args, event, users, reply }) {
  try {
    const msg = args.join(" ");
    const name = await users.getName(event.senderID);
    const apiData = await axios.get('https://raw.githubusercontent.com/MOHAMMAD-NAYAN-07/Nayan/main/api.json');
    const apiUrl = apiData.data.sim;
    const apiUrl2 = apiData.data.api2;

    if (!msg) {
      const greetings = [
        "আহ শুনা আমার তোমার অলিতে গলিতে উম্মাহ😇😘",
        "কি গো সোনা আমাকে ডাকছ কেনো",
        "বার বার আমাকে ডাকস কেন😡",
        "আহ শোনা আমার আমাকে এতো ডাক্তাছো কেনো আসো বুকে আশো🥱",
        "হুম জান তোমার অইখানে উম্মমাহ😷😘",
        "আসসালামু আলাইকুম বলেন আপনার জন্য কি করতে পারি",
        "আমাকে এতো না ডেকে বস নয়নকে একটা গফ দে 🙄",
        "jang hanga korba",
        "jang bal falaba🙂"
      ];
      const rand = greetings[Math.floor(Math.random() * greetings.length)];
      return reply(`${name}, ${rand}`);
    }

    if (msg.startsWith("textType")) {
      const selectedStyle = msg.split(" ")[1];
      const options = ['serif', 'sans', 'italic', 'italic-sans', 'medieval', 'normal'];
      if (options.includes(selectedStyle)) {
        saveTextStyle(event.threadID, selectedStyle);
        return reply(`✅ Text style set to "${selectedStyle}"`);
      } else {
        return reply(`❌ Invalid text type! Choose: ${options.join(", ")}`);
      }
    }

    if (msg.startsWith("info")) {
      const res = await axios.get(`${apiUrl}/sim?type=info`);
      return reply(`Total Ask: ${res.data.data.totalKeys}\nTotal Answer: ${res.data.data.totalResponses}`);
    }

    if (msg.startsWith("teach")) {
      const [q, a] = msg.replace("teach", "").trim().split("&").map(i => i.split("=")[1]);
      const res = await axios.get(`${apiUrl}/sim?type=teach&ask=${encodeURIComponent(q)}&ans=${encodeURIComponent(a)}`);
      return reply(`✅ ${res.data.msg}\nAsk: ${res.data.data.ask}\nAns: ${res.data.data.ans}`);
    }

    if (msg.startsWith("delete")) {
      const [q, a] = msg.replace("delete", "").trim().split("&").map(i => i.split("=")[1]);
      const res = await axios.get(`${apiUrl}/sim?type=delete&ask=${encodeURIComponent(q)}&ans=${encodeURIComponent(a)}&uid=${event.senderID}`);
      return reply(res.data.msg || res.data.data.msg);
    }

    if (msg.startsWith("edit")) {
      const [oldQ, newQ] = msg.replace("edit", "").trim().split("&").map(i => i.split("=")[1]);
      const res = await axios.get(`${apiUrl}/sim?type=edit&old=${encodeURIComponent(oldQ)}&new=${encodeURIComponent(newQ)}&uid=${event.senderID}`);
      return reply(res.data.msg || res.data.data?.msg || "No response.");
    }

    if (msg.startsWith("askinfo")) {
      const question = msg.replace("askinfo", "").trim();
      const res = await axios.get(`${apiUrl}/sim?type=keyinfo&ask=${encodeURIComponent(question)}`);
      const answers = res.data.data.answers || [];
      if (!answers.length) return reply(`No info for "${question}"`);
      return reply(`🔎 Info for "${question}":\n${answers.map((a, i) => `📌 ${i + 1}. ${a}`).join("\n")}`);
    }

    if (msg.startsWith("help")) {
      const prefix = global.config.PREFIX || ".";
      return reply(`
📚 Bot Command Help:
────────────────────
🤖 ${prefix}bot askinfo [question]
📚 ${prefix}bot teach ask=[question]&ans=[answer]
❌ ${prefix}bot delete ask=[q]&ans=[a]
✏️ ${prefix}bot edit old=[q1]&new=[q2]
📊 ${prefix}bot info
👋 ${prefix}bot
🎨 ${prefix}bot textType [serif|sans|italic|...]
`);
    }

    // Default Ask
    const res = await axios.get(`${apiUrl}/sim?type=ask&ask=${encodeURIComponent(msg)}`);
    const textStyles = loadTextStyles();
    const userStyle = textStyles[event.threadID]?.style || "normal";

    const fontRes = await axios.get(`${apiUrl2}/bold?text=${res.data.data.msg}&type=${userStyle}`);
    return reply(fontRes.data.data.bolded);

  } catch (error) {
    console.error(error);
    return reply("❌ Something went wrong. Try again later.");
  }
}

export async function onChat({ event, message, users, reply }) {
  const content = message.body.toLowerCase();
  if (content === "bot" || content === "mim") {
    const name = await users.getName(event.senderID);
    const responses = [
      "আহ শুনা আমার তোমার অলিতে গলিতে উম্মাহ😇😘",
      "কি গো সোনা আমাকে ডাকছ কেনো",
      "বার বার আমাকে ডাকস কেন😡",
      "আহ শোনা আমার আমাকে এতো ডাক্তাছো কেনো আসো বুকে আশো🥱",
      "হুম জান তোমার অইখানে উম্মমাহ😷😘",
      "আসসালামু আলাইকুম বলেন আপনার জন্য কি করতে পারি",
      "আমাকে এতো না ডেকে বস নয়নকে একটা গফ দে 🙄",
      "jang hanga korba",
      "jang bal falaba🙂"
    ];
    const rand = responses[Math.floor(Math.random() * responses.length)];
    return reply(`${name}, ${rand}`);
  }
}

// Utility
function loadTextStyles() {
  const filePath = path.join(__dirname, 'system', 'textStyles.json');
  try {
    if (!fs.existsSync(filePath)) fs.writeFileSync(filePath, JSON.stringify({}));
    const data = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    return {};
  }
}

function saveTextStyle(threadID, style) {
  const filePath = path.join(__dirname, 'system', 'textStyles.json');
  const styles = loadTextStyles();
  styles[threadID] = { style };
  fs.writeFileSync(filePath, JSON.stringify(styles, null, 2));
}

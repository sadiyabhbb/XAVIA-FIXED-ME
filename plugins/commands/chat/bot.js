import axios from "axios";
import fs from "fs";
import path from "path";

const config = {
  name: "bot",
  aliases: ["bby"],
  version: "0.0.8",
  description: "nix",
  usage: "bot",
  credits: "nayan fixed by Nix Team",
  cooldown: 5,
  category: "Chat"
};

function loadTextStyles() {
  const filePath = path.join(process.cwd(), "system", "textStyles.json");
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
    }
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch {
    return {};
  }
}

function saveTextStyle(threadID, style) {
  const filePath = path.join(process.cwd(), "system", "textStyles.json");
  const styles = loadTextStyles();
  styles[threadID] = { style };
  fs.writeFileSync(filePath, JSON.stringify(styles, null, 2));
}

export async function onCall({ message, args, event, usersData, prefix }) {
  const msg = args.join(" ");
  const senderID = event.senderID;
  const threadID = event.threadID;

  try {
    const apiData = await axios.get("https://raw.githubusercontent.com/MOHAMMAD-NAYAN-07/Nayan/main/api.json");
    const simApi = apiData.data.sim;
    const styleApi = apiData.data.api2;

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
      const name = await usersData.getName(senderID);
      const rand = greetings[Math.floor(Math.random() * greetings.length)];
      return message.reply({ body: `${name}, ${rand}`, mentions: [{ tag: name, id: senderID }] });
    }

    if (msg.startsWith("textType")) {
      const style = msg.split(" ")[1];
      const validStyles = ["serif", "sans", "italic", "italic-sans", "medieval", "normal"];
      if (!validStyles.includes(style)) {
        return message.reply(`❌ Invalid style. Available: ${validStyles.join(", ")}`);
      }
      saveTextStyle(threadID, style);
      return message.reply(`✅ Text style set to: ${style}`);
    }

    if (msg.startsWith("delete")) {
      const [askPart, ansPart] = msg.replace("delete", "").trim().split("&");
      const ask = askPart?.replace("ask=", "").trim();
      const ans = ansPart?.replace("ans=", "").trim();
      const res = await axios.get(`${simApi}/sim?type=delete&ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}&uid=${senderID}`);
      return message.reply(res.data.msg || "✅ Deleted.");
    }

    if (msg.startsWith("edit")) {
      const [oldPart, newPart] = msg.replace("edit", "").trim().split("&");
      const oldQ = oldPart?.replace("old=", "").trim();
      const newQ = newPart?.replace("new=", "").trim();
      const res = await axios.get(`${simApi}/sim?type=edit&old=${encodeURIComponent(oldQ)}&new=${encodeURIComponent(newQ)}&uid=${senderID}`);
      return message.reply(res.data.msg || "✅ Edited.");
    }

    if (msg.startsWith("teach")) {
      const [askPart, ansPart] = msg.replace("teach", "").trim().split("&");
      const ask = askPart?.replace("ask=", "").trim();
      const ans = ansPart?.replace("ans=", "").trim();
      const res = await axios.get(`${simApi}/sim?type=teach&ask=${encodeURIComponent(ask)}&ans=${encodeURIComponent(ans)}`);
      const data = res.data.data || {};
      return message.reply(res.data.msg.includes("already")
        ? `📝 Already Exists:\n1️⃣ ASK: ${data.ask}\n2️⃣ ANS: ${data.ans}`
        : `✅ Taught Successfully:\n1️⃣ ASK: ${data.ask}\n2️⃣ ANS: ${data.ans}`);
    }

    if (msg.startsWith("askinfo")) {
      const question = msg.replace("askinfo", "").trim();
      const res = await axios.get(`${simApi}/sim?type=keyinfo&ask=${encodeURIComponent(question)}`);
      const answers = res.data.data?.answers || [];
      if (!answers.length) return message.reply("❌ No answers found.");
      const list = answers.map((a, i) => `📌 ${i + 1}. ${a}`).join("\n");
      return message.reply(`📚 Answers for "${question}":\n\n${list}\n\n🧮 Total: ${answers.length}`);
    }

    if (msg.startsWith("info")) {
      const res = await axios.get(`${simApi}/sim?type=info`);
      const data = res.data.data;
      return message.reply(`📊 Total Ask: ${data.totalKeys}\n📍 Total Answer: ${data.totalResponses}`);
    }

    if (msg.startsWith("help")) {
      return message.reply(`
📘 Bot Usage:

${prefix}bot hi - Talk with bot
${prefix}bot teach ask=...&ans=... - Teach bot
${prefix}bot delete ask=...&ans=... - Delete QnA
${prefix}bot edit old=...&new=... - Edit QnA
${prefix}bot askinfo [question] - See answer list
${prefix}bot info - Bot data stats
${prefix}bot textType [style] - Change text font style
`.trim());
    }

    const res = await axios.get(`${simApi}/sim?type=ask&ask=${encodeURIComponent(msg)}`);
    const raw = res.data.data?.msg || "❌ No response.";
    const style = loadTextStyles()[threadID]?.style || "normal";
    const stylized = await axios.get(`${styleApi}/bold?text=${encodeURIComponent(raw)}&type=${style}`);
    return message.reply(stylized.data.data?.bolded || raw);

  } catch (err) {
    return message.reply("❌ Something went wrong. Try again later.");
  }
}

export default {
  config,
  onCall
};

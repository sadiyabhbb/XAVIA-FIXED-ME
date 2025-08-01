import axios from "axios";
import fs from "fs";
import path from "path";

const config = {
  name: "bot",
  aliases: ["mim"],
  version: "1.0.0",
  description: "Talk with the bot / Teach / Delete / Edit",
  usage: "<ask|teach|delete|edit|askinfo|info|textType|hi|help>",
  credits: "nayan",
  cooldown: 5,
  permissions: [0],
  prefix: 3,
  category: "talk",
};

function loadTextStyles() {
  const filePath = path.join(process.cwd(), "system", "textStyles.json");
  try {
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, JSON.stringify({}, null, 2));
    }
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    console.error("Error loading text styles:", error);
    return {};
  }
}

function saveTextStyle(threadID, style) {
  const filePath = path.join(process.cwd(), "system", "textStyles.json");
  const styles = loadTextStyles();
  styles[threadID] = { style };
  fs.writeFileSync(filePath, JSON.stringify(styles, null, 2));
}

export async function onCall({ message, args, event, usersData }) {
  const msg = args.join(" ");
  const senderID = event.senderID;
  const threadID = event.threadID;

  try {
    const apiData = await axios.get("https://raw.githubusercontent.com/MOHAMMAD-NAYAN-07/Nayan/main/api.json");
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
      const name = await usersData.getName(senderID);
      const rand = greetings[Math.floor(Math.random() * greetings.length)];
      return message.reply({ body: `${name}, ${rand}`, mentions: [{ tag: name, id: senderID }] });
    }

    if (msg.startsWith("textType")) {
      const style = msg.split(" ")[1];
      const validStyles = ['serif', 'sans', 'italic', 'italic-sans', 'medieval', 'normal'];
      if (!validStyles.includes(style)) {
        return message.reply(`Invalid style. Available: ${validStyles.join(", ")}`);
      }
      saveTextStyle(threadID, style);
      return message.reply(`Text style set to: ${style}`);
    }

    if (msg.startsWith("delete")) {
      const [askPart, ansPart] = msg.replace("delete", "").trim().split("&");
      const question = askPart?.replace("ask=", "").trim();
      const answer = ansPart?.replace("ans=", "").trim();
      const res = await axios.get(`${apiUrl}/sim?type=delete&ask=${encodeURIComponent(question)}&ans=${encodeURIComponent(answer)}&uid=${senderID}`);
      return message.reply(res.data.msg || res.data.data?.msg || "Done");
    }

    if (msg.startsWith("edit")) {
      const [oldPart, newPart] = msg.replace("edit", "").trim().split("&");
      const oldQ = oldPart?.replace("old=", "").trim();
      const newQ = newPart?.replace("new=", "").trim();
      const res = await axios.get(`${apiUrl}/sim?type=edit&old=${encodeURIComponent(oldQ)}&new=${encodeURIComponent(newQ)}&uid=${senderID}`);
      return message.reply(res.data.msg || res.data.data?.msg || "Edited.");
    }

    if (msg.startsWith("teach")) {
      const [askPart, ansPart] = msg.replace("teach", "").trim().split("&");
      const question = askPart?.replace("ask=", "").trim();
      const answer = ansPart?.replace("ans=", "").trim();
      const res = await axios.get(`${apiUrl}/sim?type=teach&ask=${encodeURIComponent(question)}&ans=${encodeURIComponent(answer)}`);
      const data = res.data.data || {};
      return message.reply(res.data.msg.includes("already")
        ? `📝Already Exists:\n1️⃣ASK: ${data.ask}\n2️⃣ANS: ${data.ans}`
        : `✅ Taught Successfully\n1️⃣ASK: ${data.ask}\n2️⃣ANS: ${data.ans}`);
    }

    if (msg.startsWith("askinfo")) {
      const question = msg.replace("askinfo", "").trim();
      const res = await axios.get(`${apiUrl}/sim?type=keyinfo&ask=${encodeURIComponent(question)}`);
      const answers = res.data.data?.answers || [];
      if (answers.length === 0) return message.reply("No answers found.");
      const list = answers.map((a, i) => `📌 ${i + 1}. ${a}`).join("\n");
      return message.reply(`Answers for "${question}":\n\n${list}\n\nTotal: ${answers.length}`);
    }

    if (msg.startsWith("info")) {
      const res = await axios.get(`${apiUrl}/sim?type=info`);
      const data = res.data.data;
      return message.reply(`Total Ask: ${data.totalKeys}\nTotal Answer: ${data.totalResponses}`);
    }

    if (msg.startsWith("help")) {
      const prefix = global.config.PREFIX;
      return message.reply(`
🌟 Available Commands:

1. ${prefix}bot hi - Talk with bot
2. ${prefix}bot teach ask=...&ans=... - Teach bot
3. ${prefix}bot delete ask=...&ans=... - Delete QnA
4. ${prefix}bot edit old=...&new=... - Edit QnA
5. ${prefix}bot askinfo [question] - See answers for a question
6. ${prefix}bot info - Total database stats
7. ${prefix}bot textType [style] - Change reply font
      `.trim());
    }

    // Default: Talk with bot
    const res = await axios.get(`${apiUrl}/sim?type=ask&ask=${encodeURIComponent(msg)}`);
    const text = res.data.data?.msg || "No response.";
    const textStyles = loadTextStyles();
    const style = textStyles[threadID]?.style || "normal";
    const styledRes = await axios.get(`${apiUrl2}/bold?text=${encodeURIComponent(text)}&type=${style}`);
    return message.reply(styledRes.data.data?.bolded || text);

  } catch (err) {
    console.error(err);
    return message.reply("❌ Something went wrong. Try again later.");
  }
}

export default {
  config,
  onCall
};

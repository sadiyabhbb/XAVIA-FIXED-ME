import fs from "fs/promises";
import { join } from "path";
import axios from "axios";

const dataPath = join(global.assetsPath, "bankData.json");
const statePath = join(global.assetsPath, "bankState.json");

const config = {
  name: "bank",
  description: "Banking system with menu selection",
  usage: "/bank",
  cooldown: 3,
  permissions: [0],
  credits: "Fixed By LIKHON AHMED"
};

async function readJSON(path) {
  try {
    const data = await fs.readFile(path, "utf8");
    return JSON.parse(data);
  } catch {
    return {};
  }
}

async function writeJSON(path, data) {
  await fs.writeFile(path, JSON.stringify(data, null, 2));
}

const menuText = `🏦 𝐂𝐀𝐒𝐈𝐍𝐎 𝐁𝐀𝐍𝐊 🏦\nSelect an option by replying with the number:\n
1️⃣ Register Account
2️⃣ Check Balance
3️⃣ Deposit Money
4️⃣ Withdraw Money
5️⃣ Rename Account`;

async function onCall({ message, args, Users }) {
  const { senderID, threadID, messageID, reply } = message;

  // Show menu
  try {
    const img = (await axios.get("https://i.imgur.com/a1Y3iHb.png", { responseType: "stream" })).data;
    return message.reply(
      {
        body: menuText,
        attachment: img
      },
      async (err, info) => {
        if (err) return message.reply(menuText);
        const state = await readJSON(statePath);
        state[senderID] = { step: "menu", messageID: info.messageID };
        await writeJSON(statePath, state);
      }
    );
  } catch {
    return message.reply(menuText);
  }
}

async function onReply({ message, event, Users }) {
  const { senderID, body, messageID, threadID } = message;
  const input = body.trim();
  const state = await readJSON(statePath);
  const userState = state[senderID] || {};

  const bankDB = await readJSON(dataPath);
  const userData = bankDB[senderID] || { money: 0, loan: 0, name: null };

  // Handle menu selection
  if (userState.step === "menu") {
    switch (input) {
      case "1":
        state[senderID] = { step: "register" };
        await writeJSON(statePath, state);
        return message.reply("🔐 Enter a name for your new bank account:");
      case "2":
        return message.reply(
          userData.name
            ? `🏦 Account Name: ${userData.name}\n💰 Balance: $${userData.money}\n💸 Loan: $${userData.loan}`
            : "❌ You don't have an account yet. Use option 1 to register."
        );
      case "3":
        state[senderID] = { step: "deposit" };
        await writeJSON(statePath, state);
        return message.reply("💵 Enter amount to deposit:");
      case "4":
        state[senderID] = { step: "withdraw" };
        await writeJSON(statePath, state);
        return message.reply("🏧 Enter amount to withdraw:");
      case "5":
        state[senderID] = { step: "rename" };
        await writeJSON(statePath, state);
        return message.reply("✏️ Enter new name for your account:");
      default:
        return message.reply("❓ Invalid option. Please reply with 1–5.");
    }
  }

  // Handle registration
  if (userState.step === "register") {
    if (userData.name) return message.reply("⚠️ You already have an account.");
    userData.name = input;
    userData.money = 0;
    userData.loan = 0;
    bankDB[senderID] = userData;
    await writeJSON(dataPath, bankDB);
    delete state[senderID];
    await writeJSON(statePath, state);
    return message.reply(`✅ Bank account "${input}" created!`);
  }

  // Handle deposit
  if (userState.step === "deposit") {
    const amount = parseInt(input);
    if (isNaN(amount) || amount <= 0) return message.reply("❌ Invalid amount.");
    const wallet = await Users.getMoney(senderID);
    if (wallet < amount) return message.reply("🚫 You don't have that much money.");
    await Users.decreaseMoney(senderID, amount);
    userData.money += amount;
    bankDB[senderID] = userData;
    await writeJSON(dataPath, bankDB);
    delete state[senderID];
    await writeJSON(statePath, state);
    return message.reply(`✅ Deposited $${amount} successfully.`);
  }

  // Handle withdraw
  if (userState.step === "withdraw") {
    const amount = parseInt(input);
    if (isNaN(amount) || amount <= 0) return message.reply("❌ Invalid amount.");
    if (userData.money < amount) return message.reply("🚫 You don't have that much in the bank.");
    userData.money -= amount;
    await Users.increaseMoney(senderID, amount);
    bankDB[senderID] = userData;
    await writeJSON(dataPath, bankDB);
    delete state[senderID];
    await writeJSON(statePath, state);
    return message.reply(`✅ Withdrawn $${amount} successfully.`);
  }

  // Handle rename
  if (userState.step === "rename") {
    userData.name = input;
    bankDB[senderID] = userData;
    await writeJSON(dataPath, bankDB);
    delete state[senderID];
    await writeJSON(statePath, state);
    return message.reply(`✅ Name changed to "${input}".`);
  }

  return message.reply("❓ Unexpected input. Please start again using /bank.");
}

export default {
  config,
  onCall,
  onReply
};

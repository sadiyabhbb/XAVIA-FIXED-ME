import axios from 'axios';
import { join } from 'path';
import fs from 'fs/promises';
import Decimal from 'decimal.js';

const PATH = join(global.assetsPath, 'bankOwner.json');

const config = {
  name: 'bank',
  aliases: ["bk", "b", "banking"],
  description: 'Bank Online',
  usage: '<Use command to show menu>',
  cooldown: 3,
  permissions: [0, 1, 2],
  credits: 'Dymyrius (Updated by LikHon)',
  extra: {}
};

const langData = {
  "en_US": {
    "no.account": "❌ You don't have a bank account yet!",
    "have.account": "❗ You already have an account!",
    "error": "⚠️ Error, please try again!",
    "no.name": "📛 Please enter a bank name.",
    "success": "✅ Successfully done!",
    "no.money": "🚫 You don't have enough money!",
    "menu": "🏦【𝐂𝐀𝐒𝐈𝐍𝐎 𝐁𝐀𝐍𝐊】🏦\nExperience modern banking.\n\n𝗢𝗽𝘁𝗶𝗼𝗻𝘀:\n1. register <bankName>\n2. withdraw <amount>\n3. deposit <amount>\n4. rename <newName>\n5. check\n6. loan <amount>\n7. top <number>"
  }
};

async function onCall({ message, args, getLang, Users }) {
  const senderID = message.senderID;
  const sub = args[0]?.toLowerCase();

  // 1. Show menu if no subcommand
  if (!sub) {
    try {
      const image = (await axios.get("https://i.imgur.com/a1Y3iHb.png", { responseType: "stream" })).data;
      return message.reply({ body: getLang("menu"), attachment: image });
    } catch {
      return message.reply(getLang("menu"));
    }
  }

  // 2. Load DB
  let bankData = {};
  try {
    const raw = await fs.readFile(PATH, 'utf8');
    bankData = JSON.parse(raw);
  } catch {}

  const saveData = () => fs.writeFile(PATH, JSON.stringify(bankData, null, 2));
  const userBank = bankData[senderID];

  // 3. Register
  if (sub === "register" || sub === "r") {
    if (userBank) return message.reply(getLang("have.account"));
    const name = args.slice(1).join(" ");
    if (!name) return message.reply(getLang("no.name"));
    bankData[senderID] = { name, money: 0, loan: 0 };
    await saveData();
    return message.reply(getLang("success"));
  }

  // 4. Check balance
  if (sub === "check") {
    if (!userBank) return message.reply(getLang("no.account"));
    return message.reply(
      `🏦 Account Info:\n👤 Name: ${userBank.name}\n💰 Bank Balance: $${userBank.money}\n💸 Loan: $${userBank.loan}`
    );
  }

  // 5. Deposit
  if (sub === "deposit") {
    if (!userBank) return message.reply(getLang("no.account"));
    const amount = parseInt(args[1]);
    if (isNaN(amount) || amount <= 0) return message.reply("⚠️ Invalid deposit amount.");
    const wallet = await Users.getMoney(senderID);
    if (wallet < amount) return message.reply(getLang("no.money"));
    await Users.decreaseMoney(senderID, amount);
    userBank.money += amount;
    await saveData();
    return message.reply(`✅ Deposited $${amount} to your bank.`);
  }

  // 6. Withdraw
  if (sub === "withdraw") {
    if (!userBank) return message.reply(getLang("no.account"));
    const amount = parseInt(args[1]);
    if (isNaN(amount) || amount <= 0) return message.reply("⚠️ Invalid withdrawal amount.");
    if (userBank.money < amount) return message.reply(getLang("no.money"));
    userBank.money -= amount;
    await Users.increaseMoney(senderID, amount);
    await saveData();
    return message.reply(`✅ Withdrew $${amount} from your bank.`);
  }

  // 7. Rename
  if (sub === "rename") {
    if (!userBank) return message.reply(getLang("no.account"));
    const newName = args.slice(1).join(" ");
    if (!newName) return message.reply(getLang("no.name"));
    userBank.name = newName;
    await saveData();
    return message.reply("✅ Name updated successfully!");
  }

  // 8. Top list
  if (sub === "top") {
    const limit = parseInt(args[1]) || 5;
    const topUsers = Object.entries(bankData)
      .sort(([, a], [, b]) => b.money - a.money)
      .slice(0, limit)
      .map(([uid, data], i) => `${i + 1}. ${data.name} — $${data.money}`);
    return message.reply(`🏆 Top ${limit} Richest Accounts:\n\n${topUsers.join("\n")}`);
  }

  return message.reply("❓ Invalid command. Use `/bank` to see available options.");
}

export default {
  config,
  langData,
  onCall
};

import fs from "fs";
import path from "path";
import axios from "axios";
const dataPath = path.join(process.cwd(), "data", "bank.json");

const config = {
  name: "bank",
  aliases: ["b"],
  description: "ব্যাংক সিস্টেম মেনু সহ",
  usage: "",
  cooldown: 3,
  permissions: [0, 1, 2],
  credits: "LIKHON"
};

const langData = {
  "en_US": {
    "menu": `🏦 BANK SYSTEM MENU 🏦
━━━━━━━━━━━━━━━
1. Register Bank Account
2. Withdraw Money
3. Deposit Money
4. Rename Account
5. Check Balance
6. Transfer Money
7. Request Loan
8. Approve/Decline Loans
9. View Leaderboard
10. Exit`,
    "invalidOption": "❌ Please select a valid option (1-10).",
    "exit": "👋 Exited from Bank menu."
  },
  "bn_BD": {
    "menu": `🏦 ব্যাংক সিস্টেম মেনু 🏦
━━━━━━━━━━━━━━━
1. একাউন্ট খুলুন
2. টাকা উত্তোলন
3. টাকা জমা
4. একাউন্টের নাম পরিবর্তন
5. ব্যালেন্স দেখুন
6. টাকা পাঠান
7. লোনের আবেদন
8. লোন অনুমোদন/প্রত্যাখ্যান
9. টপ ব্যালেন্স
10. প্রস্থান করুন`,
    "invalidOption": "❌ অনুগ্রহ করে সঠিক অপশন (১-১০) দিন।",
    "exit": "👋 ব্যাংক মেনু থেকে বেরিয়ে গেছেন।"
  }
};

// Helper Functions
function loadBankData() {
  if (!fs.existsSync(dataPath)) return {};
  return JSON.parse(fs.readFileSync(dataPath));
}
function saveBankData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}
function ensureUser(bank, id) {
  if (!bank[id]) {
    bank[id] = {
      name: `User_${id}`,
      balance: 0,
      loan: 0,
      pendingLoan: 0
    };
  }
}

async function onCall({ message, args, getLang }) {
  const { senderID } = message;
  const bank = loadBankData();
  ensureUser(bank, senderID);
  const lang = getLang();

  if (!args[0]) {
    const res = await axios.get("https://i.ibb.co/8YbF6fW/bank.png", { responseType: "arraybuffer" });
    const image = Buffer.from(res.data, "utf-8");

    message.reply({
      body: lang("menu"),
      attachment: image
    }, (err, info) => {
      global.handleReply.push({
        name: config.name,
        messageID: info.messageID,
        author: senderID,
        type: "menu"
      });
    });
    return;
  }

  const command = args[0].toLowerCase();
  const user = bank[senderID];

  switch (command) {
    case "register":
      if (args[1]) {
        user.name = args.slice(1).join(" ");
        saveBankData(bank);
        message.reply(`✅ একাউন্ট তৈরি হয়েছে: ${user.name}`);
      } else {
        message.reply("➤ আপনার একাউন্টের নাম লিখুন:");
        global.handleReply.push({
          name: config.name,
          messageID: message.messageID,
          author: senderID,
          type: "register"
        });
      }
      break;

    case "withdraw":
      const amount = parseInt(args[1]);
      if (isNaN(amount) || amount <= 0) return message.reply("❌ সঠিক টাকার পরিমাণ দিন।");
      if (amount > user.balance) return message.reply("❌ আপনার কাছে পর্যাপ্ত টাকা নেই।");
      user.balance -= amount;
      saveBankData(bank);
      message.reply(`✅ ${amount} টাকা উত্তোলন সফল হয়েছে।`);
      break;

    case "deposit":
      const deposit = parseInt(args[1]);
      if (isNaN(deposit) || deposit <= 0) return message.reply("❌ সঠিক টাকার পরিমাণ দিন।");
      user.balance += deposit;
      saveBankData(bank);
      message.reply(`✅ ${deposit} টাকা জমা সফল হয়েছে।`);
      break;

    case "rename":
      const newName = args.slice(1).join(" ");
      if (!newName) return message.reply("❌ নতুন নাম দিন।");
      user.name = newName;
      saveBankData(bank);
      message.reply(`✅ একাউন্টের নাম পরিবর্তিত: ${newName}`);
      break;

    case "balance":
      message.reply(`💰 আপনার ব্যালেন্স: ${user.balance} টাকা\n📉 লোন: ${user.loan}`);
      break;

    case "transfer":
      const target = message.mentions[0]?.id;
      const amt = parseInt(args[2]);
      if (!target || isNaN(amt) || amt <= 0) return message.reply("❌ ব্যবহারকারী ট্যাগ করুন এবং পরিমাণ দিন।");
      if (amt > user.balance) return message.reply("❌ পর্যাপ্ত ব্যালেন্স নেই।");
      ensureUser(bank, target);
      user.balance -= amt;
      bank[target].balance += amt;
      saveBankData(bank);
      message.reply(`✅ ${amt} টাকা পাঠানো হয়েছে ${bank[target].name} কে।`);
      break;

    case "loan":
      const loanAmt = parseInt(args[1]);
      if (isNaN(loanAmt) || loanAmt <= 0) return message.reply("❌ লোনের পরিমাণ দিন।");
      user.pendingLoan = loanAmt;
      saveBankData(bank);
      message.reply(`📌 লোনের আবেদন করা হয়েছে: ${loanAmt} টাকা`);
      break;

    case "approve":
    case "decline":
      if (message.permissions < 1) return message.reply("❌ আপনি অনুমতি পাচ্ছেন না।");
      const uid = Object.keys(bank).find(id => bank[id].pendingLoan > 0);
      if (!uid) return message.reply("📭 কোনো pending লোন নেই।");
      if (command === "approve") {
        bank[uid].balance += bank[uid].pendingLoan;
        bank[uid].loan += bank[uid].pendingLoan;
        message.reply(`✅ ${bank[uid].name} এর লোন অনুমোদন হয়েছে।`);
      } else {
        message.reply(`❌ ${bank[uid].name} এর লোন বাতিল হয়েছে।`);
      }
      bank[uid].pendingLoan = 0;
      saveBankData(bank);
      break;

    case "top":
      const top = Object.entries(bank)
        .sort(([, a], [, b]) => b.balance - a.balance)
        .slice(0, 5)
        .map(([id, u], i) => `${i + 1}. ${u.name}: ${u.balance} টাকা`)
        .join("\n");
      message.reply(`🏆 টপ ব্যালেন্স:\n${top}`);
      break;

    case "exit":
      message.reply(lang("exit"));
      break;

    default:
      message.reply(lang("invalidOption"));
  }
}

// Reply Handler
async function handleReply({ event, message, getLang, handleReply }) {
  const { senderID, body } = event;
  const lang = getLang();
  const text = body.trim();

  if (handleReply.author !== senderID) return;

  switch (handleReply.type) {
    case "menu":
      message.args = [text];
      onCall({ message, args: message.args, getLang });
      break;

    case "register":
      message.args = ['register', text];
      onCall({ message, args: message.args, getLang });
      break;

    default:
      message.reply("❌ ভুল রিপ্লাই।");
  }
}

export default {
  config,
  langData,
  onCall,
  handleReply
};

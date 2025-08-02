import axios from 'axios';
import { join } from 'path';
import fs from 'fs/promises';
import Decimal from 'decimal.js';

const PATH = join(global.assetsPath, 'bankOwner.json');

const config = {
  name: 'bank',
  aliases: ['bk', 'b', 'banking'],
  description: 'Bank Online',
  usage: '<Use command to show menu>',
  cooldown: 3,
  permissions: [0, 1, 2],
  credits: 'Dymyrius (Referenced from Waifucat and Ariel Violet)',
  extra: {}
};

const langData = {
  en_US: {
    "no.account": "【 ℹ 】➜ You don't have an account yet!",
    "have.account": "【 ℹ 】➜ You already have an account!",
    "error": "【 ⚠ 】➜ Error, please try again!",
    "no.name": "【 ⚠ 】➜ Please add your bank name.",
    "success": "【 ℹ 】➜ Successful!",
    "fail": "【 ⚠ 】➜ Failed!",
    "loan.requested": "【 ℹ 】➜ Loan request of {loanAmount} has been submitted for approval.",
    "loan.approved": "【 ℹ 】➜ Loan request for {bankName} has been approved.",
    "loan.denied": "【 ℹ 】➜ Loan request for {bankName} has been denied.",
    "loan.list": "━━【Request Lists】━━\n\n{userList}",
    "no.money": "【 ℹ 】➜ You don't have enough money!",
    "menu": `  【🏦❰𝐂𝐀𝐒𝐈𝐍𝐎 𝐁𝐀𝐍𝐊❱🏦】
— Experience modern banking with a touch of sophistication. How may I assist you today in managing your account?

𝗬𝗼𝘂𝗿 𝗢𝗽𝘁𝗶𝗼𝗻𝘀:
1. [register/r <bankName>] - Register a bank account. 🧑‍💼
2. [withdraw/w <amount>] - Withdraw money. 💸
3. [deposit/d <amount>] - Deposit money. 💵
4. [rename <newName>] - Rename account. 🪪
5. [check] - Info account.💳
6. [loan <amount>] - Request a loan for a free balance 💰
7. [top <amount>] - View richest accounts 💎
━━━━━━━━━━━━━
𝗠𝗼𝗱𝗲𝗿𝗮𝘁𝗼𝗿𝘀 𝗢𝗽𝘁𝗶𝗼𝗻𝘀:
8. [grant <bankName/sender ID/index>] - Grant a loan request. 💼
9. [list] - List pending loan requests. 📜
10. [decline <bankName/index>] - Decline loan request. 🗑
━━━━━━━━━━━━━
Please select the service you require, and I'll be delighted to assist you further. 👨‍💼`
  }
};

async function onCall(context) {
  const { message, args, getLang, userPermissions } = context;
  const targetID = message.senderID;
  const { Users } = global.controllers;
  const MAX_LOAN_AMOUNT = 5000000;

  // ✅ Debug log to ensure command is triggered
  console.log("[BANK] /bank command triggered with args:", args);

  try {
    const image = (
      await axios.get('https://i.imgur.com/a1Y3iHb.png', { responseType: 'stream' })
    ).data;

    if (!getLang || typeof getLang !== 'function') {
      console.warn("[BANK] getLang not found. Defaulting to en_US");
    }

    const safeGetLang = (key, vars = {}) => {
      const raw = langData.en_US[key] || 'Missing lang key';
      return raw.replace(/\{(.*?)\}/g, (_, k) => vars[k] || '');
    };

    const L = getLang || safeGetLang;

    let bankData = {};
    try {
      const data = await fs.readFile(PATH, 'utf-8');
      bankData = JSON.parse(data);
    } catch {
      bankData = {};
    }

    if (args.length === 0) {
      return message.reply({
        body: L("menu"),
        attachment: image
      });
    }

    // 💡 The rest of the logic here (unchanged)
    // You already provided full logic including:
    // - register
    // - withdraw
    // - deposit
    // - rename
    // - check
    // - loan
    // - top
    // - grant
    // - list
    // - decline
    // ⬇ Keep your entire main logic here from your previous full file
    // (Omitted here just to save space)

  } catch (err) {
    console.error("[BANK ERROR]", err);
    return message.reply("【 ⚠ 】➜ An unexpected error occurred.");
  }
}

export default {
  config,
  langData,
  onCall
};

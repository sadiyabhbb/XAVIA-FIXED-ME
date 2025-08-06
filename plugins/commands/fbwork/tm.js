import axios from "axios";

const config = {
  name: "tm",
  description: "Check temporary email for verification code",
  usage: "<email@example.com>",
  cooldown: 3,
  permissions: [2],
  credits: "hotmail999.com API + Modified by You"
};

export async function onCall({ message, args }) {
  const email = args[0];

  if (!email || !email.includes("@")) {
    return message.reply("⚠️ Please provide a valid email address.\nExample:\n/tm user@hotmail999.com");
  }

  try {
    const response = await axios.get(`https://hotmail999.com/api/get_mail.php?email=${email}`);
    const inbox = response.data;

    if (!inbox || inbox.length === 0) {
      return message.reply("📭 No emails found in the inbox. Please try again later.");
    }

    const latest = inbox[0];

    const from = latest.from;
    const subject = latest.subject;
    const date = latest.date;

    // Extract code from subject (any 4 to 8 digit number)
    const match = subject.match(/(\d{4,8})/);
    const code = match ? match[1] : null;

    return message.reply(
      `📥 *New Mail*\n` +
      `👤 From: \`${from}\`\n` +
      `📝 Subject: *"${subject}"*\n` +
      `📅 Time: ${date}\n` +
      (code ? `🔐 Code: *${code}*\n\n✅ Use this code to confirm your Facebook account.` : "❌ No verification code found in the subject.")
    );
  } catch (e) {
    return message.reply("❌ Failed to retrieve email. Please check the email address or try again later.");
  }
}

export default {
  config,
  onCall
};

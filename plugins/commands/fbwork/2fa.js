import speakeasy from 'speakeasy';

const config = {
  name: "2fa",
  description: "Generate accurate 2FA code for Facebook using secret.",
  usage: "/2fa <secret>",
  cooldown: 3,
  permissions: [0],
  credits: "ChatGPT"
};

export async function onCall({ message, args }) {
  if (args.length < 1) {
    return message.reply("❌ ব্যবহারঃ /2fa <secret>");
  }

  // 1. Join args (remove spaces), normalize to base32 format
  const secret = args.join('').replace(/[^A-Z2-7]/gi, '').toUpperCase();

  // 2. Get current time in seconds, rounded to nearest 30-second window
  const currentTime = Math.floor(Date.now() / 1000);

  try {
    // 3. Generate token (with step=30s, encoding base32, 6-digit)
    const token = speakeasy.totp({
      secret: secret,
      encoding: 'base32',
      digits: 6,
      step: 30,
      time: currentTime
    });

    return message.reply(`✅ আপনার Facebook 2FA কোড: ${token}`);
  } catch (e) {
    return message.reply("❌ সিক্রেটটি সঠিক নয় বা কোড জেনারেট করতে সমস্যা হয়েছে:\n" + e.message);
  }
}

export default {
  config,
  onCall
};

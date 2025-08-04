import speakeasy from 'speakeasy';

const config = {
  name: "2fa",
  description: "Generate 2FA TOTP code for Facebook or any TOTP-based service.",
  usage: "/2fa <secret>",
  cooldown: 3,
  permissions: [0],
  credits: "ChatGPT"
};

export async function onCall({ message, args }) {
  if (args.length < 1) {
    return message.reply("❌ ব্যবহারঃ /2fa <secret>");
  }

  const secret = args[0].replace(/\s+/g, '').toUpperCase(); // Remove spaces & normalize

  try {
    const token = speakeasy.totp({
      secret: secret,
      encoding: 'base32',
      digits: 6,
      step: 30 // 30-second window
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

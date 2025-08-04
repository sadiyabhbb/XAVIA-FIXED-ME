import speakeasy from 'speakeasy';

const config = {
  name: "2fa",
  description: "Generate 2FA TOTP code from secret.",
  usage: "/2fa <secret>",
  cooldown: 3,
  permissions: [0],
  credits: "Isai Ivanov (modified by ChatGPT)"
};

export async function onCall({ message, args }) {
  if (args.length < 1) {
    return message.reply("❌ ব্যবহারঃ /2fa <secret>");
  }

  const secret = args[0];

  try {
    const token = speakeasy.totp({
      secret,
      encoding: 'base32'
    });

    message.reply(`✅ আপনার 2FA কোড: ${token}`);
  } catch (e) {
    message.reply("❌ সিক্রেটটি সঠিক নয় বা কোড জেনারেট করতে সমস্যা হয়েছে।");
  }
}

export default {
  config,
  onCall
};

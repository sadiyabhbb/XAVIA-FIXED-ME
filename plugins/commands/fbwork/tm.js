import axios from 'axios';

const config = {
    name: "tm",
    description: "Check temporary mail via hotmail999.com API",
    usage: "<email@example.com>",
    cooldown: 5,
    permissions: [2], // group admin
    credits: "hotmail999.com | Converted by Xavia"
};

export async function onCall({ message, args, userPermissions }) {
    const isGroupAdmin = userPermissions.includes(2);
    if (!isGroupAdmin) return message.reply("❌ আপনার পর্যাপ্ত অনুমতি নেই এই কমান্ডটি ব্যবহার করার জন্য।");

    const email = args[0];
    if (!email || !email.includes('@')) {
        return message.reply("⚠️ সঠিক ইমেইল অ্যাড্রেস দিন।\nউদাহরণ: /tm user@example.com");
    }

    try {
        const res = await axios.get(`https://hotmail999.com/api/get_mail.php`, {
            params: { email }
        });

        const data = res.data;

        if (!data.status || !data.data || data.data.length === 0) {
            return message.reply("📭 কোনো মেইল পাওয়া যায়নি বা ইনবক্স খালি।");
        }

        const latestMail = data.data[0];
        const { subject, from_field, date, code } = latestMail;

        return message.reply(
            "📥 সর্বশেষ মেইল:\n" +
            `👤 প্রেরক: ${from_field}\n` +
            `📝 বিষয়: ${subject}\n` +
            `📅 সময়: ${date}\n` +
            (code ? `🔐 কোড: ${code}` : "❌ কোড পাওয়া যায়নি")
        );

    } catch (error) {
        console.error(error);
        return message.reply("❌ মেইল চেক করতে গিয়ে কোনো সমস্যা হয়েছে। আবার চেষ্টা করুন।");
    }
}

export default {
    config,
    onCall
};

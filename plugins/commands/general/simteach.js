import axios from 'axios';

const config = {
  name: "simteach",
  version: "1.0.0"
}

async function onCall({ message, args }) {
  if (args.length === 0) {
    return message.reply("✧ Tutor Guide ✧\n\n» simteach [question] => [answer]\n» Example: simteach hi => hello\n» Teaches the bot new responses");
  }

  const input = args.join(" ").split("=>").map(item => item.trim());
  
  if (input.length < 2) return message.reply("Invalid format. Use: simteach question => answer");

  const [question, answer] = input;

  try {
    const { data } = await axios.get(`https://simsimi-api-pro.onrender.com/teach?ask=${encodeURIComponent(question)}&ans=${encodeURIComponent(answer)}`);

    if (data.teachResponse?.respond === "This answer already exists for the given question!") {
      return message.reply("⚠️ This answer already exists!");
    }

    return message.reply("✅ Successfully taught: \"" + question + "\" => \"" + answer + "\"");
  } catch (error) {
    console.error(error);
    return message.reply("❌ Failed to teach the bot. Please try again later.");
  }
}

export default {
  config,
  onCall
}

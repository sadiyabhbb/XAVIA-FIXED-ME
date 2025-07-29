import axios from "axios";

const config = {
  name: "lyrics",
  aliases: ["ly"],
  description: "Get song lyrics",
  usage: "song name",
  cooldown: 3,
  permissions: [0],
  credits: "rapido"
};

async function onCall({ message, args }) {
  const song = args.join(" ");
  if (!song) return message.reply("Please enter a song name");

  try {
    const { data } = await axios.get(`https://rapido.zetsu.xyz/api/ly?q=${encodeURIComponent(song)}`);
    message.reply(`${data.lyrics || "Lyrics not found"}`);
  } catch (error) {
    message.reply(error.message);
  }
}

export default { config, onCall };

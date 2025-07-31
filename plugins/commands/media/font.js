import axios from "axios";

const config = {
  name: "font",
  description: "Generate styled text using different font styles.",
  usage: "font [style] [text]",
  cooldown: 3,
  permissions: [0],
  credits: "ArYAN"
};

const available_styles = [
  "bold", "italic", "monospace", "double", "wide", "circled", "inverted",
  "square", "squareFilled", "parenthesized", "script", "boldScript",
  "fraktur", "boldFraktur", "sans", "sansBold", "sansItalic",
  "sansBoldItalic", "underline", "strikethrough", "subscript",
  "superscript", "smallCaps", "oldEnglish", "blackletter", "sparkle",
  "wavy", "dots", "cross"
];

async function onCall({ message, args }) {
  try {
    const firstArg = args[0];

    // Show style list
    if (!firstArg || firstArg.toLowerCase() === "list") {
      const styledList = available_styles
        .map(style => `🔹 ${style}`)
        .join("\n");

      return message.reply(
        `🎨 Available Font Styles:\n\n${styledList}\n\n📝 Use: \`font [style] [text]\`\n💡 Example: \`font bold hello world\``
      );
    }

    const style = firstArg;
    const text = args.slice(1).join(" ");

    if (!available_styles.includes(style)) {
      return message.reply(
        `❌ Invalid style!\nType \`font list\` to see all available styles.`
      );
    }

    if (!text) {
      return message.reply("❗ Please enter the text to convert.");
    }

    const response = await axios.get(
      `https://aryan-nix-apis.vercel.app/api/font?style=${style}&text=${encodeURIComponent(text)}`
    );

    if (!response.data || !response.data.result) {
      return message.reply("⚠️ Failed to generate styled text.");
    }

    await message.reply(response.data.result);

  } catch (error) {
    console.error(error);
    message.reply("❗ An error occurred while generating the text.");
  }
}

export default {
  config,
  onCall
};

import a from "axios";

const config = {
  name: "search",
  aliases: ["duckduckgo", "ddg"],
  permissions: [0],
  cooldown: 5,
  description: "Search using DuckDuckGo",
  credits: "jm"
};

function onCall({ message: m, args: ar }) {
  const query = ar.join(" ");
  if (!query) return m.reply("Please provide a search query.");
  
  const lowerQuery = query.toLowerCase();
  if (lowerQuery.includes("porn") || lowerQuery.includes("sex") || lowerQuery.includes("xxx") || lowerQuery.includes("nsfw") || lowerQuery.includes("pornhub") || lowerQuery.includes("xnxx") || lowerQuery.includes("pinayot") || lowerQuery.includes("rule34") || lowerQuery.includes("hentai") || lowerQuery.includes("hanime") || lowerQuery.includes("kantutan") || lowerQuery.includes("kantotan") || lowerQuery.includes("iyot") || lowerQuery.includes("xvideos")) {
    return m.reply("NSFW queries are not allowed.");
  }

  m.react("⏳");
  a.get(`https://rapido.zetsu.xyz/api/duckduckgo?query=${encodeURIComponent(query)}`)
    .then((res) => {
      if (!res.data.status || !res.data.results || res.data.results.length === 0) {
        throw new Error("No results found.");
      }
      
      const results = res.data.results;
      let reply = `Search results for "${query}":\n\n`;
      
      results.forEach((item, index) => {
        reply += `${index + 1}. ${item.title}\n${item.description}\nLink: ${item.link}\n\n`;
      });
      
      m.react("✅");
      m.reply(reply);
    })
    .catch((e) => {
      m.react("❌");
      m.reply(`Error: ${e.message}`);
    });
}

export default { config, onCall };

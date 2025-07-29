import axios from 'axios';

const langData = {
    "en_US": {
        "prefix": `${global.config.NAME} 𝚙𝚛𝚎𝚏𝚒𝚡 𝚒𝚜: {prefix}`
    }
};

const reactions = ["airkiss","angrystare","bite","bleh","blush","brofist","celebrate","cheers","clap","confused","cool","cry","cuddle","dance","drool","evillaugh","facepalm","handhold","happy","headbang","hug","huh","kiss","laugh","lick","love","mad","nervous","no","nom","nosebleed","nuzzle","nyah","pat","peek","pinch","poke","pout","punch","roll","run","sad","scared","shout","shrug","shy","sigh","sip","slap","sleep","slowclap","smack","smile","smug","sneeze","sorry","stare","stop","surprised","sweat","thumbsup","tickle","tired","wave","wink","woah","yawn","yay","yes"];

async function onCall({ message, getLang, data }) {
    const messageBody = message.body.toLowerCase().trim();
    const prefixTriggers = [
        "prefix",
        "prefix?",
        "Prefix"

        ];

    if (prefixTriggers.includes(messageBody) && message.senderID !== global.botID) {
        const prefix = data?.thread?.data?.prefix || global.config.PREFIX;
        const randomReaction = reactions[Math.floor(Math.random() * reactions.length)];

        try {
            const { data: gifData } = await axios.get(`https://api.otakugifs.xyz/gif?reaction=${randomReaction}`);
            const response = await axios.get(gifData.url, { responseType: 'stream' });
            await message.reply({
                body: getLang("prefix", { prefix }),
                attachment: response.data
            });
        } catch (error) {
            console.error(error);
            await message.reply(getLang("prefix", { prefix }));
        }
    }
}

export default {
    langData,
    onCall
};

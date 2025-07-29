import axios from 'axios';

const config = {
  name: "sim",
  credits:"renzmansueto"
}
const reply = async function({eventData, message}) {
  if(message.senderID !== eventData.author) return message.reply("[!] This session is already occupied by user: " + eventData.author);
  
  const q = message.body;
  try {
    
     const {data: result} = await axios.get(`https://simsimi-api-pro.onrender.com/sim?query=${q}`)
    await message.react("");
    return message.reply(result.respond).then(msg => msg.addReplyEvent({callback: reply, author: message.senderID}))
    
  } catch (e) {
     console.error(e)
    return message.reply("An error occured while fetching the response.")
  }
}
const onCall = async function({args,message}) {
  const {api} = global;
  const q = args.join(" ");
  if(!q) return message.reply("Ano?");
  try {
    
     const {data: result} = await axios.get(`https://simsimi-api-pro.onrender.com/sim?query=${q}`)
    return message.reply(result.respond).then(msg => msg.addReplyEvent({callback: reply, author: message.senderID}))
    
  } catch (e) {
     console.error(e)
    return message.reply("An error occured while fetching the response.")
  }
  
}


export default {
  config,
  onCall
}

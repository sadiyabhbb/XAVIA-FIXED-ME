import axios from 'axios';
import fs from 'fs-extra';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const pogi = './plugins/commands/cache';

const config = {
    name: '4k',
    version: '1.0.0',
    permissions: 0,
    credits: 'ArYAN',
    description: 'Enhance photo',
    commandCategory: 'image',
    usages: 'Reply to image',
    cooldown: 5
};

const langData = {
    "en_US": {
        "notAReply": "Please reply to the image to enhance it.",
        "notAPhoto": "This is not a photo.",
        "processingError": "An error occurred while processing the image.",
        "executionError": "An error occurred while executing the command.",
        "successMessage": "The image has been successfully enhanced ✅"
    },
    "vi_VN": {
        "notAReply": "Vui lòng trả lời hình ảnh để nâng cao chất lượng.",
        "notAPhoto": "Đây không phải là một bức ảnh.",
        "processingError": "Đã xảy ra lỗi khi xử lý hình ảnh.",
        "executionError": "Đã xảy ra lỗi khi thực thi lệnh.",
        "successMessage": "Chất lượng hình ảnh đã được nâng cao thành công ✅"
    }
};

async function onCall({ message, getLang }) {
    const reply = message.messageReply;
    if (!reply || !reply.attachments || reply.attachments.length === 0)
        return message.reply(getLang("notAReply"));

    if (reply.attachments[0].type !== "photo")
        return message.reply(getLang("notAPhoto"));

    try {
        const imageUrl = reply.attachments[0].url;
        const apiUrl = `https://aryan-xyz-upscale-api-phi.vercel.app/api/upscale-image?imageUrl=${encodeURIComponent(imageUrl)}&apikey=ArYANAHMEDRUDRO`;

        const apiResponse = await axios.get(apiUrl);
        if (!apiResponse.data || !apiResponse.data.image)
            return message.reply(getLang("processingError"));

        const resultUrl = apiResponse.data.image;
        const imageResponse = await axios.get(resultUrl, { responseType: 'arraybuffer' });

        await fs.ensureDir(pogi);
        const filePath = path.join(pogi, 'remini-enhanced.png');
        await fs.outputFile(filePath, Buffer.from(imageResponse.data));

        await message.reply({
            body: getLang("successMessage"),
            attachment: fs.createReadStream(filePath)
        });
    } catch (error) {
        console.error(error);
        return message.reply(getLang("executionError"));
    }
}

export default {
    config,
    langData,
    onCall
};

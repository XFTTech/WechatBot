import { log, Message } from "wechaty";
import * as PUPPET from "wechaty-puppet";
import { getDailyCodingChallenge, getUsers, getLeetcodeUser } from "./utils";
import { commandMap } from "./command";

export const LOGPRE = "[PadLocalDemo]"

let wechat_ids = new Set();

export async function getMessagePayload(message: Message) {
    switch (message.type()) {
        case PUPPET.types.Message.Text:
            log.silly(LOGPRE, `get message text: ${message.text()}`);
            break;

        case PUPPET.types.Message.Attachment:
        case PUPPET.types.Message.Audio: {
            const attachFile = await message.toFileBox();

            const dataBuffer = await attachFile.toBuffer();

            log.info(LOGPRE, `get message audio or attach: ${dataBuffer.length}`);

            break;
        }

        case PUPPET.types.Message.Video: {
            const videoFile = await message.toFileBox();

            const videoData = await videoFile.toBuffer();

            log.info(LOGPRE, `get message video: ${videoData.length}`);

            break;
        }

        case PUPPET.types.Message.Emoticon: {
            const emotionFile = await message.toFileBox();

            const emotionJSON = emotionFile.toJSON();
            log.info(LOGPRE, `get message emotion json: ${JSON.stringify(emotionJSON)}`);

            const emotionBuffer: Buffer = await emotionFile.toBuffer();

            log.info(LOGPRE, `get message emotion: ${emotionBuffer.length}`);

            break;
        }

        case PUPPET.types.Message.Image: {
            const messageImage = await message.toImage();
            log.info(LOGPRE, `get message image: ${JSON.stringify(messageImage)}`);
            const thumbImage = await messageImage.thumbnail();
            const thumbImageData = await thumbImage.toBuffer();

            log.info(LOGPRE, `get message image, thumb: ${thumbImageData.length}`);

            const hdImage = await messageImage.hd();
            const hdImageData = await hdImage.toBuffer();

            log.info(LOGPRE, `get message image, hd: ${hdImageData.length}`);

            const artworkImage = await messageImage.artwork();
            const artworkImageData = await artworkImage.toBuffer();

            log.info(LOGPRE, `get message image, artwork: ${artworkImageData.length}`);

            break;
        }

        case PUPPET.types.Message.Url: {
            const urlLink = await message.toUrlLink();
            log.info(LOGPRE, `get message url: ${JSON.stringify(urlLink)}`);

            const urlThumbImage = await message.toFileBox();
            const urlThumbImageData = await urlThumbImage.toBuffer();

            log.info(LOGPRE, `get message url thumb: ${urlThumbImageData.length}`);

            break;
        }

        case PUPPET.types.Message.MiniProgram: {
            const miniProgram = await message.toMiniProgram();

            log.info(LOGPRE, `MiniProgramPayload: ${JSON.stringify(miniProgram)}`);

            break;
        }
    }
}

export async function BotResponse(message: Message) {
    // const messageTo = message.to();
    const messageRoom = message.room();
    if (!messageRoom) {
        log.info(LOGPRE, "not in room, ignore");
        return;
    }
    const messageText = message.text();
    if (messageText.indexOf("@Bot") !== 0) {
        log.info(LOGPRE, "not for bot, ignore");
        return;
    }

    await getUsers().then((user) => {
        user.data.forEach((item: string) => {
            getLeetcodeUser(item).then((res) => {
                let dataMap = new Map(Object.entries(res.data));
                wechat_ids.add(dataMap.get("wxid"));
            });
        });
    });

    console.log(wechat_ids);


    let topic = await messageRoom.topic();
    const messageFrom = message.talker();
    // console.log(messageFrom);
    let isUser = true ? wechat_ids.has(messageFrom.weixin) : false;
    let isSaying = false;
    let commandList = messageText.split("@Bot")[1].split(";");
    for (let item of commandList) {
        let words = item.trim().split(" ");
        if (words.length < 2) continue;
        let command = words[0].toLowerCase() + " " + words[1].toLowerCase();
        if (commandMap.has(command)) {
            isSaying = true;
            if (!isUser && command === "openai prompt") {
                console.log(messageFrom);
                console.log(messageFrom.payload?.handle);
                message.say("你不是用户，不能使用这个命令");
                continue;
            }
            let remain = item.split(words[0] + " " + words[1]);
            await commandMap.get(command)?.(message, remain.length > 0 ? remain[1].trim() : "");
        }
    };
    if (!isSaying) {
        await getDailyCodingChallenge().then((res) => {
            let link = JSON.stringify(res.data).split("link")[1].split('"')[2];
            message.say("Bot不知道你在说什么，但是今天的每日一题是: https://leetcode.com" + link + " 快去做！！(求求你");
        });
    }
}


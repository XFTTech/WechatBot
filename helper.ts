import {log, Message} from "wechaty";
import * as PUPPET from "wechaty-puppet";
import { getDailyStats } from "./utils";

export const LOGPRE = "[PadLocalDemo]"

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
  // if (message.to()?.self() && message.text().indexOf("ding") !== -1) {
  //   await message.talker().say(message.text().replace("ding", "dong"));
  // }
  if (message.self()) return;
  // const messageTo = message.to();
  const messageRoom = message.room();
  if (!messageRoom) return;
  const messageText = message.text();
  if (messageText.indexOf("@Bot") !== 0) return;
  const messageFrom = message.talker();
  let isCheckDaily = false, isCheckWeekly = false, isCheckUser = false;
  let topic = await messageRoom.topic();
  let commandList = messageText.split("@Bot")[1].split(";");
  let date : String = "", week : String = "", user : String = "";
  commandList.forEach((command) => {
    if (command.indexOf("check daily ") !== 0){
      let temp = command.split("check daily ");
      if (temp.length <= 1) return;
      isCheckDaily = true;
      date = temp[1].substring(0, 10);
      log.info("在检测daily了捏");
    }
    if (command.indexOf("check weeekly ") !== 0){
      let temp = command.split("check weeekly ");
      if (temp.length <= 1) return;
      isCheckWeekly = true;
      week = temp[1].substring(0, 7);
      log.info("在检测weekly了捏");
    }
    if (command.indexOf("check user ") !== 0){
      let temp = command.split("check user ");
      if (temp.length <= 1) return;
      isCheckUser = true;
      user = temp[1];
      log.info("在检测user了捏");
    }
    
  });
  if(isCheckDaily) await sendDateStat(message, date);
  if(isCheckWeekly) await sendDateStat(message, date);
  if(isCheckUser) await sendDateStat(message, date);
}

export async function sendDateStat(message: Message, date: String){
  await getDailyStats(date).then((res) => {
    let dataMap = new Map(Object.entries(res.data));
    let userMap = new Map();
    let noOne = true;
    dataMap.forEach((value, key) => {
      let userDataMap = new Map(Object.entries(value ? value : {}));
      let temp = userDataMap.get("total");
      userMap.set(key, temp);
      if (temp > 0) noOne = false;
      log.info(key + "做了"+ temp + "道题捏");
    });
    if (noOne) return;
    userMap = new Map([...userMap.entries()].sort((a, b) => b[1] - a[1]));
    let cnt = 0;
    let msg = date + "目前做题最多的前三人是：";
    userMap.forEach((value, key) => {
      if (cnt < 3){
        msg += "\n" + key + "：" + value;
        cnt++;
      }
    });
    msg += "\n 快来做题wwww! (๑•̀ㅂ•́)و✧\n (排名仅供参考, 相同时按加入顺序排捏~)"
    message.say(msg);
  }).catch((err) => {
    message.say("获取数据失败捏，请检查你的输入是否正确！！！然后重试捏~");
  });
};
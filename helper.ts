import {log, Message} from "wechaty";
import * as PUPPET from "wechaty-puppet";
import { getDailyStats, getWeeklyStats, getAllStats, getDailyCodingChallenge } from "./utils";

export const LOGPRE = "[PadLocalDemo]"

export async function getMessagePayload(message: Message) {
  switch (message.type()) {
    case PUPPET.types.Message.Text:
      log.silly(LOGPRE, `get message text: ${message.text()}`);
      break;

    case PUPPET.types.Message.Attachment:
    case PUPPET.types.Message.Audio: {
      // const attachFile = await message.toFileBox();

      // const dataBuffer = await attachFile.toBuffer();

      // log.info(LOGPRE, `get message audio or attach: ${dataBuffer.length}`);

      break;
    }

    case PUPPET.types.Message.Video: {
      // const videoFile = await message.toFileBox();

      // const videoData = await videoFile.toBuffer();

      // log.info(LOGPRE, `get message video: ${videoData.length}`);

      break;
    }

    case PUPPET.types.Message.Emoticon: {
      // const emotionFile = await message.toFileBox();

      // const emotionJSON = emotionFile.toJSON();
      // log.info(LOGPRE, `get message emotion json: ${JSON.stringify(emotionJSON)}`);

      // const emotionBuffer: Buffer = await emotionFile.toBuffer();

      // log.info(LOGPRE, `get message emotion: ${emotionBuffer.length}`);

      break;
    }

    case PUPPET.types.Message.Image: {
      // const messageImage = await message.toImage();
      // log.info(LOGPRE, `get message image: ${JSON.stringify(messageImage)}`);
      // const thumbImage = await messageImage.thumbnail();
      // const thumbImageData = await thumbImage.toBuffer();

      // log.info(LOGPRE, `get message image, thumb: ${thumbImageData.length}`);

      // const hdImage = await messageImage.hd();
      // const hdImageData = await hdImage.toBuffer();

      // log.info(LOGPRE, `get message image, hd: ${hdImageData.length}`);

      // const artworkImage = await messageImage.artwork();
      // const artworkImageData = await artworkImage.toBuffer();

      // log.info(LOGPRE, `get message image, artwork: ${artworkImageData.length}`);

      break;
    }

    case PUPPET.types.Message.Url: {
      // const urlLink = await message.toUrlLink();
      // log.info(LOGPRE, `get message url: ${JSON.stringify(urlLink)}`);

      // const urlThumbImage = await message.toFileBox();
      // const urlThumbImageData = await urlThumbImage.toBuffer();

      // log.info(LOGPRE, `get message url thumb: ${urlThumbImageData.length}`);

      break;
    }

    case PUPPET.types.Message.MiniProgram: {
      // const miniProgram = await message.toMiniProgram();

      // log.info(LOGPRE, `MiniProgramPayload: ${JSON.stringify(miniProgram)}`);

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
  if (!messageText.includes("@Bot")) {
    log.info(LOGPRE, "not for bot, ignore");
    return;
  }

  let topic = await messageRoom.topic();
  const messageFrom = message.talker();

  let isCheckDaily = false, isCheckWeekly = false, isCheckUser = false;
  let date : String = "", week : String = "", user : String = "";
  let commandList = messageText.split("@Bot")[1].split(";");
  commandList.forEach((command) => {

    if (command.includes("check daily ")){
      let temp = command.split("check daily ");
      if (temp.length <= 1) return;
      isCheckDaily = true;
      date = temp[1].substring(0, 10);
      log.info("在检测daily了捏");
    }

    if (command.includes("check weekly ")){
      let temp = command.split("check weekly ");
      temp.map((item) => log.info("item: " + item));
      if (temp.length <= 1) return;
      isCheckWeekly = true;
      week = temp[1].substring(0, 7);
      log.info("在检测weekly了捏");
    }

    if (command.includes("check user ")){
      let temp = command.split("check user ");
      if (temp.length <= 1) return;
      isCheckUser = true;
      user = temp[1];
      log.info("在检测user了捏");
    }
    
  });
  
  if(isCheckDaily) await sendDateStat(message, date);
  if(isCheckWeekly) await sendWeekStat(message, week);
  if(isCheckUser) await sendUserStat(message, user);
  if(!isCheckDaily && !isCheckWeekly && !isCheckUser)
    await getDailyCodingChallenge().then((res) => {
      let link = JSON.stringify(res.data).split("link")[1].split('"')[2];
      message.say("Bot不知道你在说什么，但是今天的每日一题是: https://leetcode.com" + link + " 快去做！！(求求你");
    });
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
    let msg = "在" + date + "目前所统计到做题最多的前三人是：";
    userMap.forEach((value, key) => {
      if (cnt < 3){
        msg += "\n" + key + "：" + value;
        cnt++;
      }
    });
    msg += "\n快来做题wwww! (๑•̀ㅂ•́)و✧\n(排名仅供参考, 相同时按加入顺序排捏~)"
    log.info(msg);
    message.say(msg);
  }).catch((err) => {
    console.log(err);
    message.say("获取数据失败捏，请检查你想check的date是否exists！！！然后重试捏~");
  });
};

export async function sendWeekStat(message: Message, week: String){
  await getWeeklyStats(week).then((res) => {
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
    let msg = "week:" + week + "目前统计到做题最多的前三人是：";
    userMap.forEach((value, key) => {
      if (cnt < 3){
        msg += "\n" + key + "：" + value;
        cnt++;
      }
    });
    msg += "\n快来做题wwww! (๑•̀ㅂ•́)و✧\n(排名仅供参考, 相同时按加入顺序排捏~)"
    log.info(msg);
    message.say(msg);
  }).catch((err) => {
    console.log(err);
    message.say("获取数据失败捏，你确定你想query的week存在吗！！！不要耍我啊kora！~");
  });
};

export async function sendUserStat(message: Message, user: String){
  await getAllStats().then((res) => {
    let dataMap = new Map(Object.entries(res.data));
    if (dataMap.size === 0) {
      message.say("数据空空，是不是读错了orz~");
      return;
    }
    if (dataMap.get(user.toString()) === undefined){
        message.say("欸~？没有找到这个用户的数据诶！是不是输错了呢？");
        return;
    }
    let noOne = true;
    dataMap.forEach((value, key) => {
      if (key !== user) return;
      noOne = false;
      let userDataMap = new Map(Object.entries(value ? value : {}));
      let msg = user + "的做题情况是：";
      let total = userDataMap.get("total");
      msg += "\n总共做了" + total + "道题捏";
      let easy_cnt = userDataMap.get("easy_cnt");
      msg += "\n其中简单题做了" + easy_cnt + "道";
      let medium_cnt = userDataMap.get("medium_cnt");
      msg += "\n中等题做了" + medium_cnt + "道";
      let hard_cnt = userDataMap.get("hard_cnt");
      msg += "\n困难题做了" + hard_cnt + "道";
      msg += "\n再接再厉呀！！！";
      if (total > 0) message.say(msg);
      else message.say("这个人还没有做题捏~");
    });
  }).catch((err) => {
    console.log(err);
    message.say("获取数据失败捏，请检查你的输入是否正确！！！然后重试捏~");
  });
};
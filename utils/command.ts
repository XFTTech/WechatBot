import { log, Message } from "wechaty";
import { getDailyStats, getWeeklyStats, getAllStats, getDailyCodingChallenge } from "./utils";
import { getCompletion } from "./openai";

export const commandMap = new Map(Object.entries(
    {
        "check daily": sendDateStat,
        "check weekly": sendWeekStat,
        "check user": sendUserStat,
        "daily question": sendTodayQuestion,
        "openai prompt": sendOpenAIPrompt,
    }
));

export async function sendDateStat(message: Message, date: string) {
    await getDailyStats(date).then((res) => {
        let dataMap = new Map(Object.entries(res.data));
        let userMap = new Map();
        let noOne = true;
        dataMap.forEach((value, key) => {
            let userDataMap = new Map(Object.entries(value ? value : {}));
            let temp = userDataMap.get("total");
            userMap.set(key, temp);
            if (temp > 0) noOne = false;
            log.info(key + "做了" + temp + "道题捏");
        });
        if (noOne) return;
        userMap = new Map([...userMap.entries()].sort((a, b) => b[1] - a[1]));
        let cnt = 0;
        let msg = "在" + date + "目前所统计到做题最多的前三人是：";
        userMap.forEach((value, key) => {
            if (cnt < 3) {
                msg += "\n" + key + "：" + value;
                cnt++;
            }
        });
        msg += "\n快来做题wwww! (๑•̀ㅂ•́)و✧\n(排名仅供参考, 相同时按加入顺序排捏~)"
        log.info(msg);
        message.say(msg);
    }).catch((err) => {
        console.log(message);
        message.say("获取数据失败捏，请检查你想check的date是否exists！！！然后重试捏~");
    });
};

export async function sendWeekStat(message: Message, week: string) {
    await getWeeklyStats(week).then((res) => {
        let dataMap = new Map(Object.entries(res.data));
        let userMap = new Map();
        let noOne = true;
        dataMap.forEach((value, key) => {
            let userDataMap = new Map(Object.entries(value ? value : {}));
            let temp = userDataMap.get("total");
            userMap.set(key, temp);
            if (temp > 0) noOne = false;
            log.info(key + "做了" + temp + "道题捏");
        });
        if (noOne) return;
        userMap = new Map([...userMap.entries()].sort((a, b) => b[1] - a[1]));
        let cnt = 0;
        let msg = "week:" + week + "目前统计到做题最多的前三人是：";
        userMap.forEach((value, key) => {
            if (cnt < 3) {
                msg += "\n" + key + "：" + value;
                cnt++;
            }
        });
        msg += "\n快来做题wwww! (๑•̀ㅂ•́)و✧\n(排名仅供参考, 相同时按加入顺序排捏~)"
        log.info(msg);
        message.say(msg);
    }).catch((err) => {
        console.log(message);
        message.say("获取数据失败捏，你确定你想query的week存在吗！！！不要耍我啊kora！~");
    });
};

export async function sendUserStat(message: Message, user: string) {
    await getAllStats().then((res) => {
        let dataMap = new Map(Object.entries(res.data));
        if (dataMap.size === 0) {
            message.say("数据空空，是不是读错了orz~");
            return;
        }
        if (dataMap.get(user.toString()) === undefined) {
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
            else message.say("这个人加入到现在还没有做题捏~");
        });
    }).catch((err) => {
        console.log(message);
        message.say("获取数据失败捏，请检查你的输入是否正确！！！然后重试捏~");
    });
};

export async function sendTodayQuestion(message: Message, temp: string) {
    await getDailyCodingChallenge().then((res) => {
        let link = JSON.stringify(res.data).split("link")[1].split('"')[2];
        message.say("要做题了吗！！好耶！今天的每日一题是: https://leetcode.com" + link + " 快来做！！");
    });
};

export async function sendOpenAIPrompt(message: Message, prompt: string) {
    await getCompletion(prompt).then((res) => {
        let promptToken = prompt.split(" ").length;
        if (promptToken > 10) {
            message.say("openai的api好贵！！！所以只能给你40 Characters 的prompt(空格inclusive)~");
            return;
        }
        let msg = res.data.choices[0].text?.trim();
        msg = msg? msg : "error happened";
        message.say(msg);
    }).catch((err) => {
        console.log(err);
        message.say("好像出错了欸~不知道是openai的问题还是我的问题捏~总之先喊人来修吧！");
    });
}
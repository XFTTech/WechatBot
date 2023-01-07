import axios from 'axios';

export const webClient = axios.create({
    baseURL: 'https://xfttech.github.io/UTLeetcoder/data',
    timeout: 10000
});

export const getDateToday = async () => {
    let torontoDate = new Date().toLocaleString('en-US', { timeZone: "America/Toronto"});
    let today = new Date(torontoDate);
    let year = today.getFullYear();
    let month = (today.getMonth()+1).toString();
    month = (today.getMonth()+1) >= 10? month : "0" + month;
    let day = (today.getDay()+1).toString();
    day = (today.getDay()+1) >= 10 ? day : "0" + day;
    return year + "-" + month + "-" + day;
  }

export const getDailyStats = async (date: String) => {
    return await webClient.get("/daily_stats/" + date + ".json")
};

export const getWeeklyStats = async (week: String) => {
    return await webClient.get("/weekly_stats/week-" + week + ".json");
};

export const getAllStats = async () => {
    return await webClient.get("/alltime.json");
};
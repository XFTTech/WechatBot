# Wechat bot

This project is based on [Wechaty](https://github.com/wechaty/wechaty) and [Puppeteer](https://github.com/padlocal). Since new wechat account after 2017 can not use wechat web api, so we need to use puppeteer to simulate the login process (but it costs money). And it be written for our [UTLeetcoder Project](https://github.com/XFTTech/UTLeetcoder)

## Instructions

If you want to run this bot locally, you need to do the following steps:
1. clone this repo and then run `npm install` to install all dependencies.
2. run `npm run demo` to start the bot.

All bot commands are written in `helper.ts`. You can add your own commands in this file. And `main.ts` is the main file of this project which create a bot instance and then start the bot.


## Project Usage

This bot can be called by `@bot` in wechat at index 0.

1. get date statistics from UTLeetcoder provide json by provide message with head `@bot` and `check daily xxxx-xx-xx` where `xxxx-xx-xx` is the date format you want to check. The bot will return the statistics of that day (but only top 3, cz may lots of data).
2. get weekly statistics from UTLeetcoder provide json by provide message with head `@bot` and `check weeekly xxxx-xx` where `xxxx` stand for the year and `xx` stand for the week number. The bot will return the statistics of that week.
3. get specific user statistics from UTLeetcoder provide json by provide message with head `@bot` and `check user xxxx` where `xxxx` is the user name (notice, we dont exactly know your query name so that we query all string followed `user ` plz type correct name). The bot will return the statistics of that user.
4. use davinci text model by provide message with head `@bot` and `openai prompt xxxx` where `xxxx` is the sentence you wanna ask or complete.
5. if you want request multiple statistics, you can provide message contain `@bot` and above commands split by `;`. The bot will return the statistics of all commands.

## Contributing

If you want to contribute to this project, you can fork this repo and then create a pull request. We will review your code and merge it if it is good.

## Issues

If you have any questions, you can create an issue in this repo.

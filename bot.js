const fs = require("fs");
const config = require("./config/settings");

const Discord = require("discord.js");
const client = new Discord.Client();

const Puppeteer = require("puppeteer");

client.on("ready", () => {
  console.log("Boot completed successfully!");
});

client.on("message", async (message) => {
  if (message.content.startsWith("!ping")) {
    message.channel.send("pong");
  }

  if (
    message.content.startsWith("!lol") ||
    message.content.startsWith("!spell") ||
    message.content.startsWith("!skill") ||
    message.content.startsWith("!build") ||
    message.content.startsWith("!rune") ||
    message.content.startsWith("!role")
  ) {
    const [cmd, name, lane] = message.content.split(/ |　/);
    const info = cmd.substr(1);
    const championName = pullCollectChampionName(name);
    const position = foramtPositionName(lane);

    if (!championName) {
      message.channel.send({
        embed: {
          color: 0xff0000,
          author: {
            name: "LoL Build Support",
            url: "https://github.com/dashimaki929/discord-bot/tree/develop",
            iconURL: "attachment://icon.png",
          },
          title: "The specified champion was not found.",
          description: `\<@${message.author.id}\>\nChampion name \`${
            name ? name : "none"
          }\` is not found.`,
        },
        files: [
          {
            attachment: "./config/icon_lol.png",
            name: "icon.png",
          },
        ],
      });

      return;
    }

    const displayName =
      name === championName ? championName : `${name}(${championName})`;

    if (info === "role") {
      message.channel.send({
        embed: {
          color: 0x5cb85c,
          author: {
            name: "LoL Build Support",
            url: "https://github.com/dashimaki929/discord-bot/tree/develop",
            iconURL: "attachment://icon.png",
          },
          title: `${championName.toUpperCase()}'s Positions`,
          thumbnail: {
            url: `attachment://${championName}.png`,
          },
          description: `\<@${message.author.id}\> \`${displayName}\` \`${info}\``,
        },
        files: [
          {
            attachment: "./config/icon_lol.png",
            name: "icon.png",
          },
          {
            attachment: `./images/lol/champions/${championName}.png`,
            name: `${championName}.png`,
          },
        ],
      });
      return;
    }

    let imageName;
    try {
      message.channel.startTyping();
      imageName = await getBuildImage({ info, championName, position });
    } catch (err) {
      message.channel.send({
        embed: {
          color: 0xff0000,
          author: {
            name: "LoL Build Support",
            url: "https://github.com/dashimaki929/discord-bot/tree/develop",
            iconURL: "attachment://icon.png",
          },
          title:
            "This champion cannot be analyzed due to the small sample size.",
          thumbnail: {
            url: `attachment://${championName}.png`,
          },
          description: `\<@${message.author.id}\>\n\n\`${championName}\` :\n　This champion cannot be analyzed due to the small sample size.\n　(当チャンピオンはサンプルが少ないため分析できません。)\n\n以下サイトに情報が存在するかも...`,
          fields: [
            {
              name: ":regional_indicator_l: League of Graphs",
              value: `https://www.leagueofgraphs.com/ja/champions/builds/${championName}`,
              inline: true,
            },
            {
              name: ":flag_jp: LoLBuild.jp",
              value: `https://lolbuild.jp/build?q=${championName}&order=vote_desc${
                lane ? `&lane=${foramtPositionName(lane, "LoLBuild.jp")}` : ""
              }`,
              inline: true,
            },
          ],
        },
        files: [
          {
            attachment: "./config/icon_lol.png",
            name: "icon.png",
          },
          {
            attachment: `./images/lol/champions/${championName}.png`,
            name: `${championName}.png`,
          },
        ],
      });
      return;
    } finally {
      message.channel.stopTyping();
    }

    message.channel.send({
      embed: {
        color: 0x5cb85c,
        author: {
          name: "LoL Build Support",
          url: "https://github.com/dashimaki929/discord-bot/tree/develop",
          iconURL: "attachment://icon.png",
        },
        title: `【OP.GG】${championName.toUpperCase()} - Real-time LoL Stats.`,
        url: `http://na.op.gg/champion/${championName}${
          position ? `/statistics/${position}` : ""
        }`,
        thumbnail: {
          url: `attachment://${championName}.png`,
        },
        description: `\<@${message.author.id}\>\n\`${displayName}\` ${
          position ? `\`${position}\` ` : ""
        }\`${info}\``,
        image: {
          url: `attachment://${imageName}`,
          width: 500,
        },
        fields: [
          {
            name: ":book: OP.GG (More info)",
            value: `http://na.op.gg/champion/${championName}${
              position ? `/statistics/${position}` : ""
            }`,
          },
          {
            name: ":regional_indicator_l: League of Graphs",
            value: `https://www.leagueofgraphs.com/ja/champions/builds/${championName}`,
          },
          {
            name: ":flag_jp: LoLBuild.jp",
            value: `https://lolbuild.jp/build?q=${championName}&order=vote_desc${
              lane ? `&lane=${foramtPositionName(lane, "LoLBuild.jp")}` : ""
            }`,
          },
        ],
        timestamp: new Date(),
      },
      files: [
        {
          attachment: "./config/icon_lol.png",
          name: "icon.png",
        },
        {
          attachment: `./images/lol/champions/${championName}.png`,
          name: `${championName}.png`,
        },
        {
          attachment: `./images/lol/stats/${imageName}`,
          name: imageName,
        },
      ],
    });
  }

  if (message.content.startsWith("!debug")) {
    console.log(message);
    message.channel.send(
      "```\n" + JSON.stringify(message, null, "\t") + "\n```"
    );
  }
});

client.login(config.settings.Bot.token);

/**
 * 指定された情報の要素をキャプチャします。
 *
 * @param {*} info
 * @param {*} championName :formatted
 * @param {*} position :formatted
 */
async function getBuildImage({ info, championName, position }) {
  const BASE_URL = "http://na.op.gg/champion/";

  const elementSelectorMap = {
    lol:
      "body > div.l-wrap.l-wrap--champion > div.l-container > div > div.tabWrap._recognized > div.l-champion-statistics-content.tabItems > div.tabItem.Content.championLayout-overview > div",
    spell:
      "body > div.l-wrap.l-wrap--champion > div.l-container > div > div.tabWrap._recognized > div.l-champion-statistics-content.tabItems > div.tabItem.Content.championLayout-overview > div > div.l-champion-statistics-content__main > table.champion-overview__table.champion-overview__table--summonerspell",
    skill:
      "body > div.l-wrap.l-wrap--champion > div.l-container > div > div.tabWrap._recognized > div.l-champion-statistics-content.tabItems > div.tabItem.Content.championLayout-overview > div > div.l-champion-statistics-content__main > table.champion-overview__table.champion-overview__table--summonerspell",
    build:
      "body > div.l-wrap.l-wrap--champion > div.l-container > div > div.tabWrap._recognized > div.l-champion-statistics-content.tabItems > div.tabItem.Content.championLayout-overview > div > div.l-champion-statistics-content__main > table:nth-child(2)",
    rune:
      "body > div.l-wrap.l-wrap--champion > div.l-container > div > div.tabWrap._recognized > div.l-champion-statistics-content.tabItems > div.tabItem.Content.championLayout-overview > div > div.l-champion-statistics-content__main > div > table",
  };

  const browser = await Puppeteer.launch({
    executablePath: "/usr/bin/chromium-browser",
    defaultViewport: {
      width: 1920,
      height: 1080,
    },
    timeout: 10000,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });
  const page = await browser.newPage();

  if (!position) {
    await page.goto(`${BASE_URL}${championName}`);
  } else {
    await page.goto(`${BASE_URL}${championName}/statistics/${position}`);
  }

  const element = await page.$(elementSelectorMap[info]);
  let imageName = championName;
  if (position) {
    imageName += `_${position}`;
  }
  if (info) {
    imageName += `_${info}`;
  }
  imageName += ".png";

  await element.screenshot({ path: `./images/lol/stats/${imageName}` });
  browser.close();

  return imageName;
}

/**
 * 受け取ったチャンピオン名が日本語の場合、英名へ変換します。
 *
 * @param {*} name
 */
function pullCollectChampionName(name) {
  const champions = JSON.parse(fs.readFileSync("./config/lol-champions.json"));

  const championName = champions[name] || name;
  if (!Object.values(champions).includes(championName)) {
    return null;
  }
  return championName;
}

/**
 * 受け取ったレーン名を適切なポジション名へ変換します。
 * @param {*} lane
 */
function foramtPositionName(lane, type) {
  if (["top", "tp", "t", "トップ"].includes(lane)) {
    return "top";
  } else if (["middle", "mid", "md", "m", "ミドル", "ミッド"].includes(lane)) {
    if (type === "LoLBuild.jp") {
      return "middle";
    } else {
      return "mid";
    }
  } else if (
    ["adc", "bottom", "bot", "bt", "b", "ボトム", "ボット"].includes(lane)
  ) {
    if (type === "LoLBuild.jp") {
      return "bottom";
    } else {
      return "bot";
    }
  } else if (["support", "sup", "sp", "s", "サポート", "サポ"].includes(lane)) {
    return "support";
  } else if (
    [
      "jungle",
      "jungler",
      "jg",
      "j",
      "ジャングル",
      "ジャングラ",
      "ジャングラー",
    ].includes(lane)
  ) {
    return "jungle";
  } else {
    return null;
  }
}

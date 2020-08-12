const config = require("./config/settings");

const Discord = require("discord.js");
const client = new Discord.Client();

const Puppeteer = require("puppeteer");

client.on("ready", () => {
  console.log("Boot completed successfully!");
});

client.on("message", async message => {
  if (message.content.startsWith("!ping")) {
    message.channel.send("pong");
  }

  if (message.content.includes("http")) {
    const interests = [
      "twitter",
      "youtube",
      "youtu.be",
      "steam",
      "gyazo",
      "streamable",
      "amazon",
      "nicovideo",
      "instagram",
      "dashimaki"
    ];

    if (
      message.author.id === config.settings.Bot.id ||
      message.channel.id === config.settings.Output.textChannel.id ||
      message.channel.id === config.settings.Input.textChannel.id
    ) {
      return;
    }

    const matchedTags = interests.filter(item =>
      message.content.includes(item)
    );

    client.channels
      .fetch(config.settings.Output.textChannel.id)
      .then(channel => {
        channel.send(
          // テキストメッセージを引用
          `${message.content
            .split("\n")
            .map(line => `> ${line}`)
            .join("\n")}\n\n` +
            // タグ表示
            `${matchedTags.map(item => `\`#${item}\``).join(" ")}\n` +
            // 投稿者へメンション
            `Added by: \<@${message.author.id}\>`
        );
      })
      .catch(console.error);
  }

  if (
    message.content.startsWith("!skill") ||
    message.content.startsWith("!build") ||
    message.content.startsWith("!role") ||
    message.content.startsWith("!spell") ||
    message.content.startsWith("!rune")
  ) {
    const args = message.content.split(" ");
    const cmd = args[0].substr(1);
    const name = args[1]

    message.channel.startTyping();
    const fileName = await getBuildImage(cmd, name);
    message.channel.stopTyping();

    if (!fileName) {
      message.channel.send(`\<@${message.author.id}\>\n\`${name}\` \`${cmd}\` is not found.`);
    }

    message.channel.send(`\<@${message.author.id}\>\n\`${name}\` \`${cmd}\``, {
      files: [
        {
          attachment: `./images/lol/${fileName}`,
          name: fileName
        }
      ]
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

async function getBuildImage(cmd, name) {
  const BASE_URL = "https://www.leagueofgraphs.com/ja/champions/builds/";
  const elementSelectorMap = {
    skill: "#mainContent > div > div:nth-child(1) > a:nth-child(3) > div",
    build: "#mainContent > div > div:nth-child(1) > a:nth-child(4) > div",
    role:
      "#mainContent > div > div:nth-child(2) > div.row > div:nth-child(1) > div",
    spell:
      "#mainContent > div > div:nth-child(2) > div.row > div:nth-child(2) > a > div",
    rune: "#mainContent > div > div:nth-child(2) > a > div"
  };

  championName = config.settings.Champions[name] || name;
  if (!Object.values(config.settings.Champions).includes(championName)) {
    return null;
  }

  const browser = await Puppeteer.launch({
    executablePath: '/usr/bin/chromium-browser',
    defaultViewport: {
      width: 1920,
      height: 1080
    },
    timeout: 10000
  });
  const page = await browser.newPage();

  await page.goto(`${BASE_URL}${championName}`);
  await page.waitFor(elementSelectorMap[cmd]);

  const element = await page.$(elementSelectorMap[cmd]);
  await element.screenshot({
    path: `./images/lol/${championName}_${cmd}.png`
  });

  browser.close();

  return `${championName}_${cmd}.png`;
}

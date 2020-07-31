const config = require("./config/settings");

const Discord = require("discord.js");
const client = new Discord.Client();

client.on("ready", () => {
  console.log("Boot completed successfully!");
});

client.on("message", message => {
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

  if (message.content.startsWith("!debug")) {
    console.log(message);
    message.channel.send(
      "```\n" + JSON.stringify(message, null, "\t") + "\n```"
    );
  }
});

client.login(config.settings.Bot.token);

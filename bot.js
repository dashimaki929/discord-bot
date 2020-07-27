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
    if (message.author.id === config.settings.Bot.id) {
      return;
    }

    const author = message.author.username;
    client.channels
      .fetch(config.settings.Output.textChannel.id)
      .then(channel => {
        channel.send(
          `${message.content
            .split("\n")
            .map(line => {
              return "> " + line;
            })
            .join("\n")}\n\nBy: \`${author}\``
        );
      })
      .catch(console.error);
  }
});

client.login(config.settings.Bot.token);

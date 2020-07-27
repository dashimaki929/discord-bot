const config = require("./config/settings");

const Discord = require("discord.js");
const client = new Discord.Client();

client.on("ready", () => {
  console.log("ログインしました。");
});

client.on("message", message => {
  if (message.content.startsWith("!ping")) {
    message.channel.send("pong");
  }
});

client.login(config.settings.botToken);

const config = require("./config/settings");

const Discord = require("discord.js");
const client = new Discord.Client();

client.on("ready", () => {
  console.log("ログインしました。");
});

client.on("message", msg => {
  if (msg.content.startsWith("!ping")) {
    msg.channel.send("pong");
  }
});

client.login(config.settings.botToken);

const Discord = require("discord.js");
const Unirest = require("unirest");
const config = require("./config/settings");

const client = new Discord.Client();
client.on("ready", () => {
  console.log("ログインしました。");
});

client.on("message", message => {
  /* example */
  if (message.content.startsWith("!ping")) {
    message.channel.send("pong");
  }

  /* weather-app */
  if (message.content.startsWith("!weather")) {
    var req = Unirest(
      "GET",
      "https://community-open-weather-map.p.rapidapi.com/weather"
    );

    req.query({
      callback: "test",
      id: "2172797",
      units: "metric",
      mode: "html",
      q: "London,uk"
    });

    req.headers({
      "x-rapidapi-host": "community-open-weather-map.p.rapidapi.com",
      "x-rapidapi-key": "90425a17e6msh7b40496a6abe1a2p19f251jsn0244d05b3b97",
      useQueryString: true
    });

    req.end(res => {
      if (res.error) {
        throw new Error(res.error);
      }

      message.channel.send(res.status);
      message.channel.send(res.body);
    });
  }
});

client.login(config.settings.botToken);

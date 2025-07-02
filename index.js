// Conecta as dependencias necessárias
const Discord = require("discord.js");
require("dotenv/config");
// Inicia o Client do Discord
const client = new Discord.Client({
  intents: [
    Discord.GatewayIntentBits.Guilds,
    Discord.GatewayIntentBits.GuildMessages,
    Discord.GatewayIntentBits.MessageContent,
    Discord.GatewayIntentBits.GuildMembers,
    Discord.GatewayIntentBits.GuildPresences,
    Discord.GatewayIntentBits.DirectMessages,
  ],
});
client.login(process.env.botToken);
module.exports = client;
// Inicia os sistemas do Bot e carrega os slashCommands
require("./handler/BotConfigs/startBot.js")(client);
client.slashCommands = new Discord.Collection();

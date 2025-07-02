const Discord = require("discord.js");
const config = require("../../config.json");

require("dotenv/config");
const { ActivityType } = require("discord.js");

module.exports = async (client) => {
    require("../ServerConfigs/FiveMStatus.js")(client);
    require("../BotConfigs/antiCrash.js")(client);
    client.on("interactionCreate", async (interaction) => {
      if (interaction.type === Discord.InteractionType.ApplicationCommand) {
        const cmd = client.slashCommands.get(interaction.commandName);

        if (!cmd)
          return interaction
            .reply(`Ocorreu um erro! Contate **LoganC#0001**!`)
            .catch((o_O) => {});

        interaction["member"] = interaction.guild.members.cache.get(
          interaction.user.id
        );

        cmd.run(client, interaction);
      }
    });

  client.on("ready", async () => {
    console.log("Bot Online!")
    let status = "Monitorando o FiveM";

    if (status) {
      client.user.setPresence({
        activities: [
          {
            name: status,
            type: ActivityType.Playing,
          },
        ],
        status: "online",
      });
    }
  });

  client.on("reconnecting", async () => {
    console.log("[ALERTA] Bot desconectado! Tentando reconectar.");
  });
};

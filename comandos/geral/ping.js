const Discord = require("discord.js");

const config = require("../../config.json");

require("dotenv/config");

module.exports = {
  name: "ping", // Coloque o nome do comando
  description: "Veja o ping do bot.", // Coloque a descrição do comando
  type: Discord.ApplicationCommandType.ChatInput,

  run: async (client, interaction) => {
    let ping = client.ws.ping;

    let embed_1 = new Discord.EmbedBuilder()
      .setAuthor({
        name: client.user.username,
        iconURL: client.user.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(
        `Olá ${interaction.user}, meu ping está em \`calculando...\`.`
      )
      .setColor(config.embeds.cor);

    let embed_2 = new Discord.EmbedBuilder()
      .setAuthor({
        name: client.user.username,
        iconURL: client.user.displayAvatarURL({ dynamic: true }),
      })
      .setDescription(
        `Olá ${interaction.user}, meu ping está em \`${ping}ms\`.`
      )
      .setColor(config.embeds.cor);

    interaction.reply({ embeds: [embed_1] }).then(() => {
      setTimeout(() => {
        interaction.editReply({ embeds: [embed_2] });
      }, 2000);
    });
  },
};

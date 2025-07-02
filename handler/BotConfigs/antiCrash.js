const { EmbedBuilder, WebhookClient, CDN } = require("discord.js");

const config = require("../../config.json");

require("dotenv/config");

const webhookClient = new WebhookClient({
  id: config.webhooks.erros.id,
  token: config.webhooks.erros.token,
});

module.exports = async (client) => {
  process.on("unhandRejection", (reason, promise) => {
    logErros("unhandRejection", reason, promise);
  });

  process.on("unhandledRejection", (reason, promise) => {
    logErros("unhandledRejection", reason, promise);
  });
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  process.on("uncaughtException", (error, origin) => {
    logErros("uncaughtException", error, origin);
  });
  ///////////////////////////////////////////////////////////////////////////////////////////////////
  process.on("uncaughtExceptionMonitor", (error, origin) => {
    logErros("uncaughtExceptionMonitor", error, origin);
  });

  async function logErros(type, erro, origin) {
    //ANTICRASH SYSTEM
    console.error(`🚫 Erro Detectado (${type}):\n\n` + erro, origin);

    let tipoErro = type;
    let codErro = erro;
    let origErro = origin;

    const embed = new EmbedBuilder()
      .setColor(config.embeds.cor)
      .setAuthor({
        name: client.user.username + " erro!",
        iconURL: client.user.avatarURL(),
      })
      .setThumbnail(
        "https://cdn.discordapp.com/emojis/1209901441322450964.webp?size=96&quality=lossless"
      )
      .setDescription(
        `Acabou de ocorrer um erro! Estou enviando as informações`
      )
      .addFields({
        name: `⚠️ **${tipoErro}**: `,
        value: `\n**__ERROR__:** \`\`\`prolog\n${codErro}\`\`\`\n**__ORIGIN__:** \`\`\`\n${origErro}\`\`\``,
      })
      .setFooter({
        text: `Sistema de segurança`,
        iconURL:
          "https://cdn.discordapp.com/emojis/1209901157758009444.webp?size=96&quality=lossless",
      })
      .setTimestamp();
    webhookClient.send({
      username: "Robut - Erro no bot",
      avatarURL:
        "https://cdn.discordapp.com/emojis/1209901510616678440.webp?size=96&quality=lossless",
      embeds: [embed],
    });
  }

  // somePromise.then((res) => {
  //   return reportToUser(JSON.pasre(res)); // Note the typo (`pasre`)
  // }); // No `.catch()` or `.then()`
};

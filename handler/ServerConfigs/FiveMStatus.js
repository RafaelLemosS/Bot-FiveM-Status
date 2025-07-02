const Discord = require("discord.js");

const config = require("../../config.json");
const CFXStatus = require("cfx-status");

require("dotenv/config");

let caiu = false;
let horarioCaiu = "N/A";

module.exports = async (client) => {
  client.on("ready", async () => {
    console.log("FiveM Status Online!");
    updateFiveMStatus(); // Atualiza o contador quando o bot inicia
    setInterval(updateFiveMStatus, 60000); // Atualiza o contador a cada 1 minuto
  });

  async function updateFiveMStatus() {
    const cfxre = new CFXStatus();
    const generalStatus = await cfxre.currentStatus;
    const Status =
      generalStatus.status.indicator == "none"
        ? "Online"
        : generalStatus.status.indicator;
    const description = generalStatus.status.description;
    const components = await cfxre.components; // CFX.re Systems Status

    enviarStatus(Status, description, components);
  }

  async function enviarStatus(status, descricao, componentes) {
    const cnlStatus = componentes[0];
    const emojiCNL =
      cnlStatus.status == "operational"
        ? config.emojis.online
        : config.emojis.offline;
    const gameStatus = componentes[4];
    const emojiGame =
      gameStatus.status == "operational"
        ? config.emojis.online
        : config.emojis.offline;
    const keymasterStatus = componentes[9];
    const emojiKey =
      keymasterStatus.status == "operational"
        ? config.emojis.online
        : config.emojis.offline;
    const cfxServerStatus = componentes[11];
    const emojiCFX =
      cfxServerStatus.status == "operational"
        ? config.emojis.online
        : config.emojis.offline;
    const emojiRede =
      status == "Online" ? config.emojis.online : config.emojis.offline;
    const msgStatus = status == "Online" ? "diff\n+ ONLINE" : `fix\n${status}`;
    updateMsg(
      emojiRede,
      emojiCFX,
      emojiCNL,
      emojiGame,
      emojiKey,
      cnlStatus,
      gameStatus,
      keymasterStatus,
      cfxServerStatus,
      msgStatus,
      descricao
    );
    verificarQueda(status, msgStatus, descricao, emojiRede);
  }

  async function verificarQueda(status, msgStatus, descricao, emojiRede) {
    const canal = client.channels.cache.get(config.canais.alerta);
    const embedQueda = new Discord.EmbedBuilder()
      .setAuthor({
        name: "Verificação de status do FiveM!",
        iconURL:
          "https://cdn.discordapp.com/emojis/1210325622388432937.webp?size=80&quality=lossless",
      })
      .setThumbnail(canal.guild.iconURL({ dynamic: true }))
      .addFields({
        name: `<:fivem:1231634534647468186> GERAL STATUS: `,
        value: `${emojiRede} ***Status:*** \`\`\`${msgStatus} | ${status}\n\`\`\`\n<:Anotao:1210325651370934332> ***Descrição:*** \`\`\`fix\n${descricao}\n\`\`\``,
        inline: false,
      })
      .setFooter({
        text: `Avisarei quando retornar!`,
        iconURL:
          "https://cdn.discordapp.com/emojis/1209901375438458940.webp?size=80&quality=lossless",
      })
      .setColor(config.embeds.cor);
    if (status == "Online" && caiu == true) {
      caiu = false
      const horarioRetorno = await getHorario();
      embedQueda.setDescription(`FiveM se encontra online novamente!`);
      embedQueda.addFields({
        name: `<:Data:1238913378345422959> HORÁRIOS: `,
        value: `${config.emojis.offline} ***Queda:*** \`\`\`fix\n${horarioCaiu}\n\`\`\`\n${config.emojis.online} ***Retorno:*** \`\`\`${horarioRetorno}\n\`\`\``,
        inline: false,
      });
      canal.send({ content: `<@580416011472338957>`, embeds: [embedQueda] });
    } else if (status != "Online" && caiu == false) {
      caiu = true;
      horarioCaiu = await getHorario();
      embedQueda.setDescription(
        `Detectamos uma possivel queda do FiveM, verifique o ocorrido no site do [Cfx.re](https://status.cfx.re)!`
      );
      embedQueda.addFields({
        name: `<:Data:1238913378345422959> HORÁRIOS: `,
        value: `${config.emojis.offline} ***Queda:*** \`\`\`fix\n${horarioCaiu}\n\`\`\``,
        inline: false,
      });
      canal.send({ content: `<@580416011472338957>`, embeds: [embedQueda] });
    }
  }

  async function updateMsg(
    emojiRede,
    emojiCFX,
    emojiCNL,
    emojiGame,
    emojiKey,
    cnlStatus,
    gameStatus,
    keymasterStatus,
    cfxServerStatus,
    msgStatus,
    descricao
  ) {
    const canal = client.channels.cache.get(config.canais.status);
    if (canal) {
      const cmsg = await canal.messages
        .fetch({ limit: 10 })
        .then((msg) =>
          msg.filter((m) => m.author.id === client.user.id).last()
        );

      if (cmsg && cmsg.embeds.length < 1) {
        cmsg.delete();
        cmsg = null;
      }

      const data = new Date();
      data.toLocaleString("pt-br", {
        timezone: "Brazil/brt",
      });
      const horaFormatada = new Intl.DateTimeFormat("pt-BR", {
        timeStyle: "short",
        timeZone: "America/Sao_Paulo",
      });

      const embed2 = new Discord.EmbedBuilder()
        .setAuthor({
          name: "Verificação de status do FiveM!",
          iconURL: client.user.avatarURL(),
        })
        .setThumbnail(canal.guild.iconURL({ dynamic: true }))
        .setDescription(
          `Aqui está a última atualização baseada no status do [Cfx.re](https://status.cfx.re)`
        )
        .addFields({
          name: `<:fivem:1231634534647468186> GERAL STATUS: `,
          value: `${emojiRede} ***Status:*** \`\`\`${msgStatus}\n\`\`\`\n<:Anotao:1210325651370934332> ***Descrição:*** \`\`\`fix\n${descricao}\n\`\`\``,
          inline: false,
        })

        .addFields({
          name: `${emojiCNL} ${cnlStatus.name}: `,
          value: `\`\`\`fix\n${cnlStatus.status}\n\`\`\``,
          inline: false,
        })
        .addFields({
          name: `${emojiGame} ${gameStatus.name}: `,
          value: `\`\`\`fix\n${gameStatus.status}\n\`\`\``,
          inline: false,
        })
        .addFields({
          name: `${emojiKey} ${keymasterStatus.name}: `,
          value: `\`\`\`fix\n${keymasterStatus.status}\n\`\`\``,
          inline: false,
        })
        .addFields({
          name: `${emojiCFX} ${cfxServerStatus.name}: `,
          value: `\`\`\`fix\n${cfxServerStatus.status}\n\`\`\``,
          inline: false,
        })
        .setFooter({
          text: `Atualizado a cada 1 minuto! • Última atualização: ${horaFormatada.format(
            data
          )}`,
          iconURL:
            "https://cdn.discordapp.com/emojis/1001555897341988986.gif?size=80&quality=lossless",
        })
        .setColor(config.embeds.cor);
      if (!cmsg)
        canal.send({
          embeds: [embed2],
        });
      else
        cmsg.edit({
          embeds: [embed2],
        });
    }
  }

  async function getHorario() {
    const data = new Date();
    data.toLocaleString("pt-br", { timezone: "Brazil/brt" });
    const dataAtual = new Date();
    const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short", // Opções: "short", "long"
      timeZone: "America/Sao_Paulo",
    });
    const horaFormatada = new Intl.DateTimeFormat("pt-BR", {
      timeStyle: "short", // Opções: "narrow", "short", "long"
      timeZone: "America/Sao_Paulo",
    });
    const dataf = `${dataFormatada.format(dataAtual)} ás ${horaFormatada.format(
      dataAtual
    )}`;
    return dataf;
  }
};

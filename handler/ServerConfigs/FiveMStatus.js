const { EmbedBuilder } = require("discord.js");
const config = require("../../config.json");
const CFXStatus = require("cfx-status");

require("dotenv/config");

let caiu = false;
let horarioCaiu = "N/A";

module.exports = (client) => {
  client.once("ready", () => {
    console.log("FiveM Status Online!");
    updateFiveMStatus();
    setInterval(updateFiveMStatus, 60_000);
  });

  async function updateFiveMStatus() {
    try {
      const cfxre = new CFXStatus();
      const { status, components } = await cfxre.currentStatus;
      const statusText = status.indicator === "none" ? "Online" : status.indicator;
      enviarStatus(
        statusText,
        status.description,
        await cfxre.components
      );
    } catch (err) {
      console.error("Erro ao atualizar status do FiveM:", err);
    }
  }

  async function enviarStatus(status, descricao, componentes) {
    const getEmoji = (comp) =>
      comp.status === "operational" ? config.emojis.online : config.emojis.offline;

    const cnlStatus = componentes[0];
    const gameStatus = componentes[4];
    const keymasterStatus = componentes[9];
    const cfxServerStatus = componentes[11];

    const emojiRede = status === "Online" ? config.emojis.online : config.emojis.offline;
    const msgStatus = status === "Online" ? "diff\n+ ONLINE" : `fix\n${status}`;

    await updateMsg({
      canalId: config.canais.status,
      emojiRede,
      emojiCFX: getEmoji(cfxServerStatus),
      emojiCNL: getEmoji(cnlStatus),
      emojiGame: getEmoji(gameStatus),
      emojiKey: getEmoji(keymasterStatus),
      cnlStatus,
      gameStatus,
      keymasterStatus,
      cfxServerStatus,
      msgStatus,
      descricao,
    });

    await verificarQueda(status, msgStatus, descricao, emojiRede);
  }

  async function verificarQueda(status, msgStatus, descricao, emojiRede) {
    const canal = client.channels.cache.get(config.canais.alerta);
    if (!canal) return;

    const embedQueda = new EmbedBuilder()
      .setAuthor({
        name: "Verificação de status do FiveM!",
        iconURL: "https://cdn.discordapp.com/emojis/1210325622388432937.webp?size=80&quality=lossless",
      })
      .setThumbnail(canal.guild.iconURL({ dynamic: true }))
      .addFields({
        name: "<:fivem:1231634534647468186> GERAL STATUS:",
        value: `${emojiRede} ***Status:*** \`\`\`${msgStatus} | ${status}\n\`\`\`\n<:Anotao:1210325651370934332> ***Descrição:*** \`\`\`fix\n${descricao}\n\`\`\``,
        inline: false,
      })
      .setFooter({
        text: "Avisarei quando retornar!",
        iconURL: "https://cdn.discordapp.com/emojis/1209901375438458940.webp?size=80&quality=lossless",
      })
      .setColor(config.embeds.cor);

    if (status === "Online" && caiu) {
      caiu = false;
      const horarioRetorno = await getHorario();
      embedQueda.setDescription("FiveM se encontra online novamente!");
      embedQueda.addFields({
        name: "<:Data:1238913378345422959> HORÁRIOS:",
        value: `${config.emojis.offline} ***Queda:*** \`\`\`fix\n${horarioCaiu}\n\`\`\`\n${config.emojis.online} ***Retorno:*** \`\`\`${horarioRetorno}\n\`\`\``,
        inline: false,
      });
      canal.send({ content: "<@580416011472338957>", embeds: [embedQueda] });
    } else if (status !== "Online" && !caiu) {
      caiu = true;
      horarioCaiu = await getHorario();
      embedQueda.setDescription(
        "Detectamos uma possível queda do FiveM, verifique o ocorrido no site do [Cfx.re](https://status.cfx.re)!"
      );
      embedQueda.addFields({
        name: "<:Data:1238913378345422959> HORÁRIOS:",
        value: `${config.emojis.offline} ***Queda:*** \`\`\`fix\n${horarioCaiu}\n\`\`\``,
        inline: false,
      });
      canal.send({ content: "<@580416011472338957>", embeds: [embedQueda] });
    }
  }

  async function updateMsg({
    canalId,
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
    descricao,
  }) {
    const canal = client.channels.cache.get(canalId);
    if (!canal) return;

    let cmsg = await canal.messages
      .fetch({ limit: 10 })
      .then((msgs) => msgs.filter((m) => m.author.id === client.user.id).last())
      .catch(() => null);

    if (cmsg && cmsg.embeds.length < 1) {
      await cmsg.delete().catch(() => { });
      cmsg = null;
    }

    const now = new Date();
    const horaFormatada = new Intl.DateTimeFormat("pt-BR", {
      timeStyle: "short",
      timeZone: "America/Sao_Paulo",
    }).format(now);

    const embed = new EmbedBuilder()
      .setAuthor({
        name: "Verificação de status do FiveM!",
        iconURL: client.user.avatarURL(),
      })
      .setThumbnail(canal.guild.iconURL({ dynamic: true }))
      .setDescription("Aqui está a última atualização baseada no status do [Cfx.re](https://status.cfx.re)")
      .addFields(
        {
          name: "<:fivem:1231634534647468186> GERAL STATUS:",
          value: `${emojiRede} ***Status:*** \`\`\`${msgStatus}\n\`\`\`\n<:Anotao:1210325651370934332> ***Descrição:*** \`\`\`fix\n${descricao}\n\`\`\``,
          inline: false,
        },
        {
          name: `${emojiCNL} ${cnlStatus.name}:`,
          value: `\`\`\`fix\n${cnlStatus.status}\n\`\`\``,
          inline: false,
        },
        {
          name: `${emojiGame} ${gameStatus.name}:`,
          value: `\`\`\`fix\n${gameStatus.status}\n\`\`\``,
          inline: false,
        },
        {
          name: `${emojiKey} ${keymasterStatus.name}:`,
          value: `\`\`\`fix\n${keymasterStatus.status}\n\`\`\``,
          inline: false,
        },
        {
          name: `${emojiCFX} ${cfxServerStatus.name}:`,
          value: `\`\`\`fix\n${cfxServerStatus.status}\n\`\`\``,
          inline: false,
        }
      )
      .setFooter({
        text: `Atualizado a cada 1 minuto! • Última atualização: ${horaFormatada}`,
        iconURL: "https://cdn.discordapp.com/emojis/1001555897341988986.gif?size=80&quality=lossless",
      })
      .setColor(config.embeds.cor);

    if (!cmsg) {
      canal.send({ embeds: [embed] });
    } else {
      cmsg.edit({ embeds: [embed] });
    }
  }

  async function getHorario() {
    const now = new Date();
    const dataFormatada = new Intl.DateTimeFormat("pt-BR", {
      dateStyle: "short",
      timeZone: "America/Sao_Paulo",
    }).format(now);
    const horaFormatada = new Intl.DateTimeFormat("pt-BR", {
      timeStyle: "short",
      timeZone: "America/Sao_Paulo",
    }).format(now);
    return `${dataFormatada} às ${horaFormatada}`;
  }
};

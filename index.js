require("dotenv").config();
const {
  Client,
  GatewayIntentBits,
  Partials,
  Events,
  EmbedBuilder,
} = require("discord.js");

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.MessageContent,
  ],
  partials: [Partials.Message, Partials.Channel, Partials.Reaction],
});

client.once(Events.ClientReady, () => {
  console.log(`🤖 Bot พร้อมทำงานแล้ว!`);
});

// ทักทายสมาชิกใหม่
client.on("guildMemberAdd", async (member) => {
  const channel = await member.guild.channels.fetch(
    process.env.WELCOME_CHANNEL_ID
  );
  if (!channel) return;

  const welcomeEmbed = new EmbedBuilder()
    .setColor("#00BFFF")
    .setTitle(`🎉 ยินดีต้อนรับ !`)
    .setDescription(
      `
สวัสดี 🙏  ${member.user}!

📜 **กฎการใช้งาน** 
> 1. ห้ามโฆษณา  
> 2. เคารพผู้อื่น  
> 3. ทำตัวดีๆ แล้วจะมีความสุข 😄

✅ กด reaction ด้านล่างเพื่อยืนยันว่าคุณยอมรับกฎและรับ role เริ่มต้น
`
    )
    .setThumbnail(member.user.displayAvatarURL({ dynamic: true })) // ใช้รูป avatar ของผู้ใช้
    .setFooter({ text: "ยินดีต้อนรับอีกครั้ง!" })
    .setTimestamp();

  const msg = await channel.send({ embeds: [welcomeEmbed] });
  await msg.react("✅");
});

// มอบ role เมื่อมีการกด reaction
client.on(Events.MessageReactionAdd, async (reaction, user) => {
  if (reaction.partial) await reaction.fetch();

  if (reaction.emoji.name === "✅" && !user.bot) {
    const guild = reaction.message.guild;
    const member = await guild.members.fetch(user.id);
    const role = guild.roles.cache.get(process.env.ROLE_ID);

    if (
      role &&
      member &&
      !member.roles.cache.has(role.id) &&
      member.roles.cache.size <= 1
    ) {
      await member.roles.add(role);
      console.log(`🎉 มอบ role ให้กับ ${member.user.tag}`);
    }
  }
});

client.login(process.env.DISCORD_TOKEN);

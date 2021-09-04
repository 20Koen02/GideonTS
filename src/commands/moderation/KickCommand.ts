import { Command } from 'discord-akairo';
import { GuildMember, Message, MessageEmbed } from 'discord.js';
import { primaryColor } from '../../Config';

export default class KickCommand extends Command {
  public constructor() {
    super('kick', {
      aliases: ['kick'],
      channel: 'guild',
      category: 'Moderation Commands',

      description: {
        content: 'Kick een member',
        usage: 'kick [member] <reason>',
        examples: [
          'kick @Koen02#2933',
          'kick @Koen02#2933 This person is too nice',
        ],
      },
      ratelimit: 3,
      userPermissions: ['KICK_MEMBERS'],
      args: [
        {
          id: 'member',
          type: 'member',
          prompt: {
            start: (msg: Message) => `${msg.author.toString()}, je moet een gebruiker opgeven`,
            retry: (msg: Message) => `${msg.author.toString()}, je moet een juiste gebruiker opgeven`,
          },
        },
        {
          id: 'reason',
          type: 'string',
          match: 'rest',
          default: 'Geen reden opgegeven',
        },
      ],
    });
  }

  public async exec(message: Message,
    { member, reason }: { member: GuildMember, reason: string }): Promise<Message> {
    const clientMember = await message.guild.me;
    const messageMember = await message.guild.members.fetch(message.author.id);

    if (member.user.id === clientMember.user.id) return message.util.reply('je kan mij niet kicken');
    if (message.author.id === member.user.id) return message.util.reply('je kan jezelf niet kicken');
    if (member.roles.highest.position >= messageMember.roles.highest.position) return message.util.reply('deze gebruiker heeft hogere of gelijkwaardige rollen met jou.');
    if (member.roles.highest.position >= clientMember.roles.highest.position) return message.util.reply(`mijn hoogste rol is lager of gelijk aan ${member}'s hoogste rol`);
    if (!member.kickable) return message.util.reply(`ik kan ${member} niet kicken voor een of andere reden.`);

    const msg = await message.util.send(`Weet je zeker dat je ${member} wilt kicken? J/N`);
    const filter = r => r.author!.id === message.author.id;
    const responses = await msg.channel.awaitMessages({ filter, max: 1, time: 30000 });
    if (!responses || responses.size < 1) return message.util.send('Verzoek verlopen');
    const response = responses.first();

    if (!(response.content.toLowerCase() === 'y'
      || response.content.toLowerCase() === 'yes'
      || response.content.toLowerCase() === 'j'
      || response.content.toLowerCase() === 'ja')) {
      return message.util.send('De kick is geannuleerd');
    }

    response.delete();

    let kickReason = `Gekickt door: ${messageMember.user.tag} - Reden: ${reason}`;
    if (kickReason.length > 512) {
      kickReason = `Gekickt door: ${messageMember.user.tag} - Geen reden opgegeven`;
    }

    try {
      await member.send({
        embeds: [new MessageEmbed()
          .setTitle(`Je bent gekickt van ${message.guild.name}`)
          .setDescription(`${reason ? `\n**Reden:** ${reason}\n` : ''}`)
          .setColor(primaryColor)],
      });
      await member.kick(kickReason);
    } catch (error) {
      return message.util.send(`Er ging iets fout: \`${error}\``);
    }
    return message.util.send({
      embeds: [new MessageEmbed()
        .setAuthor(`${member.user.username} is gekickt`, member.user.displayAvatarURL())
        .setDescription(`${reason ? `\n**Reden:** ${reason}\n` : ''}`)
        .setColor(primaryColor)],
    });
  }
}

import { Command } from 'discord-akairo';
import { GuildMember, Message, MessageEmbed } from 'discord.js';
import { primaryColor } from '../../Config';

export default class BanCommand extends Command {
  public constructor() {
    super('ban', {
      aliases: ['ban'],
      category: 'Moderation Commands',

      description: {
        content: 'Ban een member',
        usage: 'ban [member] <reason>',
        examples: [
          'ban @Koen02#2933',
          'ban @Koen02#2933 This person is too nice',
        ],
      },
      ratelimit: 3,
      userPermissions: ['BAN_MEMBERS'],
      args: [
        {
          id: 'member',
          type: 'member',
          prompt: {
            start: (msg: Message) => `${msg.author}, je moet een gebruiker opgeven`,
            retry: (msg: Message) => `${msg.author}, je moet een juiste gebruiker opgeven`,
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
    const clientMember = await message.guild!.me!;
    const messageMember = await message.guild!.members.fetch(message.author!.id);

    if (member.user.id === clientMember.user.id) return message.util!.reply('je kan mij niet verbannen');
    if (message.author!.id === member.user.id) return message.util!.reply('je kan jezelf niet verbannen');
    if (member.roles.highest.position >= messageMember.roles.highest.position) return message.util!.reply('deze gebruiker heeft hogere of gelijkwaardige rollen met jou.');
    if (member.roles.highest.position >= clientMember.roles.highest.position) return message.util!.reply(`mijn hoogste rol is lager of gelijk aan ${member}'s hoogste rol`);
    if (!member.bannable) return message.util!.reply(`ik kan ${member} niet verbannen voor een of andere reden.`);

    const msg = await message.util.send(`Weet je zeker dat je ${member} wilt verbannen? J/N`);
    const responses = await msg.channel.awaitMessages(
      (r: Message) => r.author!.id === message.author!.id, { max: 1, time: 30000 },
    );
    if (!responses || responses.size < 1) return message.util!.send('Verzoek verlopen');
    const response = responses.first();

    if (!(response!.content.toLowerCase() === 'y'
      || response!.content.toLowerCase() === 'yes'
      || response!.content.toLowerCase() === 'j'
      || response!.content.toLowerCase() === 'ja')) {
      return message.util!.send('De ban is geannuleerd');
    }

    response.delete();

    let banReason = `Verbannen door: ${messageMember!.user.tag} - Reden: ${reason}`;
    if (banReason.length > 512) {
      banReason = `Verbannen door: ${messageMember!.user.tag} - Geen reden opgegeven`;
    }

    try {
      await member.send(new MessageEmbed()
        .setTitle(`Je bent verbannen van ${message.guild!.name}`)
        .setDescription(`${reason ? `\n**Reden:** ${reason}\n` : ''}`)
        .setColor(primaryColor));
      await member.ban({ reason: banReason });
    } catch {
      try {
        await message.guild!.members.ban(member.id, { reason: banReason });
      } catch (error) {
        return message.util!.send(`Er ging iets fout: \`${error}\``);
      }
    }
    return message.util!.send(new MessageEmbed()
      .setAuthor(`${member.user.username} is verbannen`, member.user.displayAvatarURL())
      .setDescription(`${reason ? `\n**Reden:** ${reason}\n` : ''}`)
      .setColor(primaryColor));
  }
}

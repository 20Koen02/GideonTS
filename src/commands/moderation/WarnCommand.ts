import { Command } from 'discord-akairo';
import { GuildMember, Message, MessageEmbed } from 'discord.js';
import { Repository } from 'typeorm';
import WarnsModel from '../../models/WarnsModel';
import { primaryColor } from '../../Config';

export default class WarnCommand extends Command {
  public constructor() {
    super('warn', {
      aliases: ['warn'],
      category: 'Moderation Commands',
      description: {
        content: 'Waarschuw een gebruiker uit de server',
        usage: 'warn [member] <reason>',
        examples: [
          'warn @Koen02#2933 This person is too nice',
          'warn @Koen02#2933',
        ],
      },
      ratelimit: 3,
      userPermissions: ['MANAGE_MESSAGES'],
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
    { member, reason }: {member: GuildMember, reason: string}): Promise<Message> {
    const warnRepo: Repository<WarnsModel> = this.client.db.getRepository(WarnsModel);
    if (member.roles.highest.position >= message.member.roles.highest.position
      && message.author.id !== message.guild.ownerID) {
      return message.util.reply('Deze gebruiker heeft hogere of gelijkwaardige rollen met jou');
    }

    await warnRepo.insert({
      guild: message.guild.id,
      user: member.id,
      moderator: message.author.id,
      reason,
    });

    return message.util.send(new MessageEmbed()
      .setColor(primaryColor)
      .setDescription(`**${member.user.tag}** is gewaarschuwd door **${message.author.tag}**\nReden: *${reason}*`));
  }
}

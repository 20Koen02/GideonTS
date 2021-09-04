import { Command } from 'discord-akairo';
import {
  GuildMember, Message, MessageEmbed, User,
} from 'discord.js';
import { Repository } from 'typeorm';
import WarnsModel from '../../models/WarnsModel';
import { primaryColor } from '../../Config';

export default class InfractionsCommand extends Command {
  public constructor() {
    super('infractions', {
      aliases: ['infractions', 'infr'],
      channel: 'guild',
      category: 'Moderation Commands',
      description: {
        content: 'Bekijk de overtredingen van een gebruiker in de server',
        usage: 'infractions [member]',
        examples: [
          'infractions @Koen02#2933',
        ],
      },
      ratelimit: 3,
      userPermissions: ['MANAGE_MESSAGES'],
      args: [
        {
          id: 'member',
          type: 'member',
          prompt: {
            start: (msg: Message) => `${msg.author.toString()}, je moet een gebruiker opgeven`,
            retry: (msg: Message) => `${msg.author.toString()}, je moet een juiste gebruiker opgeven`,
          },
        },
      ],
    });
  }

  public async exec(message: Message, { member }: { member: GuildMember }): Promise<Message> {
    const warnRepo: Repository<WarnsModel> = this.client.db.getRepository(WarnsModel);
    const warns: WarnsModel[] = await warnRepo.find(({ user: member.id, guild: message.guild.id }));

    if (!warns.length) return message.util.reply('ik heb geen overtredingen gevonden');

    // eslint-disable-next-line consistent-return
    const infractions = await Promise.all(warns.map(async (v: WarnsModel, i: number) => {
      const mod: User = await this.client.users.fetch(v.moderator).catch(() => null);
      if (mod) {
        return {
          index: i + 1,
          moderator: mod.tag,
          reason: v.reason,
        };
      }
    }));

    return message.util.send({
      embeds: [new MessageEmbed()
        .setAuthor(`Overtredingen | ${member.user.username}`, member.user.displayAvatarURL())
        .setColor(primaryColor)
        .setDescription(infractions.map((v) => `\`${v.index}\` | Moderator: *${v.moderator}*\nReden: *${v.reason}*\n`).join('\n'))],
    });
  }
}

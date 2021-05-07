import { Command } from 'discord-akairo';
import {
  GuildMember, Message, MessageEmbed,
} from 'discord.js';
import { Repository } from 'typeorm';
import ScoresModel from '../../models/ScoresModel';
import { primaryColor } from '../../Config';

export default class RankCommand extends Command {
  public constructor() {
    super('rank', {
      aliases: ['rank', 'level', 'lvl', 'exp', 'xp'],
      category: 'Public Commands',
      description: {
        content: 'Bekijk de rank van een gebruiker in de server',
        usage: 'rank <member>',
        examples: [
          'rank @Koen02#2933',
          'rank',
        ],
      },
      ratelimit: 3,
      args: [
        {
          id: 'member',
          type: 'member',
          default: (msg: Message) => msg.member,
        },
      ],
    });
  }

  public async exec(message: Message, { member }: {member: GuildMember}): Promise<Message> {
    const scoresRepo: Repository<ScoresModel> = this.client.db.getRepository(ScoresModel);
    const score: ScoresModel = await scoresRepo.findOne(({
      user: member.id, guild: message.guild.id,
    }));
    if (!score) return message.util.reply('deze gebruiker heeft nog geen experience punten');

    const sortedUserScores = await this.client.db
      .getRepository(ScoresModel)
      .createQueryBuilder('scores')
      .orderBy('scores.total_exp', 'DESC')
      .select(['scores.user'])
      .getMany();

    const position = sortedUserScores.findIndex((x) => x.user === score.user) + 1;

    return message.util.send(new MessageEmbed()
      .setAuthor(`Rank | ${member.user.username}`, member.user.displayAvatarURL())
      .setColor(primaryColor)
      .addField('Rank', `${position}/${sortedUserScores.length}`, true)
      .addField('Level', `${score.level}`, true)
      .addField('XP', `${score.exp}/${(5 * (score.level ** 2) + 50 * score.level + 100)} (totaal ${score.total_exp})`, true));
  }
}

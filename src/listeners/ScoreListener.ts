import { Message } from 'discord.js';
import { Repository } from 'typeorm';
import ScoresModel from '../models/ScoresModel';

const { Listener } = require('discord-akairo');

class ScoreListener extends Listener {
  constructor() {
    super('score', {
      emitter: 'client',
      event: 'message',
    });
  }

  public async exec(message: Message) {
    if (message.author.bot) return;

    const scoresRepo: Repository<ScoresModel> = this.client.db.getRepository(ScoresModel);
    let score: ScoresModel = await scoresRepo.findOne(({
      user: message.author.id, guild: message.guild.id,
    }));

    const currentDate = new Date();

    if (!score) {
      await scoresRepo.insert({
        user: message.author.id,
        exp: 0,
        level: 0,
        total_exp: 0,
        guild: message.guild.id,
        cooldown_till: new Date(currentDate.getTime() + 60000),
      });
      score = await scoresRepo.findOne(({
        user: message.author.id, guild: message.guild.id,
      }));
    } else if (score.cooldown_till.getTime() > currentDate.getTime()) return;

    const randomExp = Math.floor(Math.random() * (25 - 15 + 1) + 15);
    const totalNeededExp = Math.floor(5 * (score.level ** 2) + 50 * score.level + 100);

    score.cooldown_till = new Date(currentDate.getTime() + 60000);
    score.total_exp += randomExp;
    score.exp += randomExp;

    if (score.exp >= totalNeededExp) {
      score.level += 1;
      score.exp -= totalNeededExp;
      message.util.reply(`je bent een level omhoog! Je level is nu **${score.level}**!`);
    }

    await scoresRepo.save(score);
  }
}

module.exports = ScoreListener;

import { Command } from 'discord-akairo';
import { Message, MessageAttachment } from 'discord.js';
import { Canvas, resolveImage } from 'canvas-constructor';
import path from 'path';

export default class BallCommand extends Command {
  public constructor() {
    super('dice', {
      aliases: ['dice', 'dobbel', 'dobbelen'],
      channel: 'guild',
      category: 'Public Commands',
      description: {
        content: 'Gooi dobbelstenen',
        usage: 'dobbelen',
        examples: [
          'dobbelen',
        ],
      },
      ratelimit: 3,
    });
  }

  public async exec(message: Message): Promise<Message> {
    const rng = Math.floor(Math.random() * 6) + 1;
    const side = await resolveImage(path.resolve(__dirname, `../../assets/dice/${rng}.png`));

    const buffer = new Canvas(110, 70)
      .setColor('#2F3136')
      .printRectangle(0, 0, 110, 70)
      .setColor('#4b4e54')
      .printRoundedRectangle(50, 20, 50, 30, 5)
      .setColor('#242528')
      .printRoundedRectangle(10, 10, 50, 50, 10)
      .printImage(side, 10, 10, 50, 50)
      .setColor('#ffffff')
      .setTextFont('25px Ubuntu')
      .printText(`${rng}`, 72, 43)
      .toBuffer();

    const attachment = new MessageAttachment(buffer, `dice-${rng}.png`);
    return message.util.send(attachment);
  }
}

import { Argument, Command } from 'discord-akairo';
import { Message, MessageAttachment } from 'discord.js';
import axios from 'axios';

export default class AchievementCommand extends Command {
  public constructor() {
    super('achievement', {
      aliases: ['achievement', 'ach', 'advancement', 'adv'],
      channel: 'guild',
      category: 'Public Commands',
      description: {
        content: 'Genereer een minecraft achievement',
        usage: 'achievement [top] <bottom>',
        examples: [
          'achievement Top Bottom',
          'achievement "Advancement Made!" "Stone Age"',
          'achievement',
        ],
      },
      ratelimit: 3,
      args: [
        {
          id: 'top',
          type: Argument.validate('string', (msg, p, str) => str.length < 22),
          prompt: {
            start: (msg: Message) => `${msg.author.toString()}, je moet een beschrijving opgeven`,
            retry: (msg: Message) => `${msg.author.toString()}, je moet een juiste beschrijving opgeven`,
          },
        },
        {
          id: 'bottom',
          type: Argument.validate('string', (msg, p, str) => str.length < 22),
          default: null,
          prompt: {
            retry: (msg: Message) => `${msg.author.toString()}, je moet een juiste 2e beschrijving opgeven`,
            optional: true,
          },
        },
      ],
    });
  }

  public async exec(message: Message, { top, bottom }): Promise<Message> {
    const itemIcon = Math.floor((Math.random() * 39) + 1);
    let url: string;
    if (bottom) {
      url = `https://minecraftskinstealer.com/achievement/${itemIcon}/${top}/${bottom}`;
    } else {
      url = `https://minecraftskinstealer.com/achievement/${itemIcon}/Achievement Get!/${top}`;
    }
    const req = await axios.get(url, { responseType: 'arraybuffer' });
    return message.util.send({ files: [new MessageAttachment(Buffer.from(req.data, 'binary'))] });
  }
}

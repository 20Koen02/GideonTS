import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { create, all } from 'mathjs';
import { primaryColor } from '../../Config';

const math = create(all);
const limitedEvaluate = math.evaluate;
math.import({
  import() { throw new Error('Function import is disabled'); },
  createUnit() { throw new Error('Function createUnit is disabled'); },
  evaluate() { throw new Error('Function evaluate is disabled'); },
  parse() { throw new Error('Function parse is disabled'); },
  simplify() { throw new Error('Function simplify is disabled'); },
  derivative() { throw new Error('Function derivative is disabled'); },
}, { override: true });

export default class CalcCommand extends Command {
  public constructor() {
    super('calc', {
      aliases: ['calc'],
      category: 'Public Commands',
      description: {
        content: 'evalueer een uitdrukking',
        usage: 'calc',
        examples: [
          'calc 1 + 1 * pi',
          'calc sin(45 deg) ^ 2',
          'calc 12.7 cm to inch',
          'calc 9 / 3 + 2i',
        ],
      },
      ratelimit: 3,
      args: [
        {
          id: 'expr',
          type: 'string',
          prompt: {
            start: (msg: Message) => `${msg.author}, je moet een uitdrukking opgeven`,
          },
          match: 'rest',
        },
      ],
    });
  }

  public async exec(message: Message, { expr }: {expr: string}): Promise<Message> {
    try {
      if (limitedEvaluate(expr).toString().length > 2048) {
        throw new Error();
      }
      const embed = new MessageEmbed()
        .setColor(primaryColor)
        .setDescription(`\`${expr} = ${limitedEvaluate(expr)}\``);
      return message.util.send(embed);
    } catch (e) {
      const embed = new MessageEmbed()
        .setColor(primaryColor)
        .setDescription(`:x: ${e.message}`);
      return message.util.send(embed);
    }
  }
}

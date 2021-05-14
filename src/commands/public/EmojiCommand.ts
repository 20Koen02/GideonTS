import { Argument, Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { primaryColor } from '../../Config';

export default class EmojiCommand extends Command {
  public constructor() {
    super('emoji', {
      aliases: ['emoji', 'emote'],
      channel: 'guild',
      category: 'Public Commands',
      description: {
        content: 'Text naar emoji converter',
        usage: 'emoji [tekst]',
        examples: [
          'emoji hello world',
        ],
      },
      ratelimit: 3,
      args: [
        {
          id: 'text',
          type: Argument.validate('string', (msg, p, str) => str.length <= 50),
          match: 'rest',
          prompt: {
            start: (msg: Message) => `${msg.author}, je moet tekst opgeven`,
            retry: (msg: Message) => `${msg.author}, je moet tekst opgeven (niet meer dan 50 tekens)`,
          },
        },
      ],
    });
  }

  public async exec(message: Message, { text }): Promise<Message> {
    const input = text.replace(/[A-Za-z]/g, (letter) => `:regional_indicator_${letter.toLowerCase()}:`);
    const emojis = input.split(' ').join(':black_small_square:');
    const emojisfinal = emojis.split('::').join(': :');
    return message.util.send(new MessageEmbed()
      .setColor(primaryColor)
      .setFooter(`Aangevraagd door: ${message.author.username}`, message.author.displayAvatarURL())
      .setDescription(emojisfinal));
  }
}

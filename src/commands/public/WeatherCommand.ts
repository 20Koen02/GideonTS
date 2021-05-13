import { Command } from 'discord-akairo';
import { Message, MessageAttachment, MessageEmbed } from 'discord.js';
import axios, { AxiosResponse } from 'axios';
import { randomBytes } from 'crypto';
import { primaryColor } from '../../Config';

export default class PingCommand extends Command {
  public constructor() {
    super('weer', {
      aliases: ['weer', 'weather'],
      channel: 'guild',
      category: 'Public Commands',
      description: {
        content: 'Het weer',
        usage: 'weer',
        examples: [
          'weer',
        ],
      },
      ratelimit: 3,
      args: [
        {
          id: 'location',
          type: 'string',
          prompt: {
            start: (msg: Message) => `${msg.author}, je moet een plaats opgeven`,
          },
          match: 'rest',
        },
      ],
    });
  }

  public async exec(message: Message, { location }: { location: string }): Promise<Message> {
    const url = `https://wttr.in/${encodeURI(location)}_0tp_lang=nl.png?m`;

    const req = await axios.get(url, { responseType: 'arraybuffer' });
    return message.util.send(new MessageAttachment(Buffer.from(req.data, 'binary')));
  }
}

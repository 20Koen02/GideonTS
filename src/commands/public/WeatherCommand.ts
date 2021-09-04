import { Command } from 'discord-akairo';
import { Message, MessageAttachment } from 'discord.js';
import axios from 'axios';

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
            start: (msg: Message) => `${msg.author.toString()}, je moet een plaats opgeven`,
          },
          match: 'rest',
        },
      ],
    });
  }

  public async exec(message: Message, { location }: { location: string }): Promise<void> {
    const url = `https://wttr.in/${encodeURI(location)}_0tp_lang=nl.png?m`;

    axios.get(url, { responseType: 'arraybuffer' })
      .then((res) => {
        message.util.send({ files: [new MessageAttachment(Buffer.from(res.data, 'binary'))] });
      })
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      .catch((err) => {
        message.util.send(`Ik kan geen weersvoorspelling krijgen voor *${location}*`);
      });
  }
}

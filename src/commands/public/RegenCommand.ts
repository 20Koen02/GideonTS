import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import axios, { AxiosResponse } from 'axios';
import { randomBytes } from 'crypto';
import { primaryColor } from '../../Config';

export default class PingCommand extends Command {
  public constructor() {
    super('regen', {
      aliases: ['regen'],
      channel: 'guild',
      category: 'Public Commands',
      description: {
        content: 'Buienradar',
        usage: 'regen',
        examples: [
          'regen',
        ],
      },
      ratelimit: 3,
    });
  }

  public async exec(message: Message): Promise<Message> {
    const nonce = randomBytes(16).toString('base64'); // Counteract cache
    const req: AxiosResponse = await axios.get(`https://api.buienradar.nl/image/1.0/RadarMapNL?w=1024&h=1024&nonce=${nonce}`);
    const gifUrl = `${req.request.res.responseUrl}?nonce=${nonce}`;

    return message.util.send(new MessageEmbed()
      .setTitle('🌧️  Actuele Buienradar')
      .setImage(gifUrl)
      .setColor(primaryColor));
  }
}

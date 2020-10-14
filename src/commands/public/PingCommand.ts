import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { primaryColor } from '../../Config';

export default class PingCommand extends Command {
  public constructor() {
    super('ping', {
      aliases: ['ping'],
      category: 'Public Commands',
      description: {
        content: 'Bereken de round-trip tijd & API latency',
        usage: 'ping',
        examples: [
          'ping',
        ],
      },
      ratelimit: 3,
    });
  }

  public async exec(message: Message): Promise<Message> {
    const m = await message.util.send('Ping?');
    return m.edit('', new MessageEmbed()
      .setColor(primaryColor)
      .setDescription(`:repeat: Round-trip tijd is **${m.createdTimestamp - message.createdTimestamp} ms**\n\n:clock1: API latency is **${this.client.ws.ping} ms**`));
  }
}

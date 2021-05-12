import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { primaryColor } from '../../Config';

export default class PingCommand extends Command {
  public constructor() {
    super('ping', {
      aliases: ['ping'],
      channel: 'guild',
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
    const sent = await message.util.send('Ping?');
    const timeDiff = Number(sent.editedAt || sent.createdAt)
      - Number(message.editedAt || message.createdAt);
    return sent.edit('', new MessageEmbed()
      .setTitle('Pong!')
      .setDescription(`🔂 **Round-trip time**: ${timeDiff} ms\n💟 **Heartbeat**: ${Math.round(this.client.ws.ping)} ms`)
      .setColor(primaryColor));
  }
}

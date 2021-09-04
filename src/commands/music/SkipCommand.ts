import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { primaryColor } from '../../Config';
import assert from 'assert';
import MusicSubscription from '../../lib/music/MusicSubscription';
import { entersState, joinVoiceChannel, VoiceConnectionStatus } from '@discordjs/voice';
import Song from '../../lib/music/Song';

export default class SkipCommand extends Command {
  public constructor() {
    super('skip', {
      aliases: ['skip'],
      channel: 'guild',
      category: 'Music Commands',
      description: {
        content: 'Skip het huidige nummer',
        usage: 'skip',
        examples: [
          'skip',
        ],
      },
      ratelimit: 3,
    });
  }

  public async exec(message: Message): Promise<Message> {
    const subscription = this.client.subscriptions.get(message.guild.id);

    if (subscription) {
      subscription.skip();
    } else {
      return message.util.send('Er wordt momenteel niets afgespeeld!');
    }
  }
}

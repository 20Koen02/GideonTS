import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { primaryColor } from '../../Config';
import assert from 'assert';
import MusicSubscription from '../../lib/music/MusicSubscription';
import { AudioPlayerStatus, AudioResource, entersState, joinVoiceChannel, VoiceConnectionStatus } from '@discordjs/voice';
import Song from '../../lib/music/Song';

export default class ResumeCommand extends Command {
  public constructor() {
    super('resume', {
      aliases: ['resume'],
      channel: 'guild',
      category: 'Music Commands',
      description: {
        content: 'Hervat het huidige nummer',
        usage: 'resume',
        examples: [
          'resume',
        ],
      },
      ratelimit: 3,
    });
  }

  public async exec(message: Message): Promise<Message> {
    const subscription = this.client.subscriptions.get(message.guild.id);

    if (subscription) {
      subscription.resume();
    } else {
      return message.util.send('Er wordt momenteel niets afgespeeld!');
    }
  }
}

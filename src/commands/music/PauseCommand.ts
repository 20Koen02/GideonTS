import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { primaryColor } from '../../Config';
import assert from 'assert';
import MusicSubscription from '../../lib/music/MusicSubscription';
import { AudioPlayerStatus, AudioResource, entersState, joinVoiceChannel, VoiceConnectionStatus } from '@discordjs/voice';
import Song from '../../lib/music/Song';

export default class PauseCommand extends Command {
  public constructor() {
    super('pause', {
      aliases: ['pause'],
      channel: 'guild',
      category: 'Music Commands',
      description: {
        content: 'Pauzeer het huidige nummer',
        usage: 'pause',
        examples: [
          'pause',
        ],
      },
      ratelimit: 3,
    });
  }

  public async exec(message: Message): Promise<Message> {
    const subscription = this.client.subscriptions.get(message.guild.id);

    if (subscription) {
      subscription.audioPlayer.pause();

      await message.util.send('Ik heb het huidige nummer gepauzeerd');
    } else {
      return message.util.send('Er wordt momenteel niets afgespeeld!');
    }
  }
}

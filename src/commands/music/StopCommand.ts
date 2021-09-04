import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { primaryColor } from '../../Config';
import assert from 'assert';
import MusicSubscription from '../../lib/music/MusicSubscription';
import { AudioPlayerStatus, AudioResource, entersState, joinVoiceChannel, VoiceConnectionStatus } from '@discordjs/voice';
import Song from '../../lib/music/Song';

export default class StopCommand extends Command {
  public constructor() {
    super('stop', {
      aliases: ['stop'],
      channel: 'guild',
      category: 'Music Commands',
      description: {
        content: 'Stop de muziek en leeg de wachtrij',
        usage: 'stop',
        examples: [
          'stop',
        ],
      },
      ratelimit: 3,
    });
  }

  public async exec(message: Message): Promise<Message> {
    const subscription = this.client.subscriptions.get(message.guild.id);

    if (subscription) {
      subscription.stopped = true;
      subscription.voiceConnection.destroy();
      this.client.subscriptions.delete(message.guild.id);

      await message.util.send('De muziek is gestopt en de wachtrij is geleegd');
    } else {
      return message.util.send('Er wordt momenteel niets afgespeeld!');
    }
  }
}

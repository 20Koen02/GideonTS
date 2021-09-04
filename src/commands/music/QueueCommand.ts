import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { primaryColor } from '../../Config';
import assert from 'assert';
import MusicSubscription from '../../lib/music/MusicSubscription';
import { AudioPlayerStatus, AudioResource, entersState, joinVoiceChannel, VoiceConnectionStatus } from '@discordjs/voice';
import Song from '../../lib/music/Song';

export default class QueueCommand extends Command {
  public constructor() {
    super('queue', {
      aliases: ['queue'],
      channel: 'guild',
      category: 'Music Commands',
      description: {
        content: 'De huidige wachtrij wordt getoond',
        usage: 'queue',
        examples: [
          'queue',
        ],
      },
      ratelimit: 3,
    });
  }

  public async exec(message: Message): Promise<Message> {
    const subscription = this.client.subscriptions.get(message.guild.id);

    if (subscription) {
      const current =
        subscription.audioPlayer.state.status === AudioPlayerStatus.Idle
          ? 'Er wordt momenteel niets afgespeeld!'
          : `Nu aan het spelen: **${(subscription.audioPlayer.state.resource as AudioResource<Song>).metadata.title}**`;

      const queue = subscription.queue
        .slice(0, 5)
        .map((track, index) => `**${index + 1}:** ${track.title}`)
        .join('\n');

      await message.util.send(`${current}\n\nVolgende in de wachtrij:\n${queue}`);
    } else {
      return message.util.send('Er wordt momenteel niets afgespeeld!');
    }
  }
}

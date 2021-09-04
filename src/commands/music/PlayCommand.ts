import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { primaryColor } from '../../Config';
import assert from 'assert';
import MusicSubscription from '../../lib/music/MusicSubscription';
import { entersState, joinVoiceChannel, VoiceConnectionStatus } from '@discordjs/voice';
import Song from '../../lib/music/Song';

export default class PlayCommand extends Command {
  public constructor() {
    super('play', {
      aliases: ['play'],
      channel: 'guild',
      category: 'Music Commands',
      description: {
        content: 'Speel een youtube nummer in je voice channel',
        usage: 'play [query]',
        examples: [
          'play never gonna give you up',
        ],
      },
      ratelimit: 3,
      args: [
        {
          id: 'query',
          match: 'rest',
          type: 'string',
          prompt: {
            start: (msg: Message) => `${msg.author.toString()}, wat zou je willen afspelen?`,
          },
        },
      ],
    });
  }

  public async exec(message: Message, { query }: { query: string }): Promise<Message> {
    let subscription = this.client.subscriptions.get(message.guild.id);

    const member = await message.guild.members.fetch(message.author);
    const voiceChannel = member.voice.channel;

    if (!subscription) {
      if (voiceChannel) {
        subscription = new MusicSubscription(
          joinVoiceChannel({
            channelId: voiceChannel.id,
            guildId: voiceChannel.guild.id,
            adapterCreator: voiceChannel.guild.voiceAdapterCreator,
          }),
          message.channel,
        );
        subscription.voiceConnection.on('error', console.warn);
        this.client.subscriptions.set(message.guild.id, subscription);
      }
    }

    if (!subscription) return message.util.send('Je moet in een spraakkanaal zitten om een nummer af te spelen!');

    try {
      await entersState(subscription.voiceConnection, VoiceConnectionStatus.Ready, 20e3);
    } catch (error) {
      console.warn(error);
      return message.util.send('Ik kon niet binnen 20 seconden deelnemen aan het spraakkanaal, probeer het later opnieuw!');
    }

    try {
      const song: Song = await Song.search(query);
      subscription.enqueue(song);

      const embed = new MessageEmbed()
        .setThumbnail(song.thumbnail)
        .setTitle('Toegevoegd aan de wachtrij:')
        .setDescription(`${song.title}`)
        .setFooter(`${song.author} - Aangevraagd door ${message.author.username}`, song.authorAvatar)
        .setColor(primaryColor);

      await message.util.sendNew({ embeds: [embed] });
    } catch (error) {
      console.warn(error);
      await message.util.send('Failed to play track, please try again later!');
    }
  }
}

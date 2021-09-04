import { AudioResource, createAudioResource, demuxProbe } from '@discordjs/voice';
import { raw as ytdl } from 'youtube-dl-exec';
import { getInfo } from 'ytdl-core';
import yts from 'yt-search';
import { TextBasedChannels, TextChannel } from 'discord.js';

const noop = () => {};

export default class Song {
  private constructor(
    public url: string,
    public title: string,
    public thumbnail: string,
    public author: string,
    public authorAvatar: string,
  ) {}

  public createAudioResource(): Promise<AudioResource<Song>> {
    return new Promise((resolve, reject) => {
      const process = ytdl(
        this.url,
        {
          o: '-',
          q: '',
          f: 'bestaudio[ext=webm+acodec=opus+asr=48000]/bestaudio',
          r: '100K',
        },
        { stdio: ['ignore', 'pipe', 'ignore'] },
      );
      if (!process.stdout) {
        reject(new Error('No stdout'));
        return;
      }
      const stream = process.stdout;
      const onError = (error: Error) => {
        if (!process.killed) process.kill();
        stream.resume();
        reject(error);
      };
      process
        .once('spawn', () => {
          demuxProbe(stream)
            .then((probe) => resolve(createAudioResource(probe.stream, { metadata: this, inputType: probe.type })))
            .catch(onError);
        })
        .catch(onError);
    });
  }

  public static async search(query: string): Promise<Song> {
    const search = await yts(query);
    const url = search.videos[0].url;
    const info = await getInfo(url);

    return new Song(
      url,
      info.videoDetails.title,
      info.videoDetails.thumbnails[0].url,
      info.videoDetails.author.name,
      info.videoDetails.author.thumbnails[0].url,
    );
  }

  public static async from(url: string): Promise<Song> {
    const info = await getInfo(url);

    return new Song(
      url,
      info.videoDetails.title,
      info.videoDetails.thumbnails[0].url,
      info.videoDetails.author.name,
      info.videoDetails.author.thumbnails[0].url,
    );
  }
}

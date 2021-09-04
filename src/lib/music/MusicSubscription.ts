import { promisify } from 'util';
import {
  AudioPlayer, AudioPlayerStatus, AudioResource,
  createAudioPlayer, entersState,
  VoiceConnection,
  VoiceConnectionDisconnectReason,
  VoiceConnectionStatus,
} from '@discordjs/voice';
import Song from './Song';
import { TextBasedChannels } from 'discord.js';

const wait = promisify(setTimeout);

export default class MusicSubscription {
  public readonly voiceConnection: VoiceConnection;

  public readonly audioPlayer: AudioPlayer;

  public queue: Song[];

  public queueLock = false;

  public readyLock = false;

  public skipped = false;

  public resumed = false;

  public stopped = false;

  public textChannel: TextBasedChannels;

  public constructor(voiceConnection: VoiceConnection, textChannel: TextBasedChannels) {
    this.voiceConnection = voiceConnection;
    this.audioPlayer = createAudioPlayer();
    this.queue = [];
    this.textChannel = textChannel;

    this.voiceConnection.on('stateChange', async (_, newState) => {
      if (newState.status === VoiceConnectionStatus.Disconnected) {
        if (newState.reason === VoiceConnectionDisconnectReason.WebSocketClose && newState.closeCode === 4014) {
          try {
            await entersState(this.voiceConnection, VoiceConnectionStatus.Connecting, 5_000);
          } catch {
            this.voiceConnection.destroy();
          }
        } else if (this.voiceConnection.rejoinAttempts < 5) {
          await wait((this.voiceConnection.rejoinAttempts + 1) * 5_000);
          this.voiceConnection.rejoin();
        } else {
          this.voiceConnection.destroy();
        }
      } else if (newState.status === VoiceConnectionStatus.Destroyed) {
        this.stop();
      } else if (
        !this.readyLock &&
        (newState.status === VoiceConnectionStatus.Connecting || newState.status === VoiceConnectionStatus.Signalling)
      ) {
        this.readyLock = true;
        try {
          await entersState(this.voiceConnection, VoiceConnectionStatus.Ready, 20_000);
        } catch {
          if (this.voiceConnection.state.status !== VoiceConnectionStatus.Destroyed) this.voiceConnection.destroy();
        } finally {
          this.readyLock = false;
        }
      }
    });

    this.audioPlayer.on('stateChange', async (oldState, newState) => {
      if (newState.status === AudioPlayerStatus.Idle && oldState.status !== AudioPlayerStatus.Idle) {
        if (this.skipped) {
          await this.textChannel.send(`Ik heb dit nummer overgeslagen: **${(oldState.resource as AudioResource<Song>).metadata.title}**`);
          this.skipped = false;
        }
        if (this.queue.length === 0 && !this.stopped) await this.textChannel.send('Ik heb niets om te spelen, de wachtrij is leeg');
        this.stopped = false;
        void await this.processQueue();
      } else if (newState.status === AudioPlayerStatus.Playing) {
        if (this.resumed) {
          await this.textChannel.send(`Ik heb het huidige nummer hervat: **${(newState.resource as AudioResource<Song>).metadata.title}**`);
          this.resumed = false;
        } else {
          await this.textChannel.send(`Nu aan het spelen: **${(newState.resource as AudioResource<Song>).metadata.title}**`);
        }
      }
    });

    this.audioPlayer.on('error', async (error) => {
      await this.textChannel.send(`Error: ${error.message}`);
    });

    voiceConnection.subscribe(this.audioPlayer);
  }

  public enqueue(track: Song): void {
    this.queue.push(track);
    void this.processQueue();
  }

  public stop(): void {
    this.queueLock = true;
    this.queue = [];
    this.audioPlayer.stop(true);
  }

  public skip(): void {
    this.skipped = true;
    this.audioPlayer.stop();
  }

  public resume(): void {
    this.resumed = true;
    this.audioPlayer.unpause();
  }

  private async processQueue(): Promise<void> {
    if (this.queueLock || this.audioPlayer.state.status !== AudioPlayerStatus.Idle || this.queue.length === 0) {
      return;
    }

    this.queueLock = true;

    const nextTrack = this.queue.shift();
    try {
      const resource = await nextTrack.createAudioResource();
      this.audioPlayer.play(resource);
      this.queueLock = false;
    } catch (error) {
      // eslint-disable-next-line @typescript-eslint/restrict-template-expressions,@typescript-eslint/no-unsafe-member-access
      await this.textChannel.send(`Error: ${error.message}`);
      this.queueLock = false;
      return this.processQueue();
    }
  }
}

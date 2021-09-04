import { AkairoClient, CommandHandler, ListenerHandler } from 'discord-akairo';
import { Intents, Message, Snowflake } from 'discord.js';
import { join } from 'path';
import { Connection } from 'typeorm';
import {
  prefix, owners, dbName, debug,
} from '../Config';
import Database from '../structures/Database';
import migrate from '../migration/Migration';
import MusicSubscription from '../lib/music/MusicSubscription';

declare module 'discord-akairo' {
  interface AkairoClient {
    commandHandler: CommandHandler;
    listenerHandler: ListenerHandler;
    db: Connection;
    subscriptions: Map<Snowflake, MusicSubscription>;
  }
}

interface BotOptions {
  token?: string;
  owners?: string | string[]
}

export default class BotClient extends AkairoClient {
  public config: BotOptions;

  public db!: Connection;

  public subscriptions!: Map<Snowflake, MusicSubscription>;

  public listenerHandler: ListenerHandler = new ListenerHandler(this, {
    directory: join(__dirname, '..', 'listeners'),
  });

  public commandHandler: CommandHandler = new CommandHandler(this, {
    directory: join(__dirname, '..', 'commands'),
    prefix,
    allowMention: true,
    handleEdits: true,
    commandUtil: true,
    commandUtilLifetime: 3e5,
    defaultCooldown: 6e4,
    argumentDefaults: {
      prompt: {
        modifyStart: (_: Message, str: string): string => `${str}\n\nTyp \`stop\` om het commando te annuleren...`,
        modifyRetry: (_: Message, str: string): string => `${str}\n\nTyp \`stop\` om het commando te annuleren...`,
        cancelWord: 'stop',
        timeout: 'Dat duurde te lang, het commando is geannuleerd...',
        ended: 'U heeft het maximale aantal pogingen overschreden, het commando is geannuleerd',
        cancel: 'Het commando is geannuleerd',
        retries: 3,
        time: 3e4,
      },
      otherwise: '',
    },
    ignorePermissions: owners,
  });

  public constructor(config: BotOptions) {
    super({
      ownerID: config.owners,
      intents: [
        'GUILDS',
        'GUILD_MEMBERS',
        'GUILD_BANS',
        'GUILD_EMOJIS_AND_STICKERS',
        'GUILD_INTEGRATIONS',
        'GUILD_WEBHOOKS',
        'GUILD_INVITES',
        'GUILD_VOICE_STATES',
        'GUILD_PRESENCES',
        'GUILD_MESSAGES',
        'GUILD_MESSAGE_REACTIONS',
        'GUILD_MESSAGE_TYPING',
        'DIRECT_MESSAGES',
        'DIRECT_MESSAGE_REACTIONS',
        'DIRECT_MESSAGE_TYPING',
      ],
    });

    this.config = config;
  }

  private async init(): Promise<void> {
    this.commandHandler.useListenerHandler(this.listenerHandler);
    this.listenerHandler.setEmitters({
      commandHandler: this.commandHandler,
      listenerHandler: this.listenerHandler,
      process,
    });

    this.commandHandler.loadAll();
    this.listenerHandler.loadAll();

    this.db = Database.get(dbName);
    await this.db.connect();
    await this.db.synchronize();
    if (!debug) await migrate(this.db);

    this.subscriptions = new Map<Snowflake, MusicSubscription>();
  }

  public async start(): Promise<string> {
    await this.init();
    return this.login(this.config.token);
  }
}

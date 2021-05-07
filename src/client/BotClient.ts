import { AkairoClient, CommandHandler, ListenerHandler } from 'discord-akairo';
import { Message } from 'discord.js';
import { join } from 'path';
import { Connection } from 'typeorm';
import { prefix, owners, dbName } from '../Config';
import Database from '../structures/Database';

declare module 'discord-akairo' {
  interface AkairoClient {
    commandHandler: CommandHandler;
    listenerHandler: ListenerHandler;
    db: Connection;
  }
}

interface BotOptions {
  token?: string;
  owners?: string | string[]
}

export default class BotClient extends AkairoClient {
  public config: BotOptions;

  public db!: Connection;

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
  }

  public async start(): Promise<string> {
    await this.init();
    return this.login(this.config.token);
  }
}

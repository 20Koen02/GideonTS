import { Listener } from 'discord-akairo';
import { owners } from '../../Config';

export default class ReadyListener extends Listener {
  public constructor() {
    super('ready', {
      emitter: 'client',
      event: 'ready',
      category: 'client',
    });
  }

  public async exec(): Promise<void> {
    console.log(`${this.client.user.tag} is now online and ready!`);

    const ownerUsername = await this.client.users.fetch(owners[0])
    this.client.user.setPresence({ activity: {name: `${ownerUsername.username || "Koen02"}#${ownerUsername.discriminator || "2933"}` } })
  }
}

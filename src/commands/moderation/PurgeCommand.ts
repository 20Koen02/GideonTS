import { Argument, Command } from 'discord-akairo';
import {
  GuildMember, Message,
} from 'discord.js';
import assert from 'assert';

export default class PurgeCommand extends Command {
  public constructor() {
    super('purge', {
      aliases: ['purge'],
      channel: 'guild',
      category: 'Moderation Commands',
      description: {
        content: 'Purge berichten van een channel',
        usage: 'purge',
        examples: [
          'purge',
        ],
      },
      ratelimit: 3,
      userPermissions: ['MANAGE_MESSAGES'],
      args: [
        {
          id: 'amount',
          type: Argument.validate('integer', (msg, p, integer) => integer > 0 && integer <= 100),
          prompt: {
            start: (msg: Message) => `${msg.author}, je moet het aantal berichten opgeven (tussen 1 en 100)`,
          },
        },
        {
          id: 'member',
          type: 'member',
          default: null,
          prompt: {
            retry: (msg: Message) => `${msg.author}, je moet een juiste gebruiker opgeven`,
            optional: true,
          },
        },
      ],
    });
  }

  public async exec(message: Message,
    { amount, member }: { amount: number, member: GuildMember }): Promise<void> {
    message.channel.messages.fetch({
      limit: amount + 1,
    }).then((messages) => {
      if (member) messages = messages.filter((m) => m.author.id === member.user.id);
      assert(message.channel.type === 'text');
      message.channel.bulkDelete(messages).catch((error) => console.log(error.stack));
    });
  }
}

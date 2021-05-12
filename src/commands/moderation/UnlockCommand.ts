import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import assert from 'assert';
import { lockdownRoles, lockdownWhitelistRoles, primaryColor } from '../../Config';

export default class UnlockCommand extends Command {
  public constructor() {
    super('unlock', {
      aliases: ['unlock', 'ontgrendel'],
      channel: 'guild',
      category: 'Moderation Commands',
      description: {
        content: 'Unlock een channel',
        usage: 'unlock',
        examples: [
          'unlock',
        ],
      },
      ratelimit: 3,
      userPermissions: ['MANAGE_MESSAGES'],
    });
  }

  public async exec(message: Message): Promise<Message> {
    assert(message.channel.type === 'text');
    const msg = await message.util.send(`Weet je zeker dat je ${message.channel.name} wilt ontgrendelen? J/N`);
    const responses = await msg.channel.awaitMessages(
      (r: Message) => r.author!.id === message.author!.id, { max: 1, time: 30000 },
    );
    if (!responses || responses.size < 1) return message.util!.send('Verzoek verlopen');
    const response = responses.first();

    if (!(response!.content.toLowerCase() === 'y'
      || response!.content.toLowerCase() === 'yes'
      || response!.content.toLowerCase() === 'j'
      || response!.content.toLowerCase() === 'ja')) {
      return message.util!.send('De ontgrendeling is geannuleerd');
    }

    response.delete();

    lockdownRoles.forEach((roleId) => {
      assert(message.channel.type === 'text');
      message.channel.updateOverwrite(roleId, {
        SEND_MESSAGES: null,
      });
    });

    lockdownWhitelistRoles.forEach((roleId) => {
      assert(message.channel.type === 'text');
      message.channel.updateOverwrite(roleId, {
        SEND_MESSAGES: null,
      });
    });

    return message.util!.send(new MessageEmbed()
      .setAuthor(`${message.author.username} heeft dit kanaal ontgrendeld 🔓`, message.author.displayAvatarURL())
      .setDescription('Dit kanaal is ontgrendeld, je kunt nu weer praten.')
      .setColor(primaryColor));
  }
}

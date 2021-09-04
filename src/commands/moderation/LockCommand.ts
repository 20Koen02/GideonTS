import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import assert from 'assert';
import { lockdownRoles, lockdownWhitelistRoles, primaryColor } from '../../Config';

export default class LockCommand extends Command {
  public constructor() {
    super('lock', {
      aliases: ['lock', 'vergrendel'],
      channel: 'guild',
      category: 'Moderation Commands',
      description: {
        content: 'Lock een channel',
        usage: 'lock',
        examples: [
          'lock',
        ],
      },
      ratelimit: 3,
      userPermissions: ['MANAGE_MESSAGES'],
    });
  }

  public async exec(message: Message): Promise<Message> {
    assert(message.channel.type === 'GUILD_TEXT');
    const msg = await message.util.send(`Weet je zeker dat je ${message.channel.name} wilt vergrendelen? J/N`);
    const filter = r => r.author!.id === message.author!.id;
    const responses = await msg.channel.awaitMessages(
      { filter, max: 1, time: 30000 },
    );
    if (!responses || responses.size < 1) return message.util!.send('Verzoek verlopen');
    const response = responses.first();

    if (!(response!.content.toLowerCase() === 'y'
      || response!.content.toLowerCase() === 'yes'
      || response!.content.toLowerCase() === 'j'
      || response!.content.toLowerCase() === 'ja')) {
      return message.util!.send('De vergrendeling is geannuleerd');
    }

    response.delete();

    lockdownRoles.forEach((roleId) => {
      assert(message.channel.type === 'GUILD_TEXT');
      message.channel.permissionOverwrites.edit(roleId, {
        SEND_MESSAGES: false,
      });
    });

    lockdownWhitelistRoles.forEach((roleId) => {
      assert(message.channel.type === 'GUILD_TEXT');
      message.channel.permissionOverwrites.edit(roleId, {
        SEND_MESSAGES: true,
      });
    });

    return message.util!.send({
      embeds: [new MessageEmbed()
        .setAuthor(`${message.author.username} heeft dit kanaal vergrendeld 🔒`, message.author.displayAvatarURL())
        .setDescription('Dit kanaal is vergrendeld, je weer kunt praten als de vergrendeling voorbij is.')
        .setColor(primaryColor)],
    });
  }
}

import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { stripIndents } from 'common-tags';
import { primaryColor } from '../../Config';

export default class HelpCommand extends Command {
  public constructor() {
    super('help', {
      aliases: ['help', 'commands', 'cmds'],
      category: 'Public Commands',
      description: {
        content: 'Bekijk alle commando\'s of krijg hulp bij een enkele commando',
        usage: 'help [command]',
        examples: [
          'help',
          'help ping',
        ],
      },
      ratelimit: 3,
      args: [
        {
          id: 'command',
          type: 'commandAlias',
          default: null,
        },
      ],
    });
  }

  public exec(message: Message, { command }: {command: Command}): Promise<Message> {
    let embed: MessageEmbed;

    if (command) {
      embed = new MessageEmbed()
        .setAuthor(`Help | ${command}`, this.client.user.displayAvatarURL())
        .setColor(primaryColor)
        .setDescription(stripIndents`
          **Beschrijving:**
          ${command.description.content || 'Geen beschrijving voorzien'}
          
          **Gebruik**
          ${command.description.usage || 'Geen gebruik voorzien'}
          
          **Voorbeelden**
          ${command.description.examples ? command.description.examples.map((e) => `\`${this.client.commandHandler.prefix}${e}\``).join('\n') : 'Geen voorbeelden voorzien'}
          `);
    } else {
      embed = new MessageEmbed()
        .setAuthor(`Help | ${this.client.user.username}`, this.client.user.displayAvatarURL())
        .setColor(primaryColor)
        .setFooter(`${this.client.commandHandler.prefix}help [command] voor meer informatie over een commando`);

      for (const category of this.handler.categories.values()) {
        if (!['default'].includes(category.id)) {
          embed.addField(category.id, category
            .filter((cmd) => cmd.aliases.length > 0)
            .map((cmd) => `**\`${cmd}\`**`)
            .join(', ') || 'Geen commando\'s in deze categorie');
        }
      }
    }

    return message.channel.send(embed);
  }
}

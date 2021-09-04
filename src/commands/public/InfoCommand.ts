import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { stripIndents } from 'common-tags';
import { primaryColor } from '../../Config';

const strftime = require('strftime');

export default class InfoCommand extends Command {
  public constructor() {
    super('info', {
      aliases: ['info'],
      channel: 'guild',
      category: 'Public Commands',
      description: {
        content: 'Informatie over jou en de server',
        usage: 'info',
        examples: [
          'info',
        ],
      },
      ratelimit: 3,
    });
  }

  public async exec(message: Message): Promise<Message> {
    const user = message.author;
    const member = await message.guild.members.fetch(user);

    const millisCreated = new Date().getTime() - user.createdAt.getTime();
    const daysCreated = millisCreated / 1000 / 60 / 60 / 24;

    const millisJoined = new Date().getTime() - member.joinedAt.getTime();
    const daysJoined = millisJoined / 1000 / 60 / 60 / 24;

    const embed = new MessageEmbed()
      .setTitle(' • Alle Informatie')

      .setColor(primaryColor)
      .setThumbnail('attachment://avatar.png')
      .addField('Over de Server', stripIndents`
        • **Naam: **${message.guild.name}
        • **Tekstkanalen: **${message.guild.channels.cache.filter((ch) => ch.type === 'GUILD_TEXT').size}
        • **Voicekanalen: **${message.guild.channels.cache.filter((ch) => ch.type === 'GUILD_VOICE').size}
        • **Gebruikers: **${message.guild.memberCount}
        • **Owner: **${(await message.guild.fetchOwner()).user.tag}
        • **Roles: **${message.guild.roles.cache.sort((a, b) => a.position - b.position).map((role) => role.toString()).slice(1).reverse()
    .join(', ')}
        • **Gemaakt Op:** ${strftime('%d-%m-%Y', message.guild.createdAt)}
      `)
      .addField('Over Jou', stripIndents`
      • **Volledige Naam:** ${user.tag}
      • **Status:** ${member.presence.status[0].toUpperCase() + member.presence.status.slice(1)}
      • **Gemaakt Op:** ${strftime('%d-%m-%Y', user.createdAt)}
      • **Dagen Sinds Gemaakt:** ${daysCreated.toFixed(0)}
      • **Server Gejoined Op:** ${strftime('%d-%m-%Y', member.joinedAt)}
      • **Dagen Sinds Server Gejoined:** ${daysJoined.toFixed(0)}
      • **Jouw Roles:** ${member.roles.cache.sort((a, b) => a.position - b.position).map((role) => role.toString()).slice(1).reverse()
    .join(', ')}
      `);
    return message.util.send({ embeds: [embed] });
  }
}

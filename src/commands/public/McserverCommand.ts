import { Command } from 'discord-akairo';
import { EmbedFieldData, Message, MessageAttachment, MessageEmbed, Util } from 'discord.js';
import { debug, gideonDevId, gideonId, primaryColor } from '../../Config';
import { status } from 'minecraft-server-util';

export default class McserverCommand extends Command {
  public constructor() {
    super('mcserver', {
      aliases: ['mcserver'],
      channel: 'guild',
      category: 'Public Commands',
      description: {
        content: 'Minecraft Server Status',
        usage: 'mcserver [ip]',
        examples: [
          'mcserver us.mineplex.com',
        ],
      },
      ratelimit: 3,
      args: [
        {
          id: 'ip',
          match: 'rest',
          type: 'string',
          prompt: {
            start: (msg: Message) => `${msg.author.toString()}, welk server IP?`,
          },
        },
      ],
    });
  }

  // eslint-disable-next-line consistent-return
  public async exec(message: Message, { ip }: { ip: string }): Promise<Message> {
    let port = 25565;
    if (ip.includes(':')) {
      const addr = ip.split(':');
      ip = addr[0];
      port = +addr[1];
    }

    try {
      const options = {
        timeout: 1000 * 5,
        enableSRV: true
      };
      const response = await status(ip, port, options);

      const base64Image = response.favicon.split(';base64,').pop();
      const faviconBuffer = Buffer.from(base64Image, 'base64');
      const faviconAttachment = new MessageAttachment(faviconBuffer, `favicon-${response.host}.png`);
      const imageMessage = await message.util.sendNew({ files: [faviconAttachment] });
      imageMessage.delete();
      const imageUrl = Array.from(imageMessage.attachments)[0][1].url;

      const cleanDescription = Util.escapeMarkdown(response.description.descriptionText.replace(/(§\w)/g, ''));
      const cleanVersion = Util.escapeMarkdown(response.version.replace(/(§\w)/g, ''));

      const embed = new MessageEmbed()
        .setColor(primaryColor)
        .setTitle('Minecraft Server Status')
        .setThumbnail(imageUrl)
        .addFields(
          { name: 'Server IP', value: response.host, inline: true },
          { name: 'Players', value: `${String(response.onlinePlayers)} / ${String(response.maxPlayers)}`, inline: true },
          { name: 'Version', value: cleanVersion, inline: true },
          { name: 'Description', value: cleanDescription },
        );
      return await message.util.send({ embeds: [embed] });
    } catch (e) {
      const embed = new MessageEmbed()
        .setColor(primaryColor)
        .setDescription(':x: Ik kan niet verbinden met de minecraft server!');
      return message.util.send({ embeds: [embed] });
    }
  }
}

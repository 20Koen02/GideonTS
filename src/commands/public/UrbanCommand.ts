import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { primaryColor } from '../../Config';

const urban = require('urban');

interface IUrbanResponse {
  definition: string,
  permalink: string,
  thumbs_up: number,
  sound_urls: string[],
  author: string,
  word: string,
  defid: number,
  current_vote: string,
  written_on: string,
  example: string,
  thumbs_down: number
}

export default class UrbanCommand extends Command {
  public constructor() {
    super('urban', {
      aliases: ['urban'],
      category: 'Public Commands',
      description: {
        content: 'Urban Dictionary top result',
        usage: 'urban',
        examples: [
          'urban boomer',
        ],
      },
      ratelimit: 3,
      args: [
        {
          id: 'query',
          match: 'rest',
          type: 'string',
          prompt: {
            start: (msg: Message) => `${msg.author}, wat zou je willen opzoeken?`,
          },
        },
      ],
    });
  }

  private static capitalize(str) {
    return str.substr(0, 1).toUpperCase() + str.substr(1);
  }

  // eslint-disable-next-line consistent-return
  public async exec(message: Message, { query }: { query: string }): Promise<Message> {
    try {
      urban(query).first((def: IUrbanResponse) => {
        if (def.example) {
          const embed = new MessageEmbed()
            .setColor(primaryColor)
            .addField(`Definitie van: *${UrbanCommand.capitalize(def.word)}*`, `${UrbanCommand.capitalize(def.definition)}`)
            .addField('Voorbeeld', `*${UrbanCommand.capitalize(def.example)}*`);
          return message.util.send(embed);
        }
        const embed = new MessageEmbed()
          .setColor(primaryColor)
          .addField(`Definitie van: *${UrbanCommand.capitalize(def.word)}*`, `${UrbanCommand.capitalize(def.definition)}`);
        return message.util.send(embed);
      });
    } catch (err) {
      const embed = new MessageEmbed()
        .setColor(primaryColor)
        .setDescription(':x: Ik kan dat woord niet vinden!');
      return message.util.send(embed);
    }
  }
}

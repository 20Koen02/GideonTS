import { Command } from 'discord-akairo';
import { Message, MessageEmbed } from 'discord.js';
import { primaryColor } from '../../Config';

export default class BallCommand extends Command {
  public constructor() {
    super('8ball', {
      aliases: ['8ball'],
      channel: 'guild',
      category: 'Public Commands',
      description: {
        content: 'Ik zal al je vragen eerlijk beantwoorden',
        usage: '8ball [vraag]',
        examples: [
          '8ball Is dit een goede bot?',
        ],
      },
      ratelimit: 3,
      args: [
        {
          id: 'vraag',
          type: 'string',
          default: null,
        },
      ],
    });
  }

  private static do8ball() {
    const fortunes: string[] = [
      ':8ball: **⇾** :white_check_mark: **Het is zeker**',
      ':8ball: **⇾** :white_check_mark: **Het is zo beslist**',
      ':8ball: **⇾** :white_check_mark: **Zonder twijfel**',
      ':8ball: **⇾** :white_check_mark: **Zeker weten**',
      ':8ball: **⇾** :white_check_mark: **Je kunt erop vertrouwen**',
      ':8ball: **⇾** :white_check_mark: **Volgens mij wel**',
      ':8ball: **⇾** :white_check_mark: **Zeer waarschijnlijk**',
      ':8ball: **⇾** :white_check_mark: **Goed vooruitzicht**',
      ':8ball: **⇾** :white_check_mark: **Ja**',
      ':8ball: **⇾** :white_check_mark: **De wijzer wijst naar ja**',
      ':8ball: **⇾** :question: **Reactie is wazig, probeer opnieuw**',
      ':8ball: **⇾** :question: **Vraag later opnieuw**',
      ':8ball: **⇾** :question: **Het is beter het je nu niet te zeggen**',
      ':8ball: **⇾** :question: **Niet te voorspellen**',
      ':8ball: **⇾** :question: **Concentreer en vraag opnieuw**',
      ':8ball: **⇾** :x: **Reken er niet op**',
      ':8ball: **⇾** :x: **Mijn antwoord is nee**',
      ':8ball: **⇾** :x: **Mijn bronnen zeggen nee**',
      ':8ball: **⇾** :x: **Vooruitzicht is niet zo goed**',
      ':8ball: **⇾** :x: **Zeer twijfelachtig**',
    ];
    return fortunes[Math.floor(Math.random() * fortunes.length)];
  }

  public exec(message: Message): Promise<Message> {
    return message.util.send(new MessageEmbed()
      .setColor(primaryColor)
      .setDescription(BallCommand.do8ball()));
  }
}

import { Argument, Command } from 'discord-akairo';
import { Message, MessageAttachment } from 'discord.js';
import { Repository } from 'typeorm';
import * as Canvas from 'canvas';
import path from 'path';
import { registerFont } from 'canvas';
import CardsModel from '../../models/CardsModel';

export default class CardCommand extends Command {
  public constructor() {
    super('card', {
      aliases: ['card'],
      channel: 'guild',
      category: 'Public Commands',
      description: {
        content: 'Random Cards Against Humanity card',
        usage: 'card [color]',
        examples: [
          'card w',
          'card b',
        ],
      },
      ratelimit: 3,
      args: [
        {
          id: 'color',
          type: Argument.validate('string', (msg, p, str) => ['z', 'zwart', 'b', 'black', 'w', 'white', 'wit'].includes(str.toLowerCase())),
          prompt: {
            start: (msg: Message) => `${msg.author}, wil je een zwarte of witte kaart? (z/w)`,
            retry: (msg: Message) => `${msg.author}, wil je een zwarte of witte kaart? (z/w)`,
          },
        },
      ],
    });
  }

  private static addSlashes(text: string) {
    return text.replace(/([^\\]|^|\*|_|`|~)(\*|_|`|~)/g, '$1\\$2');
  }

  // eslint-disable-next-line consistent-return
  public async exec(message: Message, { color }: { color: string }): Promise<Message> {
    const cardRepo: Repository<CardsModel> = this.client.db.getRepository(CardsModel);

    let isWhite = false;
    if (['w', 'white', 'wit'].includes(color.toLowerCase())) isWhite = true;
    const colorStr = isWhite ? 'white' : 'black';
    const invColorStr = isWhite ? 'black' : 'white';

    const randCard: CardsModel = await cardRepo
      .createQueryBuilder('card')
      .orderBy('RANDOM()')
      .where('card.white = :white', { white: isWhite })
      .limit(1)
      .getOne();

    registerFont('src/assets/cards/Inter-Bold.otf', { family: 'Inter Bold' });
    const canvas = Canvas.createCanvas(315, 440);
    const ctx = canvas.getContext('2d');

    this.roundRect(0, 0, canvas.width, canvas.height, 15, colorStr, ctx);

    const cahLogo = await Canvas.loadImage(path.resolve(__dirname, `../../assets/cards/${colorStr}_logo.jpg`));
    const cahLogoSize = 40;
    ctx.drawImage(cahLogo, 25, canvas.height - cahLogoSize - 15, cahLogoSize, cahLogoSize);

    ctx.font = '10px Inter Bold';
    ctx.fillStyle = invColorStr;
    ctx.fillText('Cards Against Humanity', 68, canvas.height - 30);

    const textMargin = 30;
    ctx.font = '24px Inter Bold';

    const cardText = randCard.text.replace(/_/g, '_____');
    this.wrapText(ctx, cardText, textMargin, textMargin + 22,
      canvas.width - (textMargin * 2), 34);

    const attachment = new MessageAttachment(canvas.toBuffer(), `card-${randCard.id}.png`);
    return message.util.send(attachment);
  }

  roundRect(x0, y0, x1, y1, r, color, ctx) {
    let rad = r;
    const w = x1 - x0;
    const h = y1 - y0;
    if (r > w / 2) rad = w / 2;
    if (r > h / 2) rad = h / 2;
    ctx.beginPath();
    ctx.moveTo(x1 - rad, y0);
    ctx.quadraticCurveTo(x1, y0, x1, y0 + rad);
    ctx.lineTo(x1, y1 - rad);
    ctx.quadraticCurveTo(x1, y1, x1 - rad, y1);
    ctx.lineTo(x0 + rad, y1);
    ctx.quadraticCurveTo(x0, y1, x0, y1 - rad);
    ctx.lineTo(x0, y0 + rad);
    ctx.quadraticCurveTo(x0, y0, x0 + rad, y0);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
  }

  wrapText(context, text, x, y, line_width, line_height) {
    let dy = y;
    let line = '';
    const paragraphs = text.split('\n');
    for (let i = 0; i < paragraphs.length; i += 1) {
      const words = paragraphs[i].split(' ');
      for (let n = 0; n < words.length; n += 1) {
        const testLine = `${line + words[n]} `;
        const metrics = context.measureText(testLine);
        const testWidth = metrics.width;
        if (testWidth > line_width && n > 0) {
          context.fillText(line, x, dy);
          line = `${words[n]} `;
          dy += line_height;
        } else {
          line = testLine;
        }
      }
      context.fillText(line, x, dy);
      dy += line_height;
      line = '';
    }
  }
}

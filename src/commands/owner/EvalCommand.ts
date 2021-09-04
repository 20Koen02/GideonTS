import { Command } from 'discord-akairo';
import { Message, Util } from 'discord.js';
import * as util from 'util';
import { stripIndents } from 'common-tags';
import axios from 'axios';

const NL = '!!NL!!';
const NL_PATTERN = new RegExp(NL, 'g');

export default class EvalCommand extends Command {
  public hrStart: [number, number] | undefined;

  public lastResult: any = null;

  private readonly _sensitivePattern!: any;

  public constructor() {
    super('eval', {
      aliases: ['eval', 'ev'],
      description: {
        content: 'Evaluate Javascript',
        usage: 'eval',
        examples: [
          'eval [javascript]',
        ],
      },
      ownerOnly: true,
      ratelimit: 3,
      args: [
        {
          id: 'code',
          type: 'string',
          match: 'rest',
          prompt: {
            start: (msg: Message) => `${msg.author.toString()}, wat zou je willen evalueren?`,
          },
        },
        {
          id: 'silent',
          type: 'boolean',
          match: 'flag',
          flag: ['--silent', '-s'],
        },
        {
          id: 'del',
          type: 'boolean',
          match: 'flag',
          flag: ['--delete', '-d'],
        },
        {
          id: 'bin',
          type: 'boolean',
          match: 'flag',
          flag: ['--bin', '-b'],
        },
      ],
    });
  }

  public async exec(message: Message,
    {
      code, silent, del, bin,
    }: { code: string, silent: boolean, del: boolean, bin:boolean }) {
    let hrDiff;
    try {
      const hrStart = process.hrtime();
      // eslint-disable-next-line no-eval
      this.lastResult = await eval(code);
      hrDiff = process.hrtime(hrStart);
    } catch (error) {
      return message.util.send(`Error while evaluating: \`${error}\``);
    }

    this.hrStart = process.hrtime();

    if (del) await message.delete();
    if (silent) return true;

    if (bin) return message.util.send(await this.hastebin(this.lastResult));

    const result = this.result(this.lastResult, hrDiff, code);
    if (Array.isArray(result)) {
      return result.map(async (res): Promise<Message | Message[]> => message.util.send(res));
    }
    return message.util.send(result);
  }

  private async hastebin(evalResult: string): Promise<string> {
    const key = await axios.post('https://bin.koen02.nl/documents', this.sanitizeToken(evalResult), { responseType: 'json' })
      .then((response) => response.data.key);
    return `https://bin.koen02.nl/${key}.js`;
  }

  private result(result: any, hrDiff: [number, number],
    input: string | null = null): string | string[] {
    const inspected = this.sanitizeToken(result);
    const split = inspected.split('\n');
    const last = inspected.length - 1;
    const prependPart = inspected[0] !== '{' && inspected[0] !== '[' && inspected[0] !== '\'' ? split[0] : inspected[0];
    const appendPart = inspected[last] !== '}' && inspected[last] !== ']' && inspected[last] !== '\'' ? split[split.length - 1] : inspected[last];
    const prepend = `\`\`\`javascript\n${prependPart}\n`;
    const append = `\n${appendPart}\n\`\`\``;
    if (input) {
      return Util.splitMessage(stripIndents`
        *Executed in **${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.***
        \`\`\`javascript
        ${inspected}
        \`\`\`
        `, { maxLength: 1900, prepend, append });
    }

    return Util.splitMessage(stripIndents`
            *Callback executed after **${hrDiff[0] > 0 ? `${hrDiff[0]}s ` : ''}${hrDiff[1] / 1000000}ms.***
            \`\`\`javascript
            ${inspected}
            \`\`\`
        `, { maxLength: 1900, prepend, append });
  }

  private get sensitivePattern(): any {
    if (!this._sensitivePattern) {
      const token = this.client.token.split('').join('[^]{0,2}');
      const revToken = this.client.token.split('').reverse().join('[^]{0,2}');
      Object.defineProperty(this, '_sensitivePattern', { value: new RegExp(`${token}|${revToken}`, 'g') });
    }
    return this._sensitivePattern;
  }

  private sanitizeToken(evilCode: string): string {
    return util.inspect(evilCode, { depth: 0 })
      .replace(NL_PATTERN, '\n')
      .replace(this.sensitivePattern, '--REDACTED--');
  }
}

import { Application } from 'express';
import { Repository } from 'typeorm';
import { AllowedImageFormat } from 'discord.js';
import ScoresModel from '../models/ScoresModel';
// eslint-disable-next-line import/no-cycle
import { botClient } from '../Bot';

interface ScoresResponse extends ScoresModel {
  username?: string;
  discriminator?: string;
  avatar?: string;
  displayColor?: string;
  status?: 'online' | 'idle' | 'dnd';
}

const supportedAvatarFormats = [
  'png', 'jpeg', 'jpg', 'webp', 'gif',
];

export default class RestClient {
  public app: Application;

  constructor(app: Application, middleWares: any) {
    this.app = app;
    this.registerMiddlewares(middleWares);
    this.registerRoute();
  }

  public registerRoute() {
    this.app.get('/v1/:guild', async (req, res) => {
      const imageFormatQuery = req.query.format;
      let imageFormat = 'webp';
      if (imageFormatQuery
        && supportedAvatarFormats.includes(imageFormatQuery.toString().toLowerCase())) {
        imageFormat = imageFormatQuery.toString().toLowerCase();
      }

      const scoresRepo: Repository<ScoresModel> = botClient.db.getRepository(ScoresModel);
      let scores: ScoresResponse[] = await scoresRepo.find(({
        select: ['user', 'exp', 'level', 'total_exp'],
        where: { guild: req.params.guild },
      }));

      try {
        const discordGuild = await botClient.guilds.fetch(req.params.guild);

        scores = await Promise.all(scores.map(async (score) => {
          const discordUser = await botClient.users.fetch(score.user);
          const discordGuildMember = await discordGuild.members.fetch(discordUser.id);
          return {
            ...score,
            username: discordUser.username,
            avatar: discordUser.displayAvatarURL({ format: imageFormat as AllowedImageFormat }),
            discriminator: discordUser.discriminator,
            displayColor: discordGuildMember.displayHexColor,
            status: discordUser.presence.status,
          } as ScoresResponse;
        }));

        const responseObject = {
          guildInfo: {
            name: discordGuild.name,
            icon: discordGuild.iconURL(),
          },
          scores,
        };

        res.send(JSON.stringify(responseObject));
      } catch (error) {
        return res.status(404).send('Guild not found');
      }
    });
  }

  private registerMiddlewares(middleWares: {
    forEach: (arg0: (middleWare: any) => void) => void;
  }) {
    middleWares.forEach((middleWare) => {
      this.app.use(middleWare);
    });
  }
}

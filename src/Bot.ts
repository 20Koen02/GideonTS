import 'dotenv/config';
import cors from 'cors';
import * as bodyParser from 'body-parser';
import helmet from 'helmet';
import {
  token, owners, clientPort, corsOptions,
} from './Config';
import BotClient from './client/BotClient';
import compression from 'compression';
import { RestClient } from './client/RestClient';

// Create bot client
const botClient: BotClient = new BotClient({ token, owners });

// Create rest client; using expressjs server
const restClient: RestClient = new RestClient(
  [
    bodyParser.json(),
    bodyParser.urlencoded({ extended: true }),
    cors(corsOptions),
    helmet(),
    compression(),
  ],
);

// First start the bot
void botClient.start().then(() => {
  // Then start the web server
  restClient.listen(clientPort);
});

export { botClient, restClient };

import 'dotenv/config';
import cors from 'cors';
import * as bodyParser from 'body-parser';
import helmet from 'helmet';
import compression from 'compression';
import {
  token, owners, clientPort, corsOptions,
} from './Config';
import BotClient from './client/BotClient';
// eslint-disable-next-line import/no-cycle
import RestClient from './client/RestClient';
import SocketClient from './client/SocketClient';
import WebClient from './client/WebClient';

// Create bot client
export const botClient: BotClient = new BotClient({ token, owners });

// Create web client; this contains the web server for the rest client & socketio client
const webClient: WebClient = new WebClient();

// Create rest client; using expressjs server
const restClient: RestClient = new RestClient(
  webClient.app,
  [
    bodyParser.json(),
    bodyParser.urlencoded({ extended: true }),
    cors(corsOptions),
    helmet(),
    compression(),
  ],
);

// Create socket client; using http server
const socketClient: SocketClient = new SocketClient(
  webClient.server,
  corsOptions,
);

// First start the bot
botClient.start().then(() => {
  // Then start the web server
  webClient.listen(clientPort);
});

export default { botClient };

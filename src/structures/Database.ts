import { ConnectionManager } from 'typeorm';
import { join } from 'path';
import {
  dbHost, dbName, dbPassword, dbPort, dbUser,
} from '../Config';

const connectionManager: ConnectionManager = new ConnectionManager();
connectionManager.create({
  name: dbName,
  host: dbHost,
  port: dbPort,
  type: 'postgres',
  database: dbName,
  username: dbUser,
  password: dbPassword,
  entities: [join(__dirname, '..', 'models/*{.js,.ts}')],
});

export default connectionManager;

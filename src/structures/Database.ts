import { ConnectionManager } from 'typeorm';
import { join } from 'path';
import { dbName, dbPassword, dbUser } from '../Config';

const connectionManager: ConnectionManager = new ConnectionManager();
connectionManager.create({
  name: dbName,
  type: 'postgres',
  database: dbName,
  username: dbUser,
  password: dbPassword,
  entities: [join(__dirname, '..', 'models/*{.js,.ts}')],
});

export default connectionManager;

import SocketIO from 'socket.io';
import * as http from 'http';

export default class SocketClient {
  public io: SocketIO.Server;

  public server: http.Server;

  constructor(server: http.Server, corsOptions) {
    this.server = server;
    this.io = new SocketIO.Server(this.server, {
      cors: corsOptions,
    });
    this.connectionListeners();
  }

  private connectionListeners() {
    this.io.on('connection', (socket: SocketIO.Socket) => {
      console.log(`a user connected: ${socket.id}`);

      socket.on('disconnect', () => {
        console.log(`socket disconnected: ${socket.id}`);
      });
    });
  }
}

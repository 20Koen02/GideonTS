import SocketIO from 'socket.io';
import * as http from 'http';

export default class SocketClient {
  public io: SocketIO.Server;

  public server: http.Server;

  constructor(server: http.Server) {
    this.server = server;
    this.io = new SocketIO.Server(this.server, {
      cors: {
        origin: 'http://127.0.0.1:3333',
        methods: ['GET', 'POST'],
      },
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

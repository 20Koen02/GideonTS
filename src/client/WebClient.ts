import express, { Application } from 'express';
import http from 'http';

export default class WebClient {
  // Used by rest client
  public app: Application;

  // Used by socketio client
  public server: http.Server;

  constructor() {
    this.app = express();
    this.server = new http.Server(this.app);
  }

  public listen(port: number) {
    this.server.listen(port, () => {
      console.log(`Webserver listening on port ${port}`);
    });
  }
}

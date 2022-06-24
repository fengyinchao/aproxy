import { skip } from 'rxjs';
import express from 'express';
import http from 'http';
import { WSServer } from '@aproxy/bridge';
import { Log } from './index';

export const dev = () => {
  const app = express();

  const httpserver = http.createServer({}, (req, res) => {
    app.handle(req, res);
  });

  const wsServer = new WSServer(httpserver);

  wsServer.message$.pipe(skip(1)).subscribe(msg => {
    Log('===msg', msg.data);
  });

  httpserver.listen(8888, () => {
    Log(`Secure Server is listening on port 8888`);
  });
};

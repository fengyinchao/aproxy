import { skip } from 'rxjs';
import express from 'express';
import http from 'http';
import { WSServer } from '@aproxy/bridge';

export const dev = () => {
  const app = express();

  const httpserver = http.createServer({}, (req, res) => {
    app.handle(req, res);
  });

  const wsServer = new WSServer(httpserver);

  wsServer.message$.pipe(skip(1)).subscribe(msg => {
    // console.log('===msg', msg.data);
  });

  httpserver.listen(8888, () => {
    // eslint-disable-next-line no-console
    console.log(`Secure Server is listening on port 8888`);
  });
};

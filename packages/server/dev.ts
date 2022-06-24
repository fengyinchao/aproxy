import { skip } from 'rxjs';
import express from 'express';
import http from 'http';
import { setActiveNetworkProxy, WsMessageTypeEnum } from '@aproxy/bridge';
import WSServer from '@aproxy/bridge/wsServer';
import { Log } from './index';

export const dev = () => {
  const app = express();

  const httpserver = http.createServer({}, (req, res) => {
    app.handle(req, res);
  });

  const wsServer = new WSServer(httpserver);

  wsServer.message$.pipe(skip(1)).subscribe(msg => {
    const { socket, data } = msg;
    Log('收到消息：', data);
    if (msg.data?.type === WsMessageTypeEnum.CLIENT_SETPROXY) {
      setActiveNetworkProxy({ host: '127.0.0.1', port: '3000' });
      wsServer.send({ type: WsMessageTypeEnum.SERVER, payload: { msg: '设置成功' } }, socket);
    }
  });

  httpserver.listen(8888, () => {
    Log(`Secure Server is listening on port 8888`);
  });
};

import { skip } from 'rxjs';
import http from 'http';
import { WsMessageTypeEnum } from '@aproxy/bridge';
import {
  getActiveNetworkProxyStatus,
  setActiveNetworkProxy,
  setActiveNetworkProxyStatus,
} from '@aproxy/bridge/systemProxyMac';

import { getIpAddress } from '@aproxy/utils';
import WSServer from '@aproxy/bridge/wsServer';
import { v4 as uuidv4 } from 'uuid';
import { Log } from './index';
import { httpMiddleware } from './middleware/httpMiddleware';
import { handleCertDownLoad } from './handleCertDownLoad';

const ip = getIpAddress();
let wsServer: WSServer = null;

declare module 'http' {
  interface IncomingMessage {
    requestId: string;
  }
}

const dev = () => {
  const httpserver = http
    .createServer((req, res) => {
      switch (req.url) {
        // 证书下载
        case '/cert':
          handleCertDownLoad(res);
          break;

        default:
          break;
      }
    })
    .listen(8888, () => {
      Log(`Secure Server is listening on port 8888`);
    });

  // 代理 http 请求
  httpserver.on('request', (req: http.IncomingMessage, res: http.ServerResponse) => {
    if (req.url.includes('/cert')) {
      return;
    }
    if (!req.requestId) {
      req.requestId = uuidv4();
    }
    httpMiddleware.proxy(req, res);
  });

  // 代理 https 请求
  httpserver.on('connect', (req: http.IncomingMessage, res: http.ServerResponse) => {
    if (!req.requestId) {
      req.requestId = uuidv4();
    }
    // httpMiddleware.proxy(req, res);
  });

  // 代理 websocket 请求
  httpserver.on('upgrade', (req: http.IncomingMessage, res: http.ServerResponse) => {
    if (!req.requestId) {
      req.requestId = uuidv4();
    }
    // httpMiddleware.proxy($req, res);
  });

  // websocket server 创建及消息处理
  wsServer = new WSServer(httpserver, true);
  wsServer.message$.pipe(skip(1)).subscribe(msg => {
    const { socket, data } = msg;
    Log('收到消息：', data);
    if (data?.type === WsMessageTypeEnum.CLIENT_SETPROXY) {
      const payload = data.payload;
      if (payload.on) {
        setActiveNetworkProxy({ host: ip[0], port: '8888' });
      } else {
        setActiveNetworkProxyStatus('off');
      }
      const res = getActiveNetworkProxyStatus();
      wsServer.send(
        { type: WsMessageTypeEnum.SERVER_GETPROXY_RES, payload: { msg: res['Wi-Fi'] ? 'ok' : 'error' } },
        socket,
      );
    }
    if (data?.type === WsMessageTypeEnum.CLIENT_GETPROXY) {
      const res = getActiveNetworkProxyStatus();
      wsServer.send(
        { type: WsMessageTypeEnum.SERVER_GETPROXY_RES, payload: { msg: res['Wi-Fi'] ? 'ok' : 'error' } },
        socket,
      );
    }
  });
};

export { wsServer, dev };

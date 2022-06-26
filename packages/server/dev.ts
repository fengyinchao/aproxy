import { skip } from 'rxjs';
import express from 'express';
import fs from 'fs-extra';
import http from 'http';
import { WsMessageTypeEnum } from '@aproxy/bridge';
import { getActiveNetworkProxyStatus, setActiveNetworkProxy } from '@aproxy/bridge/systemProxyMac';

import { getIpAddress } from '@aproxy/utils';
import WSServer from '@aproxy/bridge/wsServer';
import { v4 as uuidv4 } from 'uuid';
import { Log } from './index';
import Certificate from './certificate';
import { httpMiddleware } from './middleware/httpMiddleware';
const ip = getIpAddress();
let wsServer: WSServer = null;

const dev = () => {
  const app = express();

  const httpserver = http.createServer({}, (req, res) => {
    app.handle(req, res);
  });

  // websocket server 创建及消息处理
  wsServer = new WSServer(httpserver, true);
  wsServer.message$.pipe(skip(1)).subscribe(msg => {
    const { socket, data } = msg;
    Log('收到消息：', data);
    if (data?.type === WsMessageTypeEnum.CLIENT_SETPROXY) {
      setActiveNetworkProxy({ host: ip[0], port: '8888' });
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

  // 证书下载
  app.get('/cert', async function (req, res) {
    const CA = Certificate.CreateRootCA();
    const certDir = `${__dirname}/cert`;
    const certFileName = `${certDir}/cert.ca.cer`;
    const certKeyFileName = `${certDir}/key.ca.cer`;

    await fs.remove(certDir);
    await fs.ensureDir(certDir);
    await fs.outputFile(certFileName, CA.certificate);
    await fs.outputFile(certKeyFileName, CA.privateKey);
    res.download(certFileName);
  });

  httpserver.listen(8888, () => {
    // http 请求
    // httpserver.on('request', (req, res) => {
    //   const $req = req;
    //   if (!$req.$requestId) {
    //     $req.$requestId = uuidv4();
    //   }
    //   httpMiddleware.proxy($req, res);
    // });

    // // https 请求
    // httpserver.on('connect', (req, res) => {
    //   const $req = req;
    //   if (!$req.$requestId) {
    //     $req.$requestId = uuidv4();
    //   }
    //   // httpMiddleware.proxy($req, res);
    // });

    // // websocket 请求
    // httpserver.on('upgrade', (req, res) => {
    //   const $req = req;
    //   if (!$req.$requestId) {
    //     $req.$requestId = uuidv4();
    //   }
    //   // httpMiddleware.proxy($req, res);
    // });
    Log(`Secure Server is listening on port 8888`);
  });
};

export { wsServer, dev };

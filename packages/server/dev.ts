import { skip } from 'rxjs';
import express from 'express';
import fs from 'fs-extra';
import http from 'http';
import { getActiveNetworkProxyStatus, setActiveNetworkProxy, WsMessageTypeEnum } from '@aproxy/bridge';
import { getIpAddress } from '@aproxy/utils';
import WSServer from '@aproxy/bridge/wsServer';
import { Log } from './index';
import Certificate from './certificate';

const ip = getIpAddress();

export const dev = () => {
  const app = express();

  const httpserver = http.createServer({}, (req, res) => {
    app.handle(req, res);
  });

  const wsServer = new WSServer(httpserver);

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

  httpserver.listen(8888, () => {
    Log(`Secure Server is listening on port 8888`);
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
};

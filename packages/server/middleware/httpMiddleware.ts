import { ProxyRequestItem, WsMessageTypeEnum } from '@aproxy/bridge';
import { wsServer } from '../dev';
import http from 'http';
import path from 'path';
import fs from 'fs-extra';
import fetch from 'node-fetch';
import { Log } from '../index';
import mime from 'mime';

export const httpMiddleware = {
  async proxy(req: http.IncomingMessage, res: http.ServerResponse) {
    if (req.url.includes('.json')) {
      this.proxyByLocalServer(req, res);
    } else {
      this.proxyByRequest(req, res);
    }
  },

  async proxyByRequest(req: http.IncomingMessage, res: http.ServerResponse) {
    const response = await fetch(req.url);
    const requestHeaders = req.headers;
    const requestContentType = requestHeaders['content-type'];
    const body = await response.text();
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-expect-error
    res.writeHead(response.status, response.headers);
    res.end(body);
    const proxyRequestItem: ProxyRequestItem = {
      type: req.headers.location?.includes('https') ? 'https' : 'http',
      method: req.method,
      status: response.status,
      url: req.url,
      response: body,
    };
    wsServer?.send(
      { type: WsMessageTypeEnum.SERVER_PROXY_REQUEST_RES, payload: { item: proxyRequestItem } },
      wsServer.clientSocket,
    );
    Log(req.url, requestContentType, response.headers);
  },

  async proxyByLocalServer(req: http.IncomingMessage, res: http.ServerResponse) {
    const filepath = path.join(__dirname, '../mock/test.json');
    const readStream = fs.createReadStream(filepath);
    const fileContentType = mime.getType(filepath);
    const headers = {};
    if (fileContentType && !headers['content-type']) {
      headers['content-type'] = fileContentType;
    }
    res.writeHead(200, headers);
    readStream.pipe(res);
    Log(headers);
    const proxyRequestItem: ProxyRequestItem = {
      type: req.headers.location?.includes('https') ? 'https' : 'http',
      method: req.method,
      status: 200,
      url: req.url,
      response: JSON.stringify(await fs.readJSON(filepath)),
    };
    wsServer?.send(
      { type: WsMessageTypeEnum.SERVER_PROXY_REQUEST_RES, payload: { item: proxyRequestItem } },
      wsServer.clientSocket,
    );
  },
};

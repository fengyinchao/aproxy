import { ProxyRequestItem, WsMessageTypeEnum } from '@aproxy/bridge';
import { wsServer } from '../dev';
import { Log } from '../index';

export const httpMiddleware = {
  async proxy(req: any, res: any) {
    const proxyRequestItem: ProxyRequestItem = {
      type: 'http',
      method: req.method,
      status: 200,
      host: req.hostname,
      path: req.path,
      response: 'OK',
    };
    wsServer?.send(
      { type: WsMessageTypeEnum.SERVER_PROXY_REQUEST_RES, payload: { item: proxyRequestItem } },
      wsServer.clientSocket,
    );
  },
};

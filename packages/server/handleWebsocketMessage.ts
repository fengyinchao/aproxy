import WSServer from '@aproxy/bridge/wsServer';
import { skip } from 'rxjs';
import { WsMessageTypeEnum } from '@aproxy/bridge';
import { getIpAddress } from '@aproxy/utils';
import {
  getActiveNetworkProxyStatus,
  setActiveNetworkProxy,
  setActiveNetworkProxyStatus,
} from '@aproxy/bridge/systemProxyMac';
import { userConfig } from './dev';
import { Log } from './index';

const ip = getIpAddress();

export const handleWebsocketMessage = (wsServer: WSServer) => {
  wsServer.message$.pipe(skip(1)).subscribe(msg => {
    const { socket, data } = msg;
    Log('收到消息：', data);
    if (data?.type === WsMessageTypeEnum.CLIENT_SETPROXY) {
      const payload = data.payload;
      if (payload.on) {
        setActiveNetworkProxy({ host: ip[0], port: userConfig.port.toString() });
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

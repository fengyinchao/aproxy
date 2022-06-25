import WSClient from './wsClient';
import { createDebug } from '@aproxy/utils';
import { setActiveNetworkProxy, getActiveNetworkProxyStatus } from './systemProxyMac';

export enum WsMessageTypeEnum {
  INIT = 0,
  CONNECTED = 1, // 已连接
  CLOSED = 2, // 已关闭
  CLIENT_SETPROXY = 3, // Client 请求设置系统代理
  SERVER_SETPROXY_RES = 4, // Server 发过来的消息
  CLIENT_GETPROXY = 5,
  SERVER_GETPROXY_RES = 6,
}

export interface IWsMessage<T = Record<string, unknown>> {
  type: WsMessageTypeEnum;
  payload?: T;
}

const Log = createDebug('@aproxy/bridge');

export { WSClient, Log, setActiveNetworkProxy, getActiveNetworkProxyStatus };

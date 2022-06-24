export enum WsMessageTypeEnum {
  INIT = 0,
  CONNECTED = 1, // 已连接
  CLOSED = 2, // 已关闭
  SERVER = 3, // Server 发过来的消息
  CLIENT = 4, // Client 发过来的消息
}

export interface IWsMessage<T = Record<string, unknown>> {
  type: WsMessageTypeEnum;
  payload?: T;
}

import WSClient from './wsClient';

let WSServer = null;

if (typeof process !== 'undefined') {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  WSServer = require('./wsServer').default;
}

import { createDebug } from '@aproxy/utils';

const Log = createDebug('@aproxy/bridge');

export { WSClient, WSServer, Log };

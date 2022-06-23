export enum WsMessageTypeEnum {
  INIT = 0,
  CONNECTED = 1, // 已连接
  CLOSED = 2, // 已关闭
  SERVER = 3, // Server 发过来的消息
  CLIENT = 4, // Client 发过来的消息
}

export interface IWsMessage<T = Record<string, any>> {
  type: WsMessageTypeEnum;
  payload?: T;
}

export * from './wsClient';
export * from './wsServer';

import { IWsMessage, WsMessageTypeEnum } from 'index';
import { BehaviorSubject } from 'rxjs';

interface IWsClientConfig {
  url: string;
}

class WSClient {
  private websocket: WebSocket;
  private websocketUrl: string;
  private reconnectCount = 0;
  message$ = new BehaviorSubject<IWsMessage>({ type: WsMessageTypeEnum.INIT });

  constructor(config: IWsClientConfig) {
    const { url } = config;
    if (url) {
      this.websocketUrl = url;
      this.connect(url);
    }
  }

  private connect(url: string) {
    this.websocket = new WebSocket(url);
    this.websocket.onopen = () => {
      this.message$.next({ type: WsMessageTypeEnum.CONNECTED });
    };
    this.websocket.onclose = () => {
      this.message$.next({ type: WsMessageTypeEnum.CLOSED });
    };
    this.websocket.onmessage = e => {
      const data: IWsMessage = JSON.parse(e.data);
      this.message$.next(data);
    };
  }

  send(data: string | IWsMessage) {
    if (this.websocket?.readyState === WebSocket.OPEN) {
      this.websocket.send(typeof data !== 'string' ? JSON.stringify(data) : data);
    }
  }

  reconnect() {
    const timer = setInterval(() => {
      this.reconnectCount += 1;
      if (this.websocket.readyState === WebSocket.OPEN) {
        clearInterval(timer);
        return;
      }
      this.connect(this.websocketUrl);
      if (this.reconnectCount > 10) {
        clearInterval(timer);
      }
    }, 1500);
  }
}

export default WSClient;

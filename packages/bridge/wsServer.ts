import * as ws from 'ws';
import { Server as HTTPServer } from 'http';
import { Server as HTTPSServer } from 'https';
import { BehaviorSubject } from 'rxjs';
import { IWsMessage, WsMessageTypeEnum } from './index';

declare module 'ws' {
  interface WebSocket {
    alive: boolean;
  }
}

class WSServer {
  private wsServer?: ws.Server;
  message$ = new BehaviorSubject<{ socket: ws.WebSocket; data: IWsMessage }>({
    socket: null,
    data: { type: WsMessageTypeEnum.INIT },
  });

  constructor(server: HTTPServer | HTTPSServer, noServerMode = false) {
    let wsServer: ws.Server = null;
    if (!noServerMode) {
      wsServer = new ws.Server({ server });
    } else {
      wsServer = new ws.Server({ noServer: true });
      server.on('upgrade', (request, socket, head) => {
        wsServer.handleUpgrade(request, socket, head, socket => {
          wsServer.emit('connection', socket, request);
        });
      });
    }
    wsServer.on('connection', socket => {
      // 心跳监控
      socket.alive = true;
      socket.on('pong', () => {
        socket.alive = true;
      });
      socket.on('message', (message: string) => {
        const formatedMessage: IWsMessage = JSON.parse(message);
        // eslint-disable-next-line no-console
        console.log('收到客户端消息：', formatedMessage);
        this.message$.next({ data: formatedMessage, socket });
      });
    });
    this.wsServer = wsServer;
    this.checkAlive();
  }

  checkAlive() {
    setInterval(() => {
      this.wsServer.clients.forEach((socket: ws.WebSocket) => {
        if (!socket.alive) {
          // eslint-disable-next-line no-console
          console.log('===socket断开连接', socket);
          return socket.terminate();
        }
        socket.alive = false;
        socket.ping(null, false);
      });
    }, 10000);
  }

  broadCastMessage(message: IWsMessage) {
    this.wsServer.clients.forEach(client => {
      client.send(`Hello, broadcast message -> ${message}`);
    });
  }
}

export default WSServer;

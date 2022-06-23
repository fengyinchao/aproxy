import 'animate.css';
// import './App.scss';
import { WSClient, WsMessageTypeEnum } from '@aproxy/bridge';
import { useEffect, useState } from 'react';

const wsClient = new WSClient({ url: 'ws://localhost:8888' });
let index = 0;
export default () => {
  const [connected, setConnected] = useState(false);
  useEffect(() => {
    setInterval(() => {
      wsClient.send(JSON.stringify({ type: WsMessageTypeEnum.CLIENT, payload: { index: index++ } }));
    }, 1000);
  }, []);
  useEffect(() => {
    const sub = wsClient.message$.subscribe(message => {
      console.log('===message', message);
      switch (message.type) {
        case WsMessageTypeEnum.CONNECTED:
          setConnected(true);
          break;
        case WsMessageTypeEnum.CLOSED:
          setConnected(false);
          break;
        default:
          break;
      }
    });
    return () => {
      sub.unsubscribe();
    };
  }, []);
  return <div>Hello World{connected ? '已连接' : '已断开'}</div>;
};

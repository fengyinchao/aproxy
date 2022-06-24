import 'animate.css';
// import './App.scss';
import { WsMessageTypeEnum,WSClient } from '@aproxy/bridge';
import { useEffect, useState } from 'react';
import { Log } from './index';

const wsClient = new WSClient({ url: 'ws://localhost:8888' });

export default () => {
  const [connected, setConnected] = useState(false);
  const setProxy = ()=>{
    wsClient.send({type:WsMessageTypeEnum.CLIENT})
  }
  
 
  useEffect(() => {
    const sub = wsClient.message$.subscribe(message => {
      Log(JSON.stringify(message));
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
  return <div>Hello World{connected ? '已连接' : '已断开'}
  <button onClick={setProxy}>设置代理</button>
  </div>;
};

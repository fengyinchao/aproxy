import 'animate.css';
// import './App.scss';
import { WsMessageTypeEnum, WSClient } from '@aproxy/bridge';
import { useEffect, useState } from 'react';
import { Log } from './index';

const wsClient = new WSClient({ url: 'ws://localhost:8888' });

export default () => {
  const [connected, setConnected] = useState(false);
  const [proxySeted, setProxySeted] = useState(false);

  const setProxy = () => {
    wsClient.send({ type: WsMessageTypeEnum.CLIENT_SETPROXY });
  };

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
        case WsMessageTypeEnum.SERVER_GETPROXY_RES:
          setProxySeted(message.payload.msg === 'ok');
          break;
        default:
          break;
      }
    });
    return () => {
      sub.unsubscribe();
    };
  }, []);

  useEffect(() => {
    connected && wsClient.send({ type: WsMessageTypeEnum.CLIENT_GETPROXY, payload: { msg: '请求代理状态' } });
  }, [connected]);
  return (
    <div>
      <p>Websocket{connected ? '已连接' : '已断开'}</p>
      <p>系统代理{proxySeted?'设置成功':"设置失败"}<button onClick={setProxy}>设置代理</button></p>
    </div>
  );
};

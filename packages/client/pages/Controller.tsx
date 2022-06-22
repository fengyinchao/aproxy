import classNames from 'classnames';
import { useCallback, useContext, useEffect } from 'react';
import ConfigEditor from '../components/ConfigEditor';
import Filter from '../components/Filter';
import Install from '../components/Install';
import RuleTest from '../components/ruleTest';
import Settings from '../components/Settings';
import {
  BugOutlined,
  ClearOutlined,
  CodeOutlined,
  FilterOutlined,
  MacCommandOutlined,
  message,
  Modal,
  PlayCircleOutlined,
  SettingOutlined, WifiOutlined
} from '../components/UI';
import Weinre from '../components/Weinre';
import { Ctx } from '../ctx';
import useBool from '../hooks/useBool';
import { activeProxy, checkProxy, disActiveProxy } from '../modules/bridge';
import { ws } from '../modules/socket';
import './Controller.scss';
import React from 'react';


const ControllerDialog = ({ title, children, visible, ...others }) => {
  if (!visible) {
    return null;
  }
  return (
    <Modal
      title={title}
      visible={visible}
      footer={null}
      width={1000}
      {...others}
    >
      {children}
    </Modal>
  );
};

const RuleTestModal = (props) => {
  return (
    <ControllerDialog
      title="检测目标URL是否跟你的rule匹配"
      width={800}
      {...props}
    >
      <RuleTest />
    </ControllerDialog>
  );
};

const FilterModal = (props) => {
  return (
    <ControllerDialog title="过滤 HTTP 日志" width={700} {...props}>
      <Filter />
    </ControllerDialog>
  );
};

const InstallModal = (props) => {
  return (
    <ControllerDialog title="安装 HTTPS 证书" width={800} {...props}>
      <Install />
    </ControllerDialog>
  );
};

const ConfigModal = (props) => {
  return (
    <ControllerDialog title="编辑配置文件" width={window.innerWidth * 0.7} centered {...props}>
      <ConfigEditor onCancel={props.onCancel} />
    </ControllerDialog>
  );
};

const SettingsModal = (props) => {
  return (
    <ControllerDialog title="个性化设置" width="1000" {...props} centered>
      <Settings />
    </ControllerDialog>
  );
};

const WeinreModal = (props) => {
  return (
    <ControllerDialog title="页面调试" width={500} centered {...props}>
      <Weinre />
    </ControllerDialog>
  );
};

interface ControllerProps {
  connected?: boolean;
}

const Disconnected = () => (
  <div className="disconnected">aproxy 已经停止工作，等待连接中...</div>
);

const Controller = (props: ControllerProps) => {
  const { connected } = props;
  const { state, dispatch } = useContext(Ctx);
  const { proxySwitch, clean, filterString, filterContentType } = state;

  const { state: isShowRuleTest, toggle: toggleShowRuleTest } = useBool(false);
  const { state: isShowFilter, toggle: toggleShowFilter } = useBool(false);
  const { state: isShowInstall, toggle: toggleShowInstall } = useBool(false);
  const { state: isShowConfig, toggle: toggleShowConfig } = useBool(false);
  useBool(false);
  const { state: isShowSettings, toggle: toggleShowSettings } = useBool(false);
  const { state: isShowWeinre, toggle: toggleShowWeinre } = useBool(false);
  const { state: systemProxyStatus, toggle: toggleSystemProxyStatus } =
    useBool(false);

  const toggleSwitch = useCallback(() => {
    dispatch({ type: 'setProxySwitch', proxySwitch: !proxySwitch });
  }, [proxySwitch]);
  const onClean = () => {
    if (clean) {
      clean();
    }
  };
  const onClickSystemProxy = useCallback(() => {
    if (systemProxyStatus) {
      disActiveProxy();
    } else {
      activeProxy();
    }
    toggleSystemProxyStatus();
    message.success(!systemProxyStatus ? '系统代理已开启' : '系统代理已关闭');
  }, [systemProxyStatus]);
  useEffect(() => {
    const open$ = ws.on('open', () => {
      checkProxy().then((isOpen) => {
        if (isOpen) {
          toggleSystemProxyStatus();
        }
      });
    });

    return () => {
      open$.unsubscribe();
    };
  }, []);

  useEffect(() => {
    const watchHotKey = (e) => {
      const { altKey, keyCode } = e;
      if (altKey && keyCode === 88) {
        onClean();
      }
    };
    document.body.addEventListener('keydown', watchHotKey);

    return () => {
      document.body.removeEventListener('keydown', watchHotKey);
    };
  }, [onClean]);

  return (
    <div className="controller">
      {!connected ? <Disconnected /> : null}
      <div
        onClick={toggleSwitch}
        className={classNames({
          disabled: !proxySwitch,
        })}
      >
        <PlayCircleOutlined />
        <span>日志开关</span>
      </div>
      <div onClick={onClean}>
        <ClearOutlined />
        <span>清理日志</span>
      </div>
      <div onClick={toggleShowInstall}>
        <WifiOutlined />
        <span>安装证书</span>
      </div>
      <div onClick={toggleShowRuleTest}>
        <BugOutlined />
        <span>代理规则</span>
      </div>
      <div
        onClick={toggleShowFilter}
        className={classNames({
          warn: !!filterString || filterContentType !== 'all',
        })}
      >
        <FilterOutlined />
        <span>过滤规则</span>
      </div>
      <div
        className={classNames({
          [systemProxyStatus ? 'warn' : 'disabled']: true,
        })}
        onClick={onClickSystemProxy}
      >
        <MacCommandOutlined />
        <span>系统代理</span>
      </div>
      <div onClick={toggleShowConfig}>
        <CodeOutlined />
        <span>配置文件</span>
      </div>
      <div onClick={toggleShowWeinre}>
        <BugOutlined />
        <span>页面调试</span>
      </div>
      <div onClick={toggleShowSettings}>
        <SettingOutlined />
        <span>设置</span>
      </div>

      {/* 规则检查 */}
      <RuleTestModal onCancel={toggleShowRuleTest} visible={isShowRuleTest} />
      {/* 过滤 */}
      <FilterModal onCancel={toggleShowFilter} visible={isShowFilter} />
      {/* 安装证书 */}
      <InstallModal onCancel={toggleShowInstall} visible={isShowInstall} />
      {/* 代理配置文件 */}
      <ConfigModal onCancel={toggleShowConfig} visible={isShowConfig} />
      {/* 个性化设置 */}
      <SettingsModal onCancel={toggleShowSettings} visible={isShowSettings} />
      {/* 远程调试 */}
      <WeinreModal onCancel={toggleShowWeinre} visible={isShowWeinre} />
    </div>
  );
};

export default Controller;

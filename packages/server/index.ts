import { dev } from './dev';
import { debug } from '@aproxy/utils';
import { defineAproxyConfig } from './getUserConfig';

const Log = debug('@aproxy/server');

export { dev, Log, defineAproxyConfig };

export * from './type';

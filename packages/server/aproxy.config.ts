import { defineAproxyConfig } from './getUserConfig';

const config = defineAproxyConfig({
  port: 8888,
  https: true,
});

export { config };

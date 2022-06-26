import { defineAproxyConfig } from '@aproxy/server';

const config = defineAproxyConfig({
  port: 8888,
  https: true,
});

export { config };

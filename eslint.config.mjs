import { config } from '@n8n/node-cli/eslint';

config.unshift({
    ignores: ['test', 'vitest.config.ts']
});

export default config;

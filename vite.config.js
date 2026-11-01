import { defineConfig } from 'vite';
const buildId = process.env.GITHUB_SHA || process.env.TINY_BUILD_ID || 'local-development';
export default defineConfig({ base: process.env.TINY_BASE || '/tiny-town-adventures/', define: { __TINY_BUILD_ID__: JSON.stringify(buildId) } });
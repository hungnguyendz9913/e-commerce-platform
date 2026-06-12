import { defineConfig } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';
import { register } from '@swc-node/register/register';
import ts from 'typescript';

register({
  target: ts.ScriptTarget.ES2022,
  module: ts.ModuleKind.CommonJS,
  experimentalDecorators: true,
  emitDecoratorMetadata: true,
  esModuleInterop: true,
}, {
  exts: ['.ts', '.tsx'],
});

export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),
  build: {
    external: ['apps/api/src/**/*.ts', 'libs/**/dist/**/*.js'],
  },
  tsconfig: './tsconfig.json',
  fullyParallel: false,
  outputDir: './test-output/playwright/output',
  reporter: [['list']],
  use: {
    trace: 'on-first-retry',
  },
});

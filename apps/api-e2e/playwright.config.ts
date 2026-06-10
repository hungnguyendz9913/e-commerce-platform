import { defineConfig } from '@playwright/test';
import { nxE2EPreset } from '@nx/playwright/preset';

export default defineConfig({
  ...nxE2EPreset(__filename, { testDir: './src' }),
  tsconfig: './tsconfig.json',
  fullyParallel: false,
  outputDir: './test-output/playwright/output',
  reporter: [['list']],
  use: {
    trace: 'on-first-retry',
  },
});

const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 30000,
  expect: { timeout: 7000 },
  fullyParallel: true,
  retries: 1,
  reporter: [['line'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure'
  },
  webServer: {
    command: 'python3 -m http.server 4173 --bind 127.0.0.1',
    url: 'http://127.0.0.1:4173',
    reuseExistingServer: false,
    timeout: 15000
  },
  projects: [
    // Chromium: broad viewport matrix for Android/Chrome/Edge-class rendering.
    { name: 'chromium-mobile-360', use: { browserName: 'chromium', viewport: { width: 360, height: 800 }, hasTouch: true } },
    { name: 'chromium-mobile-390', use: { browserName: 'chromium', viewport: { width: 390, height: 844 }, hasTouch: true } },
    { name: 'chromium-mobile-430', use: { browserName: 'chromium', viewport: { width: 430, height: 932 }, hasTouch: true } },
    { name: 'chromium-tablet-768', use: { browserName: 'chromium', viewport: { width: 768, height: 1024 }, hasTouch: true } },
    { name: 'chromium-tablet-1024', use: { browserName: 'chromium', viewport: { width: 1024, height: 1366 }, hasTouch: true } },
    { name: 'chromium-desktop-1366', use: { browserName: 'chromium', viewport: { width: 1366, height: 768 } } },
    { name: 'chromium-desktop-1920', use: { browserName: 'chromium', viewport: { width: 1920, height: 1080 } } },

    // WebKit: Safari/iPhone/iPad/macOS-class rendering and touch behaviour.
    { name: 'webkit-iphone-small', use: { ...devices['iPhone 13 Mini'] } },
    { name: 'webkit-iphone-large', use: { ...devices['iPhone 15 Pro Max'] } },
    { name: 'webkit-ipad', use: { ...devices['iPad Pro 11'] } },
    { name: 'webkit-desktop', use: { browserName: 'webkit', viewport: { width: 1440, height: 900 } } },

    // Firefox: independent layout/JS engine coverage on mobile-sized and desktop viewports.
    { name: 'firefox-mobile-390', use: { browserName: 'firefox', viewport: { width: 390, height: 844 }, hasTouch: true } },
    { name: 'firefox-tablet-768', use: { browserName: 'firefox', viewport: { width: 768, height: 1024 }, hasTouch: true } },
    { name: 'firefox-desktop-1440', use: { browserName: 'firefox', viewport: { width: 1440, height: 900 } } }
  ]
});

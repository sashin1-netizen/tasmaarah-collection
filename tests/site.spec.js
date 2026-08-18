const { test, expect } = require('@playwright/test');
const fs = require('fs');

const publicPages = [
  ['home', '/index.html'],
  ['about', '/about.html'],
  ['collection', '/shop.html'],
  ['occasions', '/occasions.html'],
  ['custom orders', '/custom-orders.html'],
  ['gallery', '/gallery.html'],
  ['contact', '/contact.html'],
  ['404', '/404.html']
];

for (const [name, path] of publicPages) {
  test(`${name} renders without overflow or runtime errors`, async ({ page }) => {
    const errors = [];
    page.on('pageerror', error => errors.push(`pageerror: ${error.message}`));
    page.on('console', message => { if (message.type() === 'error') errors.push(`console: ${message.text()}`); });
    const response = await page.goto(path, { waitUntil: 'domcontentloaded' });
    expect(response && response.status()).toBeLessThan(400);
    await expect(page.locator('header.site-header')).toBeVisible();
    await expect(page.locator('footer.footer')).toBeVisible();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(2);
    expect(errors).toEqual([]);
  });
}

test('approved hero is the LCP candidate and primary CTAs are usable', async ({ page }) => {
  await page.goto('/index.html');
  const hero = page.locator('.hero-art');
  await expect(hero).toBeVisible();
  await expect(hero).toHaveAttribute('src', /file_00000000d5e88243924fe08befb57f2a\.png/);
  await expect(hero).toHaveAttribute('fetchpriority', 'high');
  expect(await hero.evaluate(img => img.complete && img.naturalWidth > 0)).toBeTruthy();
  const buttons = page.locator('.hero-actions .btn');
  await expect(buttons).toHaveCount(2);
  await expect(buttons.nth(0)).toHaveAttribute('href', /wa\.me\/27635409729/);
  await expect(buttons.nth(1)).toHaveAttribute('href', 'shop.html');
});

test('mobile navigation works as native progressive enhancement', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('mobile'), 'Mobile navigation contract');
  await page.goto('/index.html');
  const menu = page.locator('.mobile-menu');
  const summary = menu.locator('summary');
  await expect(summary).toBeVisible();
  await summary.click();
  await expect(menu).toHaveAttribute('open', '');
  await expect(menu.locator('.mobile-panel')).toBeVisible();
  await expect(menu.locator('a[href="about.html"]')).toBeVisible();
  await expect(summary).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(menu).not.toHaveAttribute('open', '');
  await expect(summary).toHaveAttribute('aria-expanded', 'false');
});

test('native mobile menu remains usable with JavaScript disabled', async ({ browser }) => {
  const context = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  const page = await context.newPage();
  await page.goto('/index.html');
  const menu = page.locator('.mobile-menu');
  await expect(menu.locator('summary')).toBeVisible();
  await menu.locator('summary').click();
  await expect(menu).toHaveAttribute('open', '');
  await expect(menu.locator('a[href="contact.html"]')).toBeVisible();
  await context.close();
});

test('background motion is visible and can be paused', async ({ page }) => {
  await page.goto('/about.html');
  const animation = await page.evaluate(() => getComputedStyle(document.querySelector('main'), '::before').animationName);
  expect(animation).toContain('satinSweep');
  const toggle = page.locator('.motion-toggle');
  await expect(toggle).toBeVisible();
  if ((await page.locator('body').getAttribute('data-motion')) === 'off') await toggle.click();
  await expect(page.locator('body')).toHaveAttribute('data-motion', 'on');
  await toggle.click();
  await expect(page.locator('body')).toHaveAttribute('data-motion', 'off');
  const playState = await page.evaluate(() => getComputedStyle(document.querySelector('main'), '::before').animationPlayState);
  expect(playState).toBe('paused');
});

test('collection search filters cards and reports empty results', async ({ page }) => {
  await page.goto('/shop.html');
  const search = page.locator('[data-catalog-search]');
  await search.fill('Perspex');
  await expect(page.locator('.catalog-card:not([hidden])')).toHaveCount(1);
  await expect(page.locator('.catalog-card:not([hidden]) h2')).toContainText('Perspex');
  await search.fill('not-a-real-product');
  await expect(page.locator('.catalog-card:not([hidden])')).toHaveCount(0);
  await expect(page.locator('.empty-state')).toHaveClass(/show/);
});

test('gallery lightbox opens, navigates and closes with keyboard', async ({ page }) => {
  await page.goto('/gallery.html');
  const first = page.locator('.masonry-gallery img').first();
  await first.click();
  const lightbox = page.locator('.lightbox');
  await expect(lightbox).toHaveClass(/open/);
  const initial = await lightbox.locator('img').getAttribute('src');
  await page.keyboard.press('ArrowRight');
  const next = await lightbox.locator('img').getAttribute('src');
  expect(next).not.toBe(initial);
  await page.keyboard.press('Escape');
  await expect(lightbox).not.toHaveClass(/open/);
});

test('contact form validates and composes a WhatsApp enquiry', async ({ page }) => {
  await page.goto('/contact.html');
  const form = page.locator('#quote-form');
  await expect(form).toBeVisible();
  await expect(form).toHaveAttribute('action', 'https://api.whatsapp.com/send');
  await expect(page.locator('a[href*="wa.me/27635409729"]')).not.toHaveCount(0);

  await page.route('https://wa.me/**', route => route.abort());
  await page.locator('input[name="name"]').fill('QA Tester');
  await page.locator('select[name="occasion"]').selectOption({ label: 'Birthday' });
  const requestPromise = page.waitForRequest(request => request.url().startsWith('https://wa.me/27635409729?text='));
  await form.locator('button[type="submit"]').click();
  const request = await requestPromise;
  const decoded = decodeURIComponent(request.url());
  expect(decoded).toContain('Name: QA Tester');
  expect(decoded).toContain('Occasion: Birthday');
});

test('phone email and WhatsApp conversion actions are present', async ({ page }) => {
  await page.goto('/contact.html');
  await expect(page.locator('a[href="tel:+27635409729"]')).not.toHaveCount(0);
  await expect(page.locator('a[href="tel:+27743788958"]')).not.toHaveCount(0);
  await expect(page.locator('a[href="mailto:tasmaarahcollection@gmail.com"]')).not.toHaveCount(0);
  await expect(page.locator('.floating-wa')).toHaveAttribute('href', /wa\.me\/27635409729/);
});

test('capture visual acceptance evidence', async ({ page }, testInfo) => {
  fs.mkdirSync('visual-evidence', { recursive: true });
  for (const [name, path] of [['home','/index.html'],['about','/about.html'],['contact','/contact.html']]) {
    await page.goto(path, { waitUntil: 'networkidle' });
    await page.screenshot({ path: `visual-evidence/${testInfo.project.name}-${name}.png`, fullPage: true });
  }
});

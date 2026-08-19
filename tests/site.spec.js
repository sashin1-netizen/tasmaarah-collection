const { test, expect } = require('@playwright/test');
const fs = require('fs');

const publicPages = [
  ['home', '/index.html'], ['about', '/about.html'], ['collection', '/shop.html'], ['occasions', '/occasions.html'],
  ['custom orders', '/custom-orders.html'], ['gallery', '/gallery.html'], ['contact', '/contact.html'], ['404', '/404.html']
];

async function scrollThrough(page) {
  await page.evaluate(async () => { await new Promise(resolve => { let last=-1; const step=Math.max(420,Math.floor(innerHeight*.72)); const tick=()=>{const max=Math.max(0,document.documentElement.scrollHeight-innerHeight),next=Math.min(max,scrollY+step);scrollTo(0,next);if(next===max||next===last)return setTimeout(resolve,250);last=next;setTimeout(tick,55)};tick() }) });
  await page.waitForLoadState('networkidle'); await page.waitForTimeout(200); await page.evaluate(()=>scrollTo(0,0));
}

for (const [name,path] of publicPages) {
  test(`${name} renders without overflow, broken images or runtime errors`, async ({ page }) => {
    const errors=[]; page.on('pageerror',e=>errors.push(`pageerror: ${e.message}`)); page.on('console',m=>{if(m.type()==='error')errors.push(`console: ${m.text()}`)});
    const response=await page.goto(path,{waitUntil:'domcontentloaded'}); expect(response&&response.status()).toBeLessThan(400);
    await expect(page.locator('header.site-header')).toBeVisible(); await expect(page.locator('footer.footer')).toBeVisible();
    expect(await page.evaluate(()=>document.documentElement.scrollWidth-innerWidth)).toBeLessThanOrEqual(2);
    const h1=page.locator('main h1'); await expect(h1).toHaveCount(1);
    const emptyAlt=await page.locator('img').evaluateAll(imgs=>imgs.filter(i=>!i.hasAttribute('alt')).length); expect(emptyAlt).toBe(0);
    expect(errors).toEqual([]);
  });
}

test('every indexable page has production SEO essentials', async ({ page }) => {
  for (const [,path] of publicPages.filter(([name])=>name!=='404')) {
    await page.goto(path);
    await expect(page.locator('head title')).not.toHaveText('');
    await expect(page.locator('meta[name="description"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveCount(1);
    await expect(page.locator('meta[name="viewport"]')).toHaveCount(1);
    await expect(page.locator('link[href*="stability-lock.css?v=3"]')).toHaveCount(1);
  }
});

test('approved hero is prioritized and primary CTAs are usable', async ({ page }) => {
  await page.goto('/index.html'); const hero=page.locator('.hero-art'); await expect(hero).toBeVisible();
  await expect(hero).toHaveAttribute('src',/file_00000000d5e88243924fe08befb57f2a\.png/); await expect(hero).toHaveAttribute('fetchpriority','high'); await expect(hero).toHaveAttribute('loading','eager');
  expect(await hero.evaluate(img=>img.complete&&img.naturalWidth>0)).toBeTruthy();
  const buttons=page.locator('.hero-actions .btn'); await expect(buttons).toHaveCount(2); await expect(buttons.nth(0)).toHaveAttribute('href',/wa\.me\/27635409729/); await expect(buttons.nth(1)).toHaveAttribute('href','shop.html');
});

test('mobile hero preserves complete artwork and places CTAs after it', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('mobile'),'Mobile art-direction contract'); await page.goto('/index.html');
  expect(await page.locator('.hero-art').evaluate(img=>getComputedStyle(img).objectFit)).toBe('contain'); await expect(page.locator('.campaign-copy h1')).toBeHidden();
  const stage=await page.locator('.campaign-stage').boundingBox(),actions=await page.locator('.hero-actions').boundingBox(); expect(stage&&actions&&actions.y).toBeGreaterThan(stage.y+stage.height-2);
});

test('homepage real photography loads after scrolling', async ({ page }) => { await page.goto('/index.html'); await scrollThrough(page); const failed=await page.locator('main img').evaluateAll(imgs=>imgs.filter(i=>!i.complete||i.naturalWidth===0).map(i=>i.getAttribute('src'))); expect(failed).toEqual([]) });

test('mobile navigation toggles reliably by tap, is full width and dismisses with Escape', async ({ page }, testInfo) => {
  test.skip(!testInfo.project.name.startsWith('mobile'),'Mobile navigation contract'); await page.goto('/index.html'); const menu=page.locator('.mobile-menu'),summary=menu.locator('summary'),panel=menu.locator('.mobile-panel');
  await summary.click(); await expect(menu).toHaveAttribute('open',''); await expect(panel).toBeVisible(); await expect(summary).toHaveAttribute('aria-expanded','true');
  const box=await panel.boundingBox(); expect(box.width).toBeGreaterThanOrEqual((await page.evaluate(()=>innerWidth))-2); expect(box.x).toBeLessThanOrEqual(1); await expect(page.locator('.floating-wa')).toBeHidden();
  await summary.click(); await expect(menu).not.toHaveAttribute('open',''); await expect(summary).toHaveAttribute('aria-expanded','false');
  await summary.click(); await expect(menu).toHaveAttribute('open',''); await page.keyboard.press('Escape'); await expect(menu).not.toHaveAttribute('open',''); await expect(summary).toHaveAttribute('aria-expanded','false');
});

test('native mobile menu remains usable with JavaScript disabled', async ({ browser }) => { const context=await browser.newContext({javaScriptEnabled:false,viewport:{width:390,height:844},hasTouch:true}); const page=await context.newPage(); await page.goto('/index.html'); const menu=page.locator('.mobile-menu'); await menu.locator('summary').click(); await expect(menu).toHaveAttribute('open',''); await expect(menu.locator('a[href="contact.html"]')).toBeVisible(); await context.close() });

test('official Instagram profile is exposed in desktop, mobile and footer contexts', async ({ page }) => {
  await page.goto('/index.html'); const href='https://www.instagram.com/boxes_tasmaarah_collection';
  await expect(page.locator('.instagram-link')).toHaveAttribute('href',href);
  await expect(page.locator('.mobile-instagram')).toHaveAttribute('href',href);
  await expect(page.locator('.footer-instagram')).toHaveAttribute('href',href);
  expect(await page.locator('script[type="application/ld+json"]').textContent()).toContain(href);
});

test('background motion is visible and can be paused', async ({ page }) => {
  await page.goto('/about.html'); const toggle=page.locator('.motion-toggle'); await expect(toggle).toBeVisible(); if((await page.locator('body').getAttribute('data-motion'))==='off')await toggle.click();
  await expect(page.locator('body')).toHaveAttribute('data-motion','on'); const animation=await page.evaluate(()=>getComputedStyle(document.querySelector('main'),'::before').animationName); expect(animation).toContain('satinSweep');
  await toggle.click(); await expect(page.locator('body')).toHaveAttribute('data-motion','off'); expect(await page.evaluate(()=>getComputedStyle(document.querySelector('main'),'::before').animationPlayState)).toBe('paused');
});

test('collection search filters, reports count and supports Escape clear', async ({ page }) => {
  await page.goto('/shop.html'); const search=page.locator('[data-catalog-search]'); await search.fill('Perspex'); await expect(page.locator('.catalog-card:not([hidden])')).toHaveCount(1); await expect(page.locator('.catalog-results-status')).toContainText('1 result');
  await search.press('Escape'); await expect(search).toHaveValue(''); await expect(page.locator('.catalog-card:not([hidden])')).toHaveCount(6); await search.fill('not-a-real-product'); await expect(page.locator('.empty-state')).toHaveClass(/show/);
});

test('collection and occasion links prefill the quote form', async ({ page }) => {
  await page.goto('/contact.html?occasion=Birthday&material=Glass&details=Example%20request'); await expect(page.locator('select[name="occasion"]')).toHaveValue('Birthday'); await expect(page.locator('select[name="material"]')).toHaveValue('Glass'); await expect(page.locator('textarea[name="details"]')).toHaveValue('Example request');
});

test('gallery lightbox navigates, closes and exposes a contextual enquiry', async ({ page }) => {
  await page.goto('/gallery.html'); await page.locator('.masonry-gallery img').first().click(); const lightbox=page.locator('.lightbox'); await expect(lightbox).toHaveClass(/open/); await expect(lightbox.locator('.lightbox-enquire')).toHaveAttribute('href',/wa\.me\/27635409729/);
  const initial=await lightbox.locator('img').getAttribute('src'); await page.keyboard.press('ArrowRight'); expect(await lightbox.locator('img').getAttribute('src')).not.toBe(initial); await page.keyboard.press('Escape'); await expect(lightbox).not.toHaveClass(/open/);
});

test('contact form validates and composes a WhatsApp enquiry', async ({ page }) => {
  await page.goto('/contact.html'); const form=page.locator('#quote-form'); await expect(form).toHaveAttribute('action','https://api.whatsapp.com/send'); await page.route('https://wa.me/**',r=>r.abort()); await page.locator('input[name="name"]').fill('QA Tester'); await page.locator('select[name="occasion"]').selectOption({label:'Birthday'});
  const req=page.waitForRequest(r=>r.url().startsWith('https://wa.me/27635409729?text=')); await form.locator('button[type="submit"]').click(); const decoded=decodeURIComponent((await req).url()); expect(decoded).toContain('Name: QA Tester'); expect(decoded).toContain('Occasion: Birthday');
});

test('phone, email and WhatsApp conversion actions are present', async ({ page }) => { await page.goto('/contact.html'); await expect(page.locator('a[href="tel:+27635409729"]')).not.toHaveCount(0); await expect(page.locator('a[href="tel:+27743788958"]')).not.toHaveCount(0); await expect(page.locator('a[href="mailto:tasmaarahcollection@gmail.com"]')).not.toHaveCount(0); await expect(page.locator('.floating-wa')).toHaveAttribute('href',/wa\.me\/27635409729/) });

test('capture visual acceptance evidence after real scrolling', async ({ page }, testInfo) => { fs.mkdirSync('visual-evidence',{recursive:true}); for(const [name,path] of [['home','/index.html'],['about','/about.html'],['collection','/shop.html'],['gallery','/gallery.html'],['contact','/contact.html']]){await page.goto(path,{waitUntil:'domcontentloaded'});await scrollThrough(page);await page.screenshot({path:`visual-evidence/${testInfo.project.name}-${name}.png`,fullPage:true})} });

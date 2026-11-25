import assert from 'node:assert/strict';
import { mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';

const base = process.env.LICENSING_TEST_URL || 'http://127.0.0.1:4173';
const screenshotDir = process.env.LICENSING_SCREENSHOT_DIR;
if (screenshotDir) await mkdir(screenshotDir, { recursive: true });
const paths = ['/licensing/', '/licensing/microsoft-365/', '/licensing/google-workspace/'];
const browser = await chromium.launch({ headless: true });
try {
  for (const colorScheme of ['light', 'dark']) {
    for (const width of [320, 375, 768, 1024, 1440]) {
      const context = await browser.newContext({
        viewport: { width, height: 900 }, colorScheme, reducedMotion: 'reduce'
      });
      try {
        for (const path of paths) {
          const page = await context.newPage();
          const label = colorScheme + ' ' + width + ' ' + path;
          const errors = [];
          page.on('pageerror', error => errors.push(error.message));
          const response = await page.goto(base + path, { waitUntil: 'load' });
          assert.equal(response.status(), 200, label);
          assert.equal(await page.locator('h1').count(), 1, label + ' page title');
          await page.locator('.swa-global-footer').waitFor({ state: 'visible' });
          const expectedBg = colorScheme === 'light' ? 'rgb(255, 255, 255)' : 'rgb(17, 17, 17)';
          assert.equal(await page.locator('body').evaluate(el => getComputedStyle(el).backgroundColor), expectedBg, label + ' body theme');
          assert.equal(await page.locator('.lic-hero').evaluate(el => getComputedStyle(el).backgroundColor), 'rgb(3, 3, 58)', label + ' brand hero');
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1), label + ' horizontal overflow');

          const headerControls = await page.locator('.sk-global-header .sk-icon, .sk-global-header summary').evaluateAll(elements => elements
            .filter(el => el.getClientRects().length)
            .map(el => ({ name: el.getAttribute('aria-label') || el.textContent.trim(), width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height })));
          for (const control of headerControls) {
            assert.ok(control.width >= 44 && control.height >= 44, label + ' 44px target: ' + control.name);
          }
          const logos = await page.locator('.sk-global-brand img').evaluateAll(elements => elements
            .filter(el => el.getClientRects().length)
            .map(el => ({ src: el.getAttribute('src'), width: el.getBoundingClientRect().width, height: el.getBoundingClientRect().height })));
          assert.equal(logos.length, 1, label + ' one visible brand mark');
          assert.equal(logos[0].src, '/assets/logo-' + (colorScheme === 'light' ? 'black' : 'white') + '-header.png', label + ' themed brand mark');
          assert.ok(logos[0].width >= 32 && logos[0].height >= 32, label + ' minimum brand mark size');
          if (screenshotDir && (width === 320 || width === 1440)) {
            const pageName = path.split('/').filter(Boolean).join('-');
            await page.screenshot({ path: `${screenshotDir}/${pageName}-${colorScheme}-${width}.png`, fullPage: true });
          }

          const search = page.getByRole('button', { name: 'Search Skunkworks', exact: true });
          await search.click();
          await page.locator('#sk-search').waitFor({ state: 'visible' });
          await page.locator('#sk-search-input').fill('Licensing');
          assert.ok(await page.locator('#sk-search nav a:visible').count() > 0, label + ' search');
          await page.keyboard.press('Escape');
          await page.locator('#sk-search').waitFor({ state: 'hidden' });
          await page.waitForFunction(() => document.activeElement?.getAttribute('data-sk-open') === 'sk-search');
          assert.equal(await search.evaluate(el => getComputedStyle(el).outlineWidth), '3px', label + ' keyboard focus ring');

          if (width <= 900) {
            const menu = page.getByRole('button', { name: 'Open navigation', exact: true });
            await menu.click();
            await page.locator('#sk-navigation').waitFor({ state: 'visible' });
            assert.ok(await page.locator('#sk-navigation a[href="/licensing/"]').isVisible(), label + ' drawer licensing link');
            await page.keyboard.press('Escape');
            await page.locator('#sk-navigation').waitFor({ state: 'hidden' });
            await page.waitForFunction(() => document.activeElement?.getAttribute('data-sk-open') === 'sk-navigation');
          }

          const theme = page.getByRole('button', { name: 'Switch colour theme', exact: true });
          await theme.click();
          assert.equal(await page.locator('html').getAttribute('data-theme'), colorScheme === 'light' ? 'dark' : 'light', label + ' theme switch');
          await theme.click();
          assert.equal(await page.locator('html').getAttribute('data-theme'), colorScheme, label + ' theme restored');

          const accordion = page.locator('.lic-faq details').first();
          const summary = accordion.locator('summary');
          await summary.focus();
          await page.keyboard.press('Enter');
          assert.ok(await accordion.evaluate(el => el.open), label + ' FAQ keyboard open');
          await page.keyboard.press('Enter');
          assert.ok(!await accordion.evaluate(el => el.open), label + ' FAQ keyboard close');

          if (path !== '/licensing/') {
            const table = page.getByRole('region', { name: 'Vendor reference price comparison' });
            assert.equal(await table.getAttribute('tabindex'), '0', label + ' table keyboard access');
            if (width <= 560) {
              assert.ok(await table.evaluate(el => el.scrollWidth > el.clientWidth), label + ' local table overflow');
            }
          }
          assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1), label + ' final horizontal overflow');
          assert.deepEqual(errors, [], label + ' runtime errors');
          await page.close();
          console.log('PASS ' + label);
        }
      } finally {
        await context.close();
      }
    }
  }
} finally {
  await browser.close();
}

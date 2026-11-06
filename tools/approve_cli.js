// Approve a `cambc login` request headlessly with the saved web session (.auth/state.json).
//   node tools/approve_cli.js <cli-login URL>
const { chromium } = require('playwright-core');
const path = require('path');
const STATE = path.join(__dirname, '..', '.auth', 'state.json');

(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  const context = await browser.newContext({ storageState: STATE });
  const page = await context.newPage();
  await page.goto(process.argv[2], { waitUntil: 'networkidle' });
  await page.waitForTimeout(800);
  const btn = page.getByRole('button', { name: /approve/i });
  if (await btn.count()) {
    await btn.first().click();
    await page.waitForTimeout(2500);
    console.log((await page.evaluate(() => (document.querySelector('main') || document.body).innerText)).includes('Signed in') ? 'APPROVED' : 'CLICKED');
  } else console.log('NO_APPROVE_BUTTON: ' + (await page.evaluate(() => document.body.innerText)).slice(0, 300));
  await browser.close();
})();

// Sign in to the platform and save the session for the other tools.
//   node tools/login.js            visible Brave window; waits up to 15 min for you to log in
//   node tools/login.js --refresh  headless: renew the 12 h event session from the 7-day
//                                  platform session (no interaction); exit 1 if that fails
// Session file: <project>/.auth/state.json (mode 600). Do not share it.
const { chromium } = require('playwright-core');
const fs = require('fs');
const os = require('os');
const path = require('path');

const BASE = 'https://2026a.battlecode.co.uk';
const AUTH_DIR = path.join(__dirname, '..', '.auth');
const STATE = path.join(AUTH_DIR, 'state.json');
const BRAVE = '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser';
const refresh = process.argv.includes('--refresh');

async function loggedIn(context) {
  const res = await context.request.get(BASE + '/api/v1/me', { failOnStatusCode: false });
  return res.status() === 200;
}
function save(context) {
  return context.storageState({ path: STATE }).then(() => fs.chmodSync(STATE, 0o600));
}

(async () => {
  fs.mkdirSync(AUTH_DIR, { recursive: true, mode: 0o700 });
  if (refresh) {
    if (!fs.existsSync(STATE)) { console.log('NO_STATE'); process.exit(1); }
    const browser = await chromium.launch({ channel: 'chrome', headless: true });
    const context = await browser.newContext({ storageState: STATE });
    const page = await context.newPage();
    try {
      await page.goto(BASE + '/api/v1/auth/start?returnTo=%2Fgame%2Fhome', { waitUntil: 'networkidle', timeout: 60000 });
    } catch {}
    const ok = await loggedIn(context);
    if (ok) await save(context);
    console.log(ok ? 'LOGGED_IN' : 'NOT_LOGGED_IN');
    await browser.close();
    process.exit(ok ? 0 : 1);
  }
  const browser = await chromium.launch({ executablePath: BRAVE, headless: false });
  const context = await browser.newContext({ viewport: { width: 1200, height: 900 } });
  const page = await context.newPage();
  await page.goto(BASE + '/api/v1/auth/start?returnTo=%2Fgame%2Fhome');
  console.log('BROWSER_OPEN waiting for sign-in');
  const deadline = Date.now() + 15 * 60 * 1000;
  while (Date.now() < deadline) {
    try {
      if (await loggedIn(context)) {
        await save(context);
        console.log('LOGGED_IN');
        await page.waitForTimeout(1000);
        await browser.close();
        return;
      }
    } catch {}
    await new Promise((r) => setTimeout(r, 3000));
  }
  console.log('TIMEOUT');
  await browser.close();
  process.exit(1);
})();

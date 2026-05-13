const { chromium } = require('playwright');

(async () => {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  await page.goto('https://www.instagram.com/');
  console.log('Hacé login y presioná Enter cuando estés listo...');
  await new Promise(r => process.stdin.once('data', r));

  await context.storageState({ path: 'session.json' });
  console.log('Sesión guardada en session.json');
  await browser.close();
})();


const { chromium } = require('playwright');
const fs = require('fs');

const PROGRESS_FILE = 'progress.json';
const LIKES_FILE = 'liked_posts.json';
const SESSION_FILE = 'session.json';
const LIMIT = parseInt(process.argv[2]) || 10;
const MIN_WAIT = 8000;
const MAX_WAIT = 20000;

function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function rand(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

function loadProgress() {
  if (fs.existsSync(PROGRESS_FILE)) {
    return JSON.parse(fs.readFileSync(PROGRESS_FILE, 'utf8'));
  }
  return { done: [], failed: [] };
}

function saveProgress(p) {
  fs.writeFileSync(PROGRESS_FILE, JSON.stringify(p, null, 2));
}

const likes = JSON.parse(fs.readFileSync(LIKES_FILE, 'utf8'));

const allUrls = likes
  .flatMap(item => item.label_values || [])
  .filter(lv => lv.label === 'URL' && lv.href)
  .map(lv => lv.href);

const progress = loadProgress();
const pending = allUrls
  .filter(u => !progress.done.includes(u) && !progress.failed.includes(u))
  .slice(0, LIMIT);

console.log(`\nTotal en JSON:    ${allUrls.length}`);
console.log(`Ya procesados:    ${progress.done.length}`);
console.log(`Esta sesión:      ${pending.length}`);
console.log(`Pendientes total: ${allUrls.length - progress.done.length - progress.failed.length}\n`);

(async () => {
  const browser = await chromium.launch({
    headless: false,
    args: ['--disable-blink-features=AutomationControlled']
  });

  const context = await browser.newContext({
    storageState: SESSION_FILE,
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36',
    viewport: { width: 1280, height: 800 },
    locale: 'es-AR',
  });

  const page = await context.newPage();

  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
  });

  for (let i = 0; i < pending.length; i++) {
    const url = pending[i];
    console.log(`\n[${i + 1}/${pending.length}] ${url}`);

    try {
      // Reintentos de carga
      let loaded = false;
      for (let attempt = 0; attempt < 3; attempt++) {
        try {
          await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 20000 });
          loaded = true;
          break;
        } catch {
          console.log(`  Reintentando carga (${attempt + 1}/3)...`);
          await sleep(3000);
        }
      }

      if (!loaded) {
        progress.failed.push(url);
        console.log(`  ✗ No se pudo cargar la página`);
        saveProgress(progress);
        continue;
      }

      try {
        await page.waitForSelector('svg[aria-label="Ya no me gusta"], svg[aria-label="Unlike"]', { timeout: 8000 });
      } catch { }

      await sleep(rand(1500, 2500));

      await page.mouse.move(rand(300, 700), rand(200, 500));
      await sleep(rand(200, 500));
      await page.mouse.move(rand(400, 600), rand(300, 450));
      await sleep(rand(100, 300));

      const likedBtn = page.locator('svg[aria-label="Ya no me gusta"], svg[aria-label="Unlike"]').first();

      if (await likedBtn.count() > 0) {
        await likedBtn.click();
        progress.done.push(url);
        console.log(`  ✓ Unlike OK`);
      } else {
        console.log(`  - Corazón no encontrado, queda pendiente`);
      }

    } catch (e) {
      progress.failed.push(url);
      console.log(`  ✗ Error: ${e.message}`);
    }

    saveProgress(progress);

    if (i < pending.length - 1) {
      const wait = rand(MIN_WAIT, MAX_WAIT);
      console.log(`  Esperando ${(wait / 1000).toFixed(1)}s...`);
      await sleep(wait);
    }
  }

  console.log(`\n✓ Sesión terminada.`);
  console.log(`Procesados hoy: ${pending.length} | Total acumulado: ${progress.done.length} | Fallos: ${progress.failed.length}`);
  await browser.close();
})();

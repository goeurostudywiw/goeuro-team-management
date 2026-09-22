const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const screenshotsDir = 'C:\\Users\\Thet Htoo Naing\\.gemini\\antigravity\\brain\\ad6b1c16-c82d-4d0a-81f1-d4728fdef91e\\screenshots';
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function capture() {
  console.log('Launching browser with Edge executable...');
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  // 1. Capture Login Page (Desktop & Mobile)
  const loginPageDesktop = await browser.newPage();
  await loginPageDesktop.setViewport({ width: 1440, height: 900 });
  await loginPageDesktop.goto('http://localhost:3005/login', { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise((res) => setTimeout(res, 800));
  await loginPageDesktop.screenshot({ path: path.join(screenshotsDir, 'login_desktop.png'), fullPage: false });
  console.log('Saved screenshot to: login_desktop.png');
  await loginPageDesktop.close();

  const loginPageMobile = await browser.newPage();
  await loginPageMobile.setViewport({ width: 390, height: 844, isMobile: true });
  await loginPageMobile.goto('http://localhost:3005/login', { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise((res) => setTimeout(res, 800));
  await loginPageMobile.screenshot({ path: path.join(screenshotsDir, 'login_mobile.png'), fullPage: false });
  console.log('Saved screenshot to: login_mobile.png');
  await loginPageMobile.close();

  // 2. Obtain an authenticated session for Admin THN
  const authPage = await browser.newPage();
  await authPage.goto('http://localhost:3005/login', { waitUntil: 'networkidle0' });
  // Type credentials
  await authPage.type('input[type="email"]', 'thn@goeuro.de');
  await authPage.type('input[type="password"]', 'Goeuro2026!');
  await Promise.all([
    authPage.waitForNavigation({ waitUntil: 'networkidle0' }),
    authPage.click('button[type="submit"]'),
  ]);
  const cookies = await authPage.cookies();
  await authPage.close();

  // 3. Capture all protected routes using the session cookies
  const protectedRoutes = [
    { name: 'dashboard_desktop', url: 'http://localhost:3005/dashboard', width: 1440, height: 900 },
    { name: 'dashboard_mobile', url: 'http://localhost:3005/dashboard', width: 390, height: 844, isMobile: true },
    { name: 'tasks_desktop', url: 'http://localhost:3005/tasks', width: 1440, height: 900 },
    { name: 'marketing_desktop', url: 'http://localhost:3005/marketing', width: 1440, height: 900 },
    { name: 'leads_desktop', url: 'http://localhost:3005/leads', width: 1440, height: 900 },
    { name: 'integrations_desktop', url: 'http://localhost:3005/integrations', width: 1440, height: 900 },
    { name: 'integrations_mobile', url: 'http://localhost:3005/integrations', width: 390, height: 844, isMobile: true },
    { name: 'cases_desktop', url: 'http://localhost:3005/cases', width: 1440, height: 900 },
    { name: 'knowledge_desktop', url: 'http://localhost:3005/knowledge', width: 1440, height: 900 },
    { name: 'settings_desktop', url: 'http://localhost:3005/settings', width: 1440, height: 900 },
    { name: 'inquiry_desktop', url: 'http://localhost:3005/inquiry', width: 1440, height: 900 },
    { name: 'inquiry_mobile', url: 'http://localhost:3005/inquiry', width: 390, height: 844, isMobile: true },
  ];

  for (const r of protectedRoutes) {
    const page = await browser.newPage();
    if (cookies.length > 0) {
      await page.setCookie(...cookies);
    }
    await page.setViewport({
      width: r.width,
      height: r.height,
      isMobile: !!r.isMobile,
    });

    console.log(`Navigating to ${r.url} [${r.name}]...`);
    await page.goto(r.url, { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise((res) => setTimeout(res, 800));

    const filePath = path.join(screenshotsDir, `${r.name}.png`);
    await page.screenshot({ path: filePath, fullPage: false });
    console.log(`Saved screenshot to: ${filePath}`);
    await page.close();
  }

  // 4. Capture Command Palette Modal
  const cpPage = await browser.newPage();
  if (cookies.length > 0) await cpPage.setCookie(...cookies);
  await cpPage.setViewport({ width: 1440, height: 900 });
  await cpPage.goto('http://localhost:3005/dashboard', { waitUntil: 'networkidle0' });
  await cpPage.evaluate(() => window.dispatchEvent(new CustomEvent('open_command_palette')));
  await new Promise((res) => setTimeout(res, 500));
  const cpPath = path.join(screenshotsDir, 'command_palette.png');
  await cpPage.screenshot({ path: cpPath, fullPage: false });
  console.log(`Saved screenshot to: ${cpPath}`);
  await cpPage.close();

  await browser.close();
  console.log('All screenshots captured successfully!');
}

capture().catch((err) => {
  console.error('Screenshot error:', err);
  process.exit(1);
});

const puppeteer = require('puppeteer-core');
const path = require('path');

const screenshotsDir = 'C:\\Users\\Thet Htoo Naing\\.gemini\\antigravity\\brain\\ad6b1c16-c82d-4d0a-81f1-d4728fdef91e\\screenshots';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--window-size=1440,900'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // Login as Viewer (viewer@partner.de)
    console.log('Logging in as restricted Viewer...');
    await page.goto('http://localhost:3005/login', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    // Clear and type credentials
    await page.type('input[type="email"]', 'viewer@partner.de');
    await page.type('input[type="password"]', 'Goeuro2026!');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2' }).catch(() => {});
    await new Promise(r => setTimeout(r, 1500));

    // Visit /finance
    await page.goto('http://localhost:3005/finance', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(screenshotsDir, 'finance_restricted_view.png') });
    console.log('Saved finance_restricted_view.png');

    await page.close();
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
}

main();

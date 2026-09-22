const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const screenshotsDir = 'C:\\Users\\Thet Htoo Naing\\.gemini\\antigravity\\brain\\ad6b1c16-c82d-4d0a-81f1-d4728fdef91e\\screenshots';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function main() {
  console.log('--- Verifying Navbar Overlap Fix ---');
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    // Use exact viewport from user screenshot
    await page.setViewport({ width: 1440, height: 900 });

    // Authenticate as Founder
    await page.goto('http://localhost:3005/login', { waitUntil: 'networkidle0', timeout: 15000 });
    await page.type('input[type="email"]', 'thn@goeuro.de');
    await page.type('input[type="password"]', 'Goeuro2026!');
    await Promise.all([
      page.waitForNavigation({ waitUntil: 'networkidle0' }),
      page.click('button[type="submit"]'),
    ]);

    // Go to dashboard
    await page.goto('http://localhost:3005/dashboard', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise((r) => setTimeout(r, 1200));

    // Capture full header and top cards
    await page.screenshot({
      path: path.join(screenshotsDir, 'navbar_overlap_fixed.png'),
      clip: { x: 0, y: 0, width: 1440, height: 450 }
    });
    console.log('Saved: navbar_overlap_fixed.png');

    // Also test responsive 1280px screen
    await page.setViewport({ width: 1280, height: 900 });
    await new Promise((r) => setTimeout(r, 800));
    await page.screenshot({
      path: path.join(screenshotsDir, 'navbar_overlap_fixed_1280.png'),
      clip: { x: 0, y: 0, width: 1280, height: 450 }
    });
    console.log('Saved: navbar_overlap_fixed_1280.png');

    await page.close();
  } catch (err) {
    console.error(err);
  } finally {
    await browser.close();
  }
}

main();

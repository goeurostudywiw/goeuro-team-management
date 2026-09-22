const puppeteer = require('puppeteer-core');
const path = require('path');

const screenshotsDir = 'C:\\Users\\Thet Htoo Naing\\.gemini\\antigravity\\brain\\ad6b1c16-c82d-4d0a-81f1-d4728fdef91e\\screenshots';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function main() {
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });
    await page.goto('http://localhost:3005/', { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(screenshotsDir, 'public_landing_clean.png') });
    console.log('Saved public_landing_clean.png');
    await page.close();
  } finally {
    await browser.close();
  }
}

main();

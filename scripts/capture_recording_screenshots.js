const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const screenshotsDir = 'C:\\Users\\Thet Htoo Naing\\.gemini\\antigravity\\brain\\ad6b1c16-c82d-4d0a-81f1-d4728fdef91e\\screenshots';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function run() {
  console.log('Launching browser to capture recording & snapshot modal...');
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
  });

  const authPage = await browser.newPage();
  await authPage.setViewport({ width: 1440, height: 1100 });
  await authPage.goto('http://localhost:3005/login', { waitUntil: 'networkidle0' });
  await authPage.type('input[type="email"]', 'thn@goeuro.de');
  await authPage.type('input[type="password"]', 'Goeuro2026!');
  await Promise.all([
    authPage.waitForNavigation({ waitUntil: 'networkidle0' }),
    authPage.click('button[type="submit"]'),
  ]);

  await authPage.goto('http://localhost:3005/leads', { waitUntil: 'networkidle0' });
  await new Promise((res) => setTimeout(res, 2000));

  // Switch to List View
  await authPage.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const listBtn = btns.find((b) => b.textContent.trim() === 'List');
    if (listBtn) listBtn.click();
  });
  await new Promise((res) => setTimeout(res, 1000));

  // Click "Manage & Convert" on the first student lead
  await authPage.evaluate(() => {
    const btns = Array.from(document.querySelectorAll('button'));
    const manageBtn = btns.find((b) => b.textContent.includes('Manage & Convert'));
    if (manageBtn) manageBtn.click();
  });
  await new Promise((res) => setTimeout(res, 1800));

  const modalPath = path.join(screenshotsDir, 'lead_modal_recording_playback.png');
  await authPage.screenshot({ path: modalPath, fullPage: false });
  console.log('Saved modal screenshot to:', modalPath);

  await authPage.close();
  await browser.close();
  console.log('Done capturing modal!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

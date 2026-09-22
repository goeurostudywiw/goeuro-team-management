const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const screenshotsDir = 'C:\\Users\\Thet Htoo Naing\\.gemini\\antigravity\\brain\\ad6b1c16-c82d-4d0a-81f1-d4728fdef91e\\screenshots';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function run() {
  console.log('Launching browser to capture meeting screenshots...');
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--use-fake-ui-for-media-stream', '--use-fake-device-for-media-stream'],
  });

  // 1. Capture Counselor Consultation Room (Desktop)
  const counselorPage = await browser.newPage();
  await counselorPage.setViewport({ width: 1440, height: 900 });
  await counselorPage.goto('http://localhost:3005/meeting/consult-sample-lead?role=counselor', { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise((res) => setTimeout(res, 1200));
  const counselorPath = path.join(screenshotsDir, 'meeting_counselor.png');
  await counselorPage.screenshot({ path: counselorPath, fullPage: false });
  console.log('Saved screenshot to:', counselorPath);
  await counselorPage.close();

  // 2. Capture Student View (Mobile Viewport)
  const studentPage = await browser.newPage();
  await studentPage.setViewport({ width: 390, height: 844, isMobile: true });
  await studentPage.goto('http://localhost:3005/meeting/consult-sample-lead?role=student', { waitUntil: 'networkidle0', timeout: 15000 });
  await new Promise((res) => setTimeout(res, 1200));
  const studentPath = path.join(screenshotsDir, 'meeting_student.png');
  await studentPage.screenshot({ path: studentPath, fullPage: false });
  console.log('Saved screenshot to:', studentPath);
  await studentPage.close();

  // 3. Capture Lead Detail Modal with In-House Video Launcher
  const authPage = await browser.newPage();
  await authPage.setViewport({ width: 1440, height: 900 });
  await authPage.goto('http://localhost:3005/login', { waitUntil: 'networkidle0' });
  await authPage.type('input[type="email"]', 'thn@goeuro.de');
  await authPage.type('input[type="password"]', 'Goeuro2026!');
  await Promise.all([
    authPage.waitForNavigation({ waitUntil: 'networkidle0' }),
    authPage.click('button[type="submit"]'),
  ]);
  
  await authPage.goto('http://localhost:3005/leads', { waitUntil: 'networkidle0' });
  await authPage.waitForSelector('h4', { timeout: 10000 });
  await authPage.click('h4');
  await new Promise((res) => setTimeout(res, 1000));
  const modalPath = path.join(screenshotsDir, 'lead_modal_video_launcher.png');
  await authPage.screenshot({ path: modalPath, fullPage: false });
  console.log('Saved screenshot to:', modalPath);
  await authPage.close();

  await browser.close();
  console.log('All meeting screenshots captured successfully!');
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});

const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const screenshotsDir = 'C:\\Users\\Thet Htoo Naing\\.gemini\\antigravity\\brain\\ad6b1c16-c82d-4d0a-81f1-d4728fdef91e\\screenshots';
const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function main() {
  console.log('--- Verifying Video Consultation Room Fix ---');
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--use-fake-ui-for-media-stream',
      '--use-fake-device-for-media-stream',
      '--autoplay-policy=no-user-gesture-required'
    ],
  });

  try {
    const page = await browser.newPage();
    await page.setViewport({ width: 1440, height: 900 });

    // Navigate directly to video consultation room
    console.log('Opening meeting room as counselor...');
    await page.goto('http://localhost:3005/meeting/consult-demo-live?role=counselor', {
      waitUntil: 'networkidle2',
      timeout: 20000,
    });

    // Wait 3 seconds for media stream initialization and canvas/video rendering
    await new Promise((r) => setTimeout(r, 3500));

    // Capture full video consultation screen
    const screenshotPath = path.join(screenshotsDir, 'video_consultation_room_active.png');
    await page.screenshot({
      path: screenshotPath,
      fullPage: false,
    });
    console.log('Saved screenshot:', screenshotPath);

    // Test clicking Snapshot button ("လူစုံပါက SS ရိုက်ခြင်း / Proof")
    console.log('Testing attendance snapshot button...');
    const snapshotBtn = await page.$('button[title*="Capture Consultation Attendance Snapshot"]');
    if (snapshotBtn) {
      await snapshotBtn.click();
      await new Promise((r) => setTimeout(r, 2000));
      const snapshotTestPath = path.join(screenshotsDir, 'video_consultation_snapshot_test.png');
      await page.screenshot({ path: snapshotTestPath });
      console.log('Saved snapshot test:', snapshotTestPath);
    }

    await page.close();
  } catch (err) {
    console.error('Error during video test:', err);
  } finally {
    await browser.close();
  }
}

main();

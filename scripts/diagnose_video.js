const puppeteer = require('puppeteer-core');
const path = require('path');

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function testVideo() {
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
    page.on('console', msg => console.log('PAGE CONSOLE:', msg.text()));
    page.on('pageerror', err => console.log('PAGE ERROR:', err));

    await page.goto('http://localhost:3005/meeting/consult-debug-room?role=counselor', {
      waitUntil: 'networkidle2',
      timeout: 15000,
    });

    await new Promise(r => setTimeout(r, 3000));

    const videoStatus = await page.evaluate(() => {
      const videos = Array.from(document.querySelectorAll('video'));
      return videos.map((v, i) => ({
        index: i,
        className: v.className,
        hasSrcObject: !!v.srcObject,
        srcObjectTracks: v.srcObject ? (v.srcObject).getTracks().map(t => ({ kind: t.kind, enabled: t.enabled, readyState: t.readyState })) : [],
        videoWidth: v.videoWidth,
        videoHeight: v.videoHeight,
        paused: v.paused,
        readyState: v.readyState,
        currentTime: v.currentTime,
      }));
    });

    console.log('Video Elements Diagnostics:', JSON.stringify(videoStatus, null, 2));

    await page.close();
  } catch (err) {
    console.error('Test error:', err);
  } finally {
    await browser.close();
  }
}

testVideo();

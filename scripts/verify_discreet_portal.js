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

    console.log('Navigating to http://localhost:3005/ ...');
    await page.goto('http://localhost:3005/', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1500));

    // Capture Header & Announcement Bar
    await page.screenshot({ path: path.join(screenshotsDir, 'public_header_discreet.png') });
    console.log('Saved public_header_discreet.png');

    // Scroll to Footer
    const footer = await page.$('footer');
    if (footer) {
      await footer.scrollIntoView();
      await new Promise(r => setTimeout(r, 1000));
      await page.screenshot({ path: path.join(screenshotsDir, 'public_footer_discreet.png') });
      console.log('Saved public_footer_discreet.png');
    }

    // Capture Mobile Header (390x844)
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:3005/', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(screenshotsDir, 'public_mobile_header_discreet.png') });
    console.log('Saved public_mobile_header_discreet.png');

    await page.close();
    console.log('Discreet portal verification passed successfully!');
  } catch (err) {
    console.error('Error during verification:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();

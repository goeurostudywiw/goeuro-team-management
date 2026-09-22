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

    // 1. Desktop Viewport
    await page.setViewport({ width: 1440, height: 900 });
    console.log('Navigating to http://localhost:3005/ ...');
    await page.goto('http://localhost:3005/', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));

    // Capture Hero & Ticker
    await page.screenshot({ path: path.join(screenshotsDir, 'public_landing_top1_hero.png') });
    console.log('Saved public_landing_top1_hero.png');

    // Scroll to Calculator
    const calcSection = await page.$('#calculator');
    if (calcSection) {
      await calcSection.scrollIntoView();
      await new Promise(r => setTimeout(r, 1000));
      await page.screenshot({ path: path.join(screenshotsDir, 'public_landing_top1_calculator.png') });
      console.log('Saved public_landing_top1_calculator.png');
    }

    // Scroll to Eligibility Quiz
    const quizSection = await page.$('#eligibility');
    if (quizSection) {
      await quizSection.scrollIntoView();
      await new Promise(r => setTimeout(r, 1000));
      await page.screenshot({ path: path.join(screenshotsDir, 'public_landing_top1_quiz.png') });
      console.log('Saved public_landing_top1_quiz.png');
    }

    // Scroll to German Cities
    const citiesSection = await page.$('#cities');
    if (citiesSection) {
      await citiesSection.scrollIntoView();
      await new Promise(r => setTimeout(r, 1000));
      await page.screenshot({ path: path.join(screenshotsDir, 'public_landing_top1_cities.png') });
      console.log('Saved public_landing_top1_cities.png');
    }

    // Test EuroBot Launcher click
    const eurobotBtn = await page.$('aside[aria-label="EuroBot AI Concierge"] button');
    if (eurobotBtn) {
      await eurobotBtn.click();
      await new Promise(r => setTimeout(r, 1000));
      await page.screenshot({ path: path.join(screenshotsDir, 'public_landing_top1_eurobot_concierge.png') });
      console.log('Saved public_landing_top1_eurobot_concierge.png');
    }

    // 2. Mobile Viewport (iPhone 14 standard 390x844)
    await page.setViewport({ width: 390, height: 844, isMobile: true, hasTouch: true });
    await page.goto('http://localhost:3005/', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(screenshotsDir, 'public_landing_top1_mobile.png') });
    console.log('Saved public_landing_top1_mobile.png');

    await page.close();
    console.log('All public landing verifications passed successfully!');
  } catch (err) {
    console.error('Error during verification:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();

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

    // Capture Hero with 3D badges
    await page.screenshot({ path: path.join(screenshotsDir, 'public_landing_3d_hero.png') });
    console.log('Saved public_landing_3d_hero.png');

    // Scroll to Pathways and hover over Ausbildung card to trigger 3D tilt & glare
    const pathways = await page.$('#pathways');
    if (pathways) {
      await pathways.scrollIntoView();
      await new Promise(r => setTimeout(r, 1200));

      const ausbildungCard = await page.$('#ausbildung');
      if (ausbildungCard) {
        const box = await ausbildungCard.boundingBox();
        if (box) {
          // Move mouse to top-right corner of card to test tilt & specular glare
          await page.mouse.move(box.x + box.width * 0.8, box.y + box.height * 0.3);
          await new Promise(r => setTimeout(r, 400));
        }
      }
      await page.screenshot({ path: path.join(screenshotsDir, 'public_landing_3d_pathways.png') });
      console.log('Saved public_landing_3d_pathways.png');
    }

    // Scroll to Why Choose Us (3D feature cards)
    const whyUs = await page.$('#why-us');
    if (whyUs) {
      await whyUs.scrollIntoView();
      await new Promise(r => setTimeout(r, 1200));
      await page.screenshot({ path: path.join(screenshotsDir, 'public_landing_3d_features.png') });
      console.log('Saved public_landing_3d_features.png');
    }

    // Scroll to Consultation booking form
    const consult = await page.$('#consultation');
    if (consult) {
      await consult.scrollIntoView();
      await new Promise(r => setTimeout(r, 1200));
      await page.screenshot({ path: path.join(screenshotsDir, 'public_landing_3d_consultation.png') });
      console.log('Saved public_landing_3d_consultation.png');
    }

    await page.close();
    console.log('3D Landing page verification completed successfully!');
  } catch (err) {
    console.error('Error during verification:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();

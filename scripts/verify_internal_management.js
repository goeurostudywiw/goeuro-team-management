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

    // 1. Visit Login page
    console.log('Navigating to http://localhost:3005/login ...');
    await page.goto('http://localhost:3005/login', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(screenshotsDir, 'internal_login_screen.png') });
    console.log('Saved internal_login_screen.png');

    // 2. Click Founder Quick Login by evaluating DOM
    const clicked = await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const founderBtn = btns.find(b => b.innerText.includes('Thet Htoo Naing') || b.innerText.includes('Founder'));
      if (founderBtn) {
        founderBtn.click();
        return true;
      }
      return false;
    });

    if (clicked) {
      console.log('Clicked Founder quick login button');
    } else {
      console.log('Submitting credentials manually');
      await page.type('input[type="email"]', 'thn@goeuro.de');
      await page.type('input[type="password"]', 'Goeuro2026!');
      await page.click('button[type="submit"]');
    }

    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 2000));

    // 3. Capture Dashboard
    await page.screenshot({ path: path.join(screenshotsDir, 'internal_dashboard_pro.png') });
    console.log('Saved internal_dashboard_pro.png');

    // 4. Capture Leads CRM
    await page.goto('http://localhost:3005/leads', { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(screenshotsDir, 'internal_leads_crm.png') });
    console.log('Saved internal_leads_crm.png');

    // 5. Capture Cases Management
    await page.goto('http://localhost:3005/cases', { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(screenshotsDir, 'internal_cases_management.png') });
    console.log('Saved internal_cases_management.png');

    // 6. Capture Guidelines Hub
    await page.goto('http://localhost:3005/guidelines', { waitUntil: 'networkidle2', timeout: 15000 });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(screenshotsDir, 'internal_guidelines_hub.png') });
    console.log('Saved internal_guidelines_hub.png');

    await page.close();
    console.log('All internal management verifications completed successfully!');
  } catch (err) {
    console.error('Error during internal verification:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();

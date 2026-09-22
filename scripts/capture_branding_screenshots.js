const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const screenshotsDir = 'C:\\Users\\Thet Htoo Naing\\.gemini\\antigravity\\brain\\ad6b1c16-c82d-4d0a-81f1-d4728fdef91e\\screenshots';
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function main() {
  console.log('--- Capturing Corporate Brand & 3-Tier Screenshots ---');
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    // 1. Public Corporate Landing Page (Desktop)
    console.log('Capturing Public Landing Page...');
    const pagePublic = await browser.newPage();
    await pagePublic.setViewport({ width: 1440, height: 950 });
    await pagePublic.goto('http://localhost:3005/', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise((r) => setTimeout(r, 1200));
    await pagePublic.screenshot({ path: path.join(screenshotsDir, 'public_landing_desktop.png') });
    console.log('Saved: public_landing_desktop.png');

    // 2. Public Corporate Landing Page (Mobile)
    await pagePublic.setViewport({ width: 390, height: 844, isMobile: true });
    await new Promise((r) => setTimeout(r, 500));
    await pagePublic.screenshot({ path: path.join(screenshotsDir, 'public_landing_mobile.png') });
    console.log('Saved: public_landing_mobile.png');
    await pagePublic.close();

    // 3. Members Only Workspace Login Page with 3-Tier Profiles
    console.log('Capturing Members Only Login Page...');
    const pageLogin = await browser.newPage();
    await pageLogin.setViewport({ width: 1440, height: 950 });
    await pageLogin.goto('http://localhost:3005/login', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise((r) => setTimeout(r, 1000));
    await pageLogin.screenshot({ path: path.join(screenshotsDir, 'members_login_desktop.png') });
    console.log('Saved: members_login_desktop.png');

    // 4. Authenticate as Founder THN
    await pageLogin.type('input[type="email"]', 'thn@goeuro.de');
    await pageLogin.type('input[type="password"]', 'Goeuro2026!');
    await Promise.all([
      pageLogin.waitForNavigation({ waitUntil: 'networkidle0' }),
      pageLogin.click('button[type="submit"]'),
    ]);
    const cookies = await pageLogin.cookies();
    await pageLogin.close();

    // 5. Dashboard with Official Branding
    console.log('Capturing Dashboard...');
    const pageDash = await browser.newPage();
    await pageDash.setCookie(...cookies);
    await pageDash.setViewport({ width: 1440, height: 900 });
    await pageDash.goto('http://localhost:3005/dashboard', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise((r) => setTimeout(r, 1000));
    await pageDash.screenshot({ path: path.join(screenshotsDir, 'dashboard_official_brand.png') });
    console.log('Saved: dashboard_official_brand.png');
    await pageDash.close();

    // 6. Settings Page: 3-Tier Governance Tab
    console.log('Capturing Settings 3-Tier Governance Tab...');
    const pageSettings = await browser.newPage();
    await pageSettings.setCookie(...cookies);
    await pageSettings.setViewport({ width: 1440, height: 950 });
    await pageSettings.goto('http://localhost:3005/settings', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise((r) => setTimeout(r, 1200));
    await pageSettings.screenshot({ path: path.join(screenshotsDir, 'settings_3tier_governance.png') });
    console.log('Saved: settings_3tier_governance.png');

    // Click Brand Tab
    await pageSettings.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const brandBtn = buttons.find((b) => b.textContent && (b.textContent.includes('Brand & Mascot') || b.textContent.includes('🎨')));
      if (brandBtn) brandBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1200));
    await pageSettings.screenshot({ path: path.join(screenshotsDir, 'settings_brand_styleguide.png') });
    console.log('Saved: settings_brand_styleguide.png');
    await pageSettings.close();

    console.log('All branding screenshots captured successfully!');
  } catch (err) {
    console.error('Error during screenshot capture:', err);
  } finally {
    await browser.close();
  }
}

main();

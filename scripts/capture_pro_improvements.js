const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const screenshotsDir = 'C:\\Users\\Thet Htoo Naing\\.gemini\\antigravity\\brain\\ad6b1c16-c82d-4d0a-81f1-d4728fdef91e\\screenshots';
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function main() {
  console.log('--- Capturing Pro Improvements Screenshots ---');
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    // 1. Public Portal with FAQ & EuroBot Quick Connect
    console.log('1. Capturing Public Landing Page FAQ & Mascot...');
    const pagePublic = await browser.newPage();
    await pagePublic.setViewport({ width: 1440, height: 950 });
    await pagePublic.goto('http://localhost:3005/', { waitUntil: 'networkidle0', timeout: 15000 });
    // Scroll down to FAQ section
    await pagePublic.evaluate(() => {
      const faqHeader = Array.from(document.querySelectorAll('h2')).find(h => h.textContent.includes('Frequently Asked Questions') || h.textContent.includes('FAQ'));
      if (faqHeader) {
        faqHeader.scrollIntoView({ behavior: 'instant', block: 'start' });
      }
    });
    await new Promise((r) => setTimeout(r, 1000));
    await pagePublic.screenshot({ path: path.join(screenshotsDir, 'public_landing_faq.png') });
    console.log('Saved: public_landing_faq.png');
    await pagePublic.close();

    // 2. Login as Founder
    console.log('2. Authenticating...');
    const pageLogin = await browser.newPage();
    await pageLogin.setViewport({ width: 1440, height: 950 });
    await pageLogin.goto('http://localhost:3005/login', { waitUntil: 'networkidle0', timeout: 15000 });
    await pageLogin.type('input[type="email"]', 'thn@goeuro.de');
    await pageLogin.type('input[type="password"]', 'Goeuro2026!');
    await Promise.all([
      pageLogin.waitForNavigation({ waitUntil: 'networkidle0' }),
      pageLogin.click('button[type="submit"]'),
    ]);
    const cookies = await pageLogin.cookies();
    await pageLogin.close();

    // 3. Dashboard with Conversion Funnel & Quick Action bar
    console.log('3. Capturing Dashboard Pro Funnel & Quick Actions...');
    const pageDash = await browser.newPage();
    await pageDash.setCookie(...cookies);
    await pageDash.setViewport({ width: 1440, height: 950 });
    await pageDash.goto('http://localhost:3005/dashboard', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise((r) => setTimeout(r, 1200));
    await pageDash.screenshot({ path: path.join(screenshotsDir, 'dashboard_pro_funnel.png') });
    console.log('Saved: dashboard_pro_funnel.png');
    await pageDash.close();

    // 4. Leads Page with Metric Ribbon & Export CSV
    console.log('4. Capturing Leads Pro Ribbon & Export CSV...');
    const pageLeads = await browser.newPage();
    await pageLeads.setCookie(...cookies);
    await pageLeads.setViewport({ width: 1440, height: 950 });
    await pageLeads.goto('http://localhost:3005/leads', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise((r) => setTimeout(r, 1200));
    await pageLeads.screenshot({ path: path.join(screenshotsDir, 'leads_pro_ribbon.png') });
    console.log('Saved: leads_pro_ribbon.png');

    // 5. Open Add Lead Modal
    console.log('5. Capturing Add Lead Modal...');
    await pageLeads.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const addBtn = btns.find(b => b.textContent && b.textContent.includes('Add Student Lead'));
      if (addBtn) addBtn.click();
    });
    await new Promise((r) => setTimeout(r, 800));
    await pageLeads.screenshot({ path: path.join(screenshotsDir, 'leads_add_lead_modal.png') });
    console.log('Saved: leads_add_lead_modal.png');
    await pageLeads.close();

    // 6. Cases Page with Lifecycle Ribbon & Export CSV
    console.log('6. Capturing Cases Pro Ribbon & Export CSV...');
    const pageCases = await browser.newPage();
    await pageCases.setCookie(...cookies);
    await pageCases.setViewport({ width: 1440, height: 950 });
    await pageCases.goto('http://localhost:3005/cases', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise((r) => setTimeout(r, 1200));
    await pageCases.screenshot({ path: path.join(screenshotsDir, 'cases_pro_ribbon.png') });
    console.log('Saved: cases_pro_ribbon.png');

    // 7. Open Direct Case Enrollment Modal
    console.log('7. Capturing Direct Case Enrollment Modal...');
    await pageCases.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const enrollBtn = btns.find(b => b.textContent && b.textContent.includes('Enroll New Student'));
      if (enrollBtn) enrollBtn.click();
    });
    await new Promise((r) => setTimeout(r, 800));
    await pageCases.screenshot({ path: path.join(screenshotsDir, 'cases_enroll_modal.png') });
    console.log('Saved: cases_enroll_modal.png');
    await pageCases.close();

    console.log('All pro improvement screenshots captured successfully!');
  } catch (err) {
    console.error('Error during screenshot capture:', err);
  } finally {
    await browser.close();
  }
}

main();

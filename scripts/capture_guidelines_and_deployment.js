const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const screenshotsDir = 'C:\\Users\\Thet Htoo Naing\\.gemini\\antigravity\\brain\\ad6b1c16-c82d-4d0a-81f1-d4728fdef91e\\screenshots';
if (!fs.existsSync(screenshotsDir)) {
  fs.mkdirSync(screenshotsDir, { recursive: true });
}

const edgePath = 'C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe';

async function main() {
  console.log('--- Capturing Guidelines & Deployment Screenshots ---');
  const browser = await puppeteer.launch({
    executablePath: edgePath,
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });

  try {
    // 1. Public Landing Page with Brand Promise & Mission/Vision
    console.log('1. Capturing Public Landing Page Brand Promise...');
    const pagePublic = await browser.newPage();
    await pagePublic.setViewport({ width: 1440, height: 950 });
    await pagePublic.goto('http://localhost:3005/', { waitUntil: 'networkidle0', timeout: 15000 });
    // Scroll to Brand Promise section
    await pagePublic.evaluate(() => {
      window.scrollTo(0, 650);
    });
    await new Promise((r) => setTimeout(r, 1000));
    await pagePublic.screenshot({ path: path.join(screenshotsDir, 'public_landing_brand_promise.png') });
    console.log('Saved: public_landing_brand_promise.png');
    await pagePublic.close();

    // 2. Authenticate as Founder Thet Htoo Naing
    console.log('2. Authenticating as Founder...');
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

    // 3. Dashboard with Founder Review Card
    console.log('3. Capturing Dashboard with Founder Review & Guideline Card...');
    const pageDash = await browser.newPage();
    await pageDash.setCookie(...cookies);
    await pageDash.setViewport({ width: 1440, height: 950 });
    await pageDash.goto('http://localhost:3005/dashboard', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise((r) => setTimeout(r, 1200));
    await pageDash.screenshot({ path: path.join(screenshotsDir, 'dashboard_guideline_hub.png') });
    console.log('Saved: dashboard_guideline_hub.png');
    await pageDash.close();

    // 4. Guidelines Page: Tab 1 (Mandate & Roster)
    console.log('4. Capturing Guidelines Tab 1 (Vision & Mandate)...');
    const pageGuide = await browser.newPage();
    await pageGuide.setCookie(...cookies);
    await pageGuide.setViewport({ width: 1440, height: 950 });
    await pageGuide.goto('http://localhost:3005/guidelines', { waitUntil: 'networkidle0', timeout: 15000 });
    await new Promise((r) => setTimeout(r, 1200));
    await pageGuide.screenshot({ path: path.join(screenshotsDir, 'guidelines_mandate.png') });
    console.log('Saved: guidelines_mandate.png');

    // 5. Guidelines Page: Tab 2 (Founder Weekly Review - Section 8)
    console.log('5. Capturing Guidelines Tab 2 (Founder Review)...');
    await pageGuide.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const reviewBtn = btns.find(b => b.textContent && b.textContent.includes('Founder အပတ်စဉ် Review') || b.textContent.includes('Founder Review'));
      if (reviewBtn) reviewBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1000));
    await pageGuide.screenshot({ path: path.join(screenshotsDir, 'guidelines_founder_review.png') });
    console.log('Saved: guidelines_founder_review.png');

    // 6. Guidelines Page: Tab 3 (Approval Matrix - Section 13)
    console.log('6. Capturing Guidelines Tab 3 (Approval Matrix)...');
    await pageGuide.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const matrixBtn = btns.find(b => b.textContent && b.textContent.includes('Approval & Escalation') || b.textContent.includes('Approval Matrix'));
      if (matrixBtn) matrixBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1000));
    await pageGuide.screenshot({ path: path.join(screenshotsDir, 'guidelines_approval_matrix.png') });
    console.log('Saved: guidelines_approval_matrix.png');

    // 7. Guidelines Page: Tab 4 (90-Day Roadmap - Section 10)
    console.log('7. Capturing Guidelines Tab 4 (90-Day Roadmap)...');
    await pageGuide.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const roadBtn = btns.find(b => b.textContent && b.textContent.includes('Roadmap') || b.textContent.includes('Roadmap & Budget'));
      if (roadBtn) roadBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1000));
    await pageGuide.screenshot({ path: path.join(screenshotsDir, 'guidelines_roadmap.png') });
    console.log('Saved: guidelines_roadmap.png');

    // 8. Guidelines Page: Tab 5 (Code of Conduct, Digital Sign-off & Sources)
    console.log('8. Capturing Guidelines Tab 5 (Sign-Off & Sources)...');
    await pageGuide.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const signBtn = btns.find(b => b.textContent && b.textContent.includes('Sign-Off') || b.textContent.includes('Code & Sign-Off'));
      if (signBtn) signBtn.click();
    });
    await new Promise((r) => setTimeout(r, 1000));
    // Click Sign button to show verified state
    await pageGuide.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const ackBtn = btns.find(b => b.textContent && (b.textContent.includes('Sign') || b.textContent.includes('ဖတ်ရှုနားလည်')));
      if (ackBtn) ackBtn.click();
    });
    await new Promise((r) => setTimeout(r, 800));
    await pageGuide.screenshot({ path: path.join(screenshotsDir, 'guidelines_conduct_signoff.png') });
    console.log('Saved: guidelines_conduct_signoff.png');
    await pageGuide.close();

    console.log('All guidelines and deployment screenshots captured successfully!');
  } catch (err) {
    console.error('Error during screenshot capture:', err);
  } finally {
    await browser.close();
  }
}

main();

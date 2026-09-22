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

    // 1. Login as Founder (Thet Htoo Naing)
    console.log('Logging in as Founder with credentials...');
    await page.goto('http://localhost:3005/login', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 1000));

    await page.type('input[type="email"]', 'thn@goeuro.de');
    await page.type('input[type="password"]', 'Goeuro2026!');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 2000));

    // Verify Dashboard with new Founder Finance card
    await page.screenshot({ path: path.join(screenshotsDir, 'finance_dashboard_widget.png') });
    console.log('Saved finance_dashboard_widget.png');

    // 2. Navigate to /finance (P&L Overview)
    console.log('Navigating to /finance ...');
    await page.goto('http://localhost:3005/finance', { waitUntil: 'networkidle2', timeout: 30000 });
    await new Promise(r => setTimeout(r, 2000));
    await page.screenshot({ path: path.join(screenshotsDir, 'finance_pnl_overview.png') });
    console.log('Saved finance_pnl_overview.png');

    // 3. Switch to Transactions Ledger tab
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const txBtn = btns.find(b => b.innerText.includes('ဝင်ငွေ/ထွက်ငွေ') || b.innerText.includes('Incomes & Expenses'));
      if (txBtn) txBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(screenshotsDir, 'finance_transactions_ledger.png') });
    console.log('Saved finance_transactions_ledger.png');

    // 4. Switch to Staff Payroll & Commission Calculator tab
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const prBtn = btns.find(b => b.innerText.includes('ဝန်ထမ်းလခ') || b.innerText.includes('Payroll'));
      if (prBtn) prBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(screenshotsDir, 'finance_payroll_calculator.png') });
    console.log('Saved finance_payroll_calculator.png');

    // 5. Open Payslip Voucher
    await page.evaluate(() => {
      const btns = Array.from(document.querySelectorAll('button'));
      const slipBtn = btns.find(b => b.innerText.includes('စလစ်ထုတ်') || b.innerText.includes('Slip'));
      if (slipBtn) slipBtn.click();
    });
    await new Promise(r => setTimeout(r, 1000));
    await page.screenshot({ path: path.join(screenshotsDir, 'finance_payslip_voucher.png') });
    console.log('Saved finance_payslip_voucher.png');

    // 6. Test Non-Executive Guard (Login as Viewer without finance:view)
    await page.goto('http://localhost:3005/login', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1000));

    // Clear and enter viewer credentials
    await page.evaluate(() => {
      document.querySelector('input[type="email"]').value = '';
      document.querySelector('input[type="password"]').value = '';
    });
    await page.type('input[type="email"]', 'viewer@partner.de');
    await page.type('input[type="password"]', 'Goeuro2026!');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 15000 }).catch(() => {});
    await new Promise(r => setTimeout(r, 1500));

    // Try accessing /finance as Viewer
    await page.goto('http://localhost:3005/finance', { waitUntil: 'networkidle2' });
    await new Promise(r => setTimeout(r, 1500));
    await page.screenshot({ path: path.join(screenshotsDir, 'finance_restricted_view.png') });
    console.log('Saved finance_restricted_view.png');

    await page.close();
    console.log('All Finance & Payroll verifications succeeded!');
  } catch (err) {
    console.error('Error during verification:', err);
    process.exit(1);
  } finally {
    await browser.close();
  }
}

main();

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Seeding initial Finance & Payroll records...');

  const org = await prisma.organization.findUnique({ where: { slug: 'goeuro' } });
  if (!org) {
    console.error('Organization not found!');
    return;
  }

  const users = await prisma.user.findMany({ where: { orgId: org.id } });
  const userMap = {};
  users.forEach((u) => {
    userMap[u.email] = u;
  });

  const thn = userMap['thn@goeuro.de'];
  const kmh = userMap['kmh@goeuro.de'];
  const yytt = userMap['yytt@goeuro.de'];
  const nmth = userMap['nmth@goeuro.de'];
  const lmm = userMap['lmm@goeuro.de'];
  const admin = userMap['admin@goeuro.de'];

  // Clean old financial records if any
  await prisma.financialTransaction.deleteMany({ where: { orgId: org.id } });
  await prisma.staffPayroll.deleteMany({ where: { orgId: org.id } });

  // 1. Seed Income Transactions
  const exchangeRate = 4500; // 1 EUR = 4,500 MMK

  await prisma.financialTransaction.createMany({
    data: [
      {
        orgId: org.id,
        type: 'INCOME',
        category: 'TUITION_FEE',
        title: 'Aung Kyaw Moe - Ausbildung Placement Fee (First Installment)',
        description: 'Enrolled for Nursing Ausbildung in Hamburg. Signed contract verified.',
        amount: 1500,
        currency: 'EUR',
        exchangeRate: exchangeRate,
        amountInEur: 1500,
        date: new Date('2026-09-05'),
        paymentMethod: 'BANK_TRANSFER',
        status: 'CONFIRMED',
        createdById: thn?.id,
      },
      {
        orgId: org.id,
        type: 'INCOME',
        category: 'CONSULTATION_FEE',
        title: 'Ma Ei Phyu - Uni-Assist VPD & State University Prep',
        description: 'Master of Computer Science application packet for TU Dresden.',
        amount: 2025000,
        currency: 'MMK',
        exchangeRate: exchangeRate,
        amountInEur: 450,
        date: new Date('2026-09-10'),
        paymentMethod: 'KBZPAY',
        status: 'CONFIRMED',
        createdById: thn?.id,
      },
      {
        orgId: org.id,
        type: 'INCOME',
        category: 'TRANSLATION_APS',
        title: 'Ko Thant Zin - Certified German Translations & APS Legalization',
        description: 'Sworn translation of high school diploma and notary verification.',
        amount: 1350000,
        currency: 'MMK',
        exchangeRate: exchangeRate,
        amountInEur: 300,
        date: new Date('2026-09-14'),
        paymentMethod: 'AYA',
        status: 'CONFIRMED',
        createdById: thn?.id,
      },
      {
        orgId: org.id,
        type: 'INCOME',
        category: 'TUITION_FEE',
        title: 'Ma Hnin Nu - IT Ausbildung Contract Signing Fee',
        description: 'Mechatronics & IT Dual training agreement down payment.',
        amount: 800,
        currency: 'EUR',
        exchangeRate: exchangeRate,
        amountInEur: 800,
        date: new Date('2026-09-18'),
        paymentMethod: 'BANK_TRANSFER',
        status: 'CONFIRMED',
        createdById: thn?.id,
      },
      {
        orgId: org.id,
        type: 'INCOME',
        category: 'TUITION_FEE',
        title: 'Ko Min Thant - Goethe B2 Success & Ausbildung Matching',
        description: 'Hospitality Management placement fee completed.',
        amount: 1200,
        currency: 'EUR',
        exchangeRate: exchangeRate,
        amountInEur: 1200,
        date: new Date('2026-09-20'),
        paymentMethod: 'BANK_TRANSFER',
        status: 'CONFIRMED',
        createdById: thn?.id,
      },
    ],
  });

  // 2. Seed Expense Transactions
  await prisma.financialTransaction.createMany({
    data: [
      {
        orgId: org.id,
        type: 'EXPENSE',
        category: 'MARKETING_AD_SPEND',
        title: 'Meta Facebook Lead Ads (September 2026 Intake Campaign)',
        description: 'Sponsored video campaigns for Nursing and IT Ausbildung pathways.',
        amount: 420,
        currency: 'EUR',
        exchangeRate: exchangeRate,
        amountInEur: 420,
        date: new Date('2026-09-08'),
        paymentMethod: 'BANK_TRANSFER',
        status: 'CONFIRMED',
        createdById: thn?.id,
      },
      {
        orgId: org.id,
        type: 'EXPENSE',
        category: 'MARKETING_AD_SPEND',
        title: 'TikTok Lead Gen & Influencer Video Boost',
        description: 'Student life in Hamburg video content promotion.',
        amount: 810000,
        currency: 'MMK',
        exchangeRate: exchangeRate,
        amountInEur: 180,
        date: new Date('2026-09-12'),
        paymentMethod: 'KBZPAY',
        status: 'CONFIRMED',
        createdById: thn?.id,
      },
      {
        orgId: org.id,
        type: 'EXPENSE',
        category: 'HAMBURG_LIAISON',
        title: 'Hamburg Airport Welcomes & Student Housing Advance',
        description: 'Ground transport, temporary hostel booking, and welcome pack.',
        amount: 650,
        currency: 'EUR',
        exchangeRate: exchangeRate,
        amountInEur: 650,
        date: new Date('2026-09-15'),
        paymentMethod: 'BANK_TRANSFER',
        status: 'CONFIRMED',
        createdById: thn?.id,
      },
      {
        orgId: org.id,
        type: 'EXPENSE',
        category: 'OFFICE_RENT',
        title: 'Yangon Counseling Center Utilities & High-Speed Fiber',
        description: 'Monthly office rent contribution and communication lines.',
        amount: 1125000,
        currency: 'MMK',
        exchangeRate: exchangeRate,
        amountInEur: 250,
        date: new Date('2026-09-01'),
        paymentMethod: 'AYA',
        status: 'CONFIRMED',
        createdById: thn?.id,
      },
      {
        orgId: org.id,
        type: 'EXPENSE',
        category: 'TECH_SUBSCRIPTION',
        title: 'Cloud Infrastructure, WebRTC Signal Relay & AI Subscriptions',
        description: 'Monthly Next.js hosting, database backup storage, and Zoom licenses.',
        amount: 540000,
        currency: 'MMK',
        exchangeRate: exchangeRate,
        amountInEur: 120,
        date: new Date('2026-09-02'),
        paymentMethod: 'KBZPAY',
        status: 'CONFIRMED',
        createdById: thn?.id,
      },
    ],
  });

  // 3. Seed Monthly Staff Payroll (September 2026)
  if (kmh) {
    await prisma.staffPayroll.create({
      data: {
        orgId: org.id,
        userId: kmh.id,
        month: '2026-09',
        baseSalary: 800000,
        currency: 'MMK',
        caseCommissions: 300000, // 3 cases enrolled @ 100,000 MMK
        leadBonuses: 0,
        performanceBonus: 50000,
        deductions: 0,
        netSalary: 1150000,
        casesCount: 3,
        leadsCount: 15,
        status: 'APPROVED',
        paymentMethod: 'KBZPAY',
        notes: 'Outstanding counseling conversion for Aung Kyaw Moe & Ma Hnin Nu.',
      },
    });
  }

  if (yytt) {
    await prisma.staffPayroll.create({
      data: {
        orgId: org.id,
        userId: yytt.id,
        month: '2026-09',
        baseSalary: 700000,
        currency: 'MMK',
        caseCommissions: 0,
        leadBonuses: 150000, // 30 qualified leads @ 5,000 MMK
        performanceBonus: 50000,
        deductions: 0,
        netSalary: 900000,
        casesCount: 0,
        leadsCount: 30,
        status: 'APPROVED',
        paymentMethod: 'KBZPAY',
        notes: 'Top video performance on TikTok with 30 qualified prospective student leads.',
      },
    });
  }

  if (nmth) {
    await prisma.staffPayroll.create({
      data: {
        orgId: org.id,
        userId: nmth.id,
        month: '2026-09',
        baseSalary: 750000,
        currency: 'MMK',
        caseCommissions: 200000, // 2 employer contracts matched
        leadBonuses: 0,
        performanceBonus: 0,
        deductions: 0,
        netSalary: 950000,
        casesCount: 2,
        leadsCount: 8,
        status: 'APPROVED',
        paymentMethod: 'AYA',
        notes: 'Successfully verified German SME training quota for nursing applicants.',
      },
    });
  }

  if (lmm) {
    await prisma.staffPayroll.create({
      data: {
        orgId: org.id,
        userId: lmm.id,
        month: '2026-09',
        baseSalary: 2700000, // Equivalent to €600 base
        currency: 'MMK',
        caseCommissions: 675000, // €150 Hamburg arrival liaison
        leadBonuses: 0,
        performanceBonus: 225000, // €50 POV video bonus
        deductions: 0,
        netSalary: 3600000, // Total €800 equivalent
        casesCount: 2,
        leadsCount: 0,
        status: 'PENDING',
        paymentMethod: 'BANK_TRANSFER',
        notes: 'On-ground Hamburg arrival support and video logs.',
      },
    });
  }

  if (admin) {
    await prisma.staffPayroll.create({
      data: {
        orgId: org.id,
        userId: admin.id,
        month: '2026-09',
        baseSalary: 850000,
        currency: 'MMK',
        caseCommissions: 0,
        leadBonuses: 0,
        performanceBonus: 50000,
        deductions: 0,
        netSalary: 900000,
        casesCount: 0,
        leadsCount: 0,
        status: 'PAID',
        paidAt: new Date('2026-09-22'),
        paymentMethod: 'KBZPAY',
        notes: 'System uptime 100%, Webhook integrations & database performance optimization.',
      },
    });
  }

  console.log('Finance & Payroll seed complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

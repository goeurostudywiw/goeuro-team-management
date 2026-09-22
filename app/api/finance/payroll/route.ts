import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const month = searchParams.get('month') || '2026-09';

    const org = await prisma.organization.findUnique({ where: { slug: 'goeuro' } });
    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    // 1. Fetch all active staff
    const users = await prisma.user.findMany({
      where: { orgId: org.id, status: 'ACTIVE' },
      include: {
        role: true,
        ownedCases: true,
        ownedLeads: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    // 2. Fetch existing payroll records for this month
    const existingPayrolls = await prisma.staffPayroll.findMany({
      where: { orgId: org.id, month },
      include: { user: { include: { role: true } } },
    });

    const payrollMap = new Map();
    existingPayrolls.forEach((p) => {
      payrollMap.set(p.userId, p);
    });

    // 3. For users without a record in this month, generate default calculated draft
    const payrollList = [];

    for (const u of users) {
      // Exclude Founder self if desired, or include with baseline
      if (payrollMap.has(u.id)) {
        payrollList.push(payrollMap.get(u.id));
      } else {
        // Calculate based on staff performance
        const casesCount = u.ownedCases.length;
        const leadsCount = u.ownedLeads.filter((l) => ['QUALIFIED', 'CONSULTATION_COMPLETED', 'APPLICATION_READY'].includes(l.stage)).length;

        // Default base salary tier by title
        let defaultBase = 750000;
        let currency = 'MMK';
        if (u.title?.includes('Lead') || u.title?.includes('Case')) defaultBase = 800000;
        if (u.title?.includes('Super Administrator') || u.title?.includes('IT')) defaultBase = 850000;
        if (u.title?.includes('Founder')) defaultBase = 1500000;
        if (u.title?.includes('Hamburg')) {
          defaultBase = 2700000; // €600 equivalent
        }

        const caseCommissionPerUnit = 100000; // 100,000 MMK per case
        const leadBonusPerUnit = 5000; // 5,000 MMK per qualified lead

        const caseCommissions = casesCount * caseCommissionPerUnit;
        const leadBonuses = leadsCount * leadBonusPerUnit;
        const performanceBonus = 0;
        const deductions = 0;
        const netSalary = defaultBase + caseCommissions + leadBonuses + performanceBonus - deductions;

        payrollList.push({
          id: `draft_${u.id}_${month}`,
          orgId: org.id,
          userId: u.id,
          user: u,
          month,
          baseSalary: defaultBase,
          currency,
          caseCommissions,
          leadBonuses,
          performanceBonus,
          deductions,
          netSalary,
          casesCount,
          leadsCount,
          status: 'DRAFT',
          paymentMethod: 'KBZPAY',
          notes: 'Auto-calculated draft based on role and case metrics.',
          isDraft: true,
        });
      }
    }

    // Calculate Summary Stats
    let totalPayrollMmk = 0;
    let totalPayrollEur = 0;
    let paidCount = 0;
    let pendingCount = 0;

    payrollList.forEach((p) => {
      const net = p.netSalary || 0;
      totalPayrollMmk += net;
      totalPayrollEur += net / 4500;
      if (p.status === 'PAID') paidCount++;
      else pendingCount++;
    });

    return NextResponse.json({
      payrolls: payrollList,
      summary: {
        month,
        totalPayrollMmk: Math.round(totalPayrollMmk),
        totalPayrollEur: Math.round((totalPayrollMmk / 4500) * 100) / 100,
        staffCount: payrollList.length,
        paidCount,
        pendingCount,
      },
    });
  } catch (error: any) {
    console.error('Error fetching payroll:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch payroll' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      id,
      userId,
      month = '2026-09',
      baseSalary = 0,
      currency = 'MMK',
      caseCommissions = 0,
      leadBonuses = 0,
      performanceBonus = 0,
      deductions = 0,
      casesCount = 0,
      leadsCount = 0,
      status = 'APPROVED',
      paymentMethod = 'KBZPAY',
      notes = '',
    } = body;

    if (!userId || !month) {
      return NextResponse.json({ error: 'userId and month are required' }, { status: 400 });
    }

    const org = await prisma.organization.findUnique({ where: { slug: 'goeuro' } });
    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const parsedBase = parseFloat(baseSalary) || 0;
    const parsedCommission = parseFloat(caseCommissions) || 0;
    const parsedLeadBonus = parseFloat(leadBonuses) || 0;
    const parsedBonus = parseFloat(performanceBonus) || 0;
    const parsedDeductions = parseFloat(deductions) || 0;

    const netSalary = Math.max(0, parsedBase + parsedCommission + parsedLeadBonus + parsedBonus - parsedDeductions);

    // Check if payroll record exists
    let record;
    const existing = await prisma.staffPayroll.findFirst({
      where: { orgId: org.id, userId, month },
    });

    if (existing) {
      record = await prisma.staffPayroll.update({
        where: { id: existing.id },
        data: {
          baseSalary: parsedBase,
          currency,
          caseCommissions: parsedCommission,
          leadBonuses: parsedLeadBonus,
          performanceBonus: parsedBonus,
          deductions: parsedDeductions,
          netSalary,
          casesCount: parseInt(casesCount, 10) || 0,
          leadsCount: parseInt(leadsCount, 10) || 0,
          status,
          paymentMethod,
          notes: notes || null,
          ...(status === 'PAID' && !existing.paidAt ? { paidAt: new Date() } : {}),
        },
        include: { user: true },
      });
    } else {
      record = await prisma.staffPayroll.create({
        data: {
          orgId: org.id,
          userId,
          month,
          baseSalary: parsedBase,
          currency,
          caseCommissions: parsedCommission,
          leadBonuses: parsedLeadBonus,
          performanceBonus: parsedBonus,
          deductions: parsedDeductions,
          netSalary,
          casesCount: parseInt(casesCount, 10) || 0,
          leadsCount: parseInt(leadsCount, 10) || 0,
          status,
          paymentMethod,
          notes: notes || null,
          ...(status === 'PAID' ? { paidAt: new Date() } : {}),
        },
        include: { user: true },
      });
    }

    // If marked as PAID, create or sync expense transaction
    if (status === 'PAID') {
      const existingExpense = await prisma.financialTransaction.findFirst({
        where: { referenceId: record.id },
      });

      const exchangeRate = 4500;
      const amountInEur = currency === 'EUR' ? netSalary : netSalary / exchangeRate;

      if (!existingExpense) {
        await prisma.financialTransaction.create({
          data: {
            orgId: org.id,
            type: 'EXPENSE',
            category: 'SALARY_PAYROLL',
            title: `Staff Salary Payout: ${record.user.name} (${month})`,
            description: `Base: ${parsedBase.toLocaleString()} ${currency}, Commission: ${parsedCommission.toLocaleString()}, Bonus: ${parsedBonus.toLocaleString()}`,
            amount: netSalary,
            currency,
            exchangeRate,
            amountInEur: Math.round(amountInEur * 100) / 100,
            paymentMethod: paymentMethod || 'KBZPAY',
            status: 'CONFIRMED',
            referenceId: record.id,
          },
        });
      }
    }

    return NextResponse.json(record);
  } catch (error: any) {
    console.error('Error saving payroll:', error);
    return NextResponse.json({ error: error.message || 'Failed to save payroll' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { action, month = '2026-09', payrollId, status } = body;

    const org = await prisma.organization.findUnique({ where: { slug: 'goeuro' } });
    if (!org) return NextResponse.json({ error: 'Organization not found' }, { status: 404 });

    if (action === 'APPROVE_ALL') {
      await prisma.staffPayroll.updateMany({
        where: { orgId: org.id, month, status: 'DRAFT' },
        data: { status: 'APPROVED' },
      });
      return NextResponse.json({ success: true, message: `All draft payrolls for ${month} approved by Founder.` });
    }

    if (payrollId && status) {
      const updated = await prisma.staffPayroll.update({
        where: { id: payrollId },
        data: {
          status,
          ...(status === 'PAID' ? { paidAt: new Date() } : {}),
        },
      });
      return NextResponse.json(updated);
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: any) {
    console.error('Error updating payroll batch:', error);
    return NextResponse.json({ error: error.message || 'Failed to batch update payroll' }, { status: 500 });
  }
}

import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const month = searchParams.get('month'); // e.g. "2026-09"

    const where: any = {};
    if (type) where.type = type;
    if (category) where.category = category;

    if (month) {
      const [yearStr, monthStr] = month.split('-');
      const year = parseInt(yearStr, 10);
      const m = parseInt(monthStr, 10);
      const startDate = new Date(year, m - 1, 1);
      const endDate = new Date(year, m, 0, 23, 59, 59, 999);
      where.date = { gte: startDate, lte: endDate };
    }

    const transactions = await prisma.financialTransaction.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    // Calculate Totals & Net Profit in EUR and MMK equivalent (default 1 EUR = 4500 MMK)
    let totalIncomeEur = 0;
    let totalExpenseEur = 0;
    let totalIncomeMmk = 0;
    let totalExpenseMmk = 0;

    transactions.forEach((tx) => {
      const eur = tx.amountInEur || (tx.currency === 'EUR' ? tx.amount : tx.amount / (tx.exchangeRate || 4500));
      const mmk = tx.currency === 'MMK' ? tx.amount : tx.amount * (tx.exchangeRate || 4500);

      if (tx.type === 'INCOME') {
        totalIncomeEur += eur;
        totalIncomeMmk += mmk;
      } else if (tx.type === 'EXPENSE') {
        totalExpenseEur += eur;
        totalExpenseMmk += mmk;
      }
    });

    const netProfitEur = totalIncomeEur - totalExpenseEur;
    const netProfitMmk = totalIncomeMmk - totalExpenseMmk;
    const profitMargin = totalIncomeEur > 0 ? (netProfitEur / totalIncomeEur) * 100 : 0;

    return NextResponse.json({
      transactions,
      summary: {
        totalIncomeEur: Math.round(totalIncomeEur * 100) / 100,
        totalExpenseEur: Math.round(totalExpenseEur * 100) / 100,
        netProfitEur: Math.round(netProfitEur * 100) / 100,
        totalIncomeMmk: Math.round(totalIncomeMmk),
        totalExpenseMmk: Math.round(totalExpenseMmk),
        netProfitMmk: Math.round(netProfitMmk),
        profitMargin: Math.round(profitMargin * 10) / 10,
        count: transactions.length,
      },
    });
  } catch (error: any) {
    console.error('Error fetching financial transactions:', error);
    return NextResponse.json({ error: error.message || 'Failed to fetch transactions' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      type,
      category,
      amount,
      currency = 'MMK',
      exchangeRate = 4500,
      title,
      description,
      paymentMethod = 'KBZPAY',
      status = 'CONFIRMED',
      date,
      referenceId,
      createdById,
    } = body;

    if (!type || !category || !amount || !title) {
      return NextResponse.json({ error: 'Missing required financial fields (type, category, amount, title)' }, { status: 400 });
    }

    const org = await prisma.organization.findUnique({ where: { slug: 'goeuro' } });
    if (!org) {
      return NextResponse.json({ error: 'Organization not found' }, { status: 404 });
    }

    const parsedAmount = parseFloat(amount);
    const parsedRate = parseFloat(exchangeRate) || 4500;
    const amountInEur = currency === 'EUR' ? parsedAmount : parsedAmount / parsedRate;

    const transaction = await prisma.financialTransaction.create({
      data: {
        orgId: org.id,
        type,
        category,
        amount: parsedAmount,
        currency,
        exchangeRate: parsedRate,
        amountInEur: Math.round(amountInEur * 100) / 100,
        title,
        description: description || null,
        paymentMethod,
        status,
        date: date ? new Date(date) : new Date(),
        referenceId: referenceId || null,
        createdById: createdById || null,
      },
    });

    // Record in AuditLog
    await prisma.auditLog.create({
      data: {
        orgId: org.id,
        userId: createdById || null,
        entityType: 'FINANCIAL_TRANSACTION',
        entityId: transaction.id,
        action: 'CREATE',
        details: JSON.stringify({
          type,
          category,
          amount: parsedAmount,
          currency,
          title,
        }),
      },
    });

    return NextResponse.json(transaction, { status: 201 });
  } catch (error: any) {
    console.error('Error creating financial transaction:', error);
    return NextResponse.json({ error: error.message || 'Failed to create transaction' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 });
    }

    await prisma.financialTransaction.delete({ where: { id } });
    return NextResponse.json({ success: true, id });
  } catch (error: any) {
    console.error('Error deleting transaction:', error);
    return NextResponse.json({ error: error.message || 'Failed to delete transaction' }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, status, notes } = body;
    if (!id) {
      return NextResponse.json({ error: 'Transaction ID required' }, { status: 400 });
    }

    const updated = await prisma.financialTransaction.update({
      where: { id },
      data: {
        ...(status ? { status } : {}),
        ...(notes ? { description: notes } : {}),
      },
    });

    return NextResponse.json(updated);
  } catch (error: any) {
    console.error('Error updating transaction:', error);
    return NextResponse.json({ error: error.message || 'Failed to update transaction' }, { status: 500 });
  }
}

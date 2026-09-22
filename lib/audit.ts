import { prisma } from './prisma';

export async function logAudit({
  orgId,
  userId,
  entityType,
  entityId,
  action,
  details,
}: {
  orgId: string;
  userId?: string | null;
  entityType: string;
  entityId: string;
  action: string;
  details?: Record<string, any>;
}) {
  try {
    return await prisma.auditLog.create({
      data: {
        orgId,
        userId: userId || null,
        entityType,
        entityId,
        action,
        details: JSON.stringify(details || {}),
      },
    });
  } catch (error) {
    console.error('Failed to create audit log:', error);
  }
}

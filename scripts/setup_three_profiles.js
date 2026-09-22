const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${derivedKey}`;
}

const DEFAULT_PASSWORD_HASH = hashPassword('Goeuro2026!');

async function main() {
  console.log('--- Setting up GOEURO 3 Profile Tiers ---');

  const org = await prisma.organization.findFirst();
  if (!org) {
    console.error('No organization found!');
    return;
  }
  console.log('Organization:', org.name, '(', org.id, ')');

  // 1. Create or Update the 3 Tiers of Roles
  const founderRole = await prisma.role.upsert({
    where: { id: 'role-founder-001' },
    update: {
      name: 'Founder',
      description: 'Supreme Executive & Visionary Governance with full organization sovereignty',
      isSystem: true,
      permissions: JSON.stringify(['*']),
    },
    create: {
      id: 'role-founder-001',
      orgId: org.id,
      name: 'Founder',
      description: 'Supreme Executive & Visionary Governance with full organization sovereignty',
      isSystem: true,
      permissions: JSON.stringify(['*']),
    },
  });
  console.log('Tier 1 Role (Founder):', founderRole.name);

  const superAdminRole = await prisma.role.upsert({
    where: { id: 'role-superadmin-002' },
    update: {
      name: 'Super Admin',
      description: 'Platform Super Administrator with complete system security, user management, and technical configuration',
      isSystem: true,
      permissions: JSON.stringify(['*']),
    },
    create: {
      id: 'role-superadmin-002',
      orgId: org.id,
      name: 'Super Admin',
      description: 'Platform Super Administrator with complete system security, user management, and technical configuration',
      isSystem: true,
      permissions: JSON.stringify(['*']),
    },
  });
  console.log('Tier 2 Role (Super Admin):', superAdminRole.name);

  const consultantRole = await prisma.role.upsert({
    where: { id: 'role-consultant-003' },
    update: {
      name: 'Consultant & Management',
      description: 'Educational Counselors, Case Managers & Department Coordinators handling student admissions and consultations',
      isSystem: true,
      permissions: JSON.stringify([
        'task:read', 'task:write', 'task:assign',
        'content:read', 'content:write', 'content:factual_review', 'content:brand_approve',
        'lead:read', 'lead:write',
        'case:read', 'case:write',
        'knowledge:read', 'knowledge:write',
        'report:view', 'team:manage'
      ]),
    },
    create: {
      id: 'role-consultant-003',
      orgId: org.id,
      name: 'Consultant & Management',
      description: 'Educational Counselors, Case Managers & Department Coordinators handling student admissions and consultations',
      isSystem: true,
      permissions: JSON.stringify([
        'task:read', 'task:write', 'task:assign',
        'content:read', 'content:write', 'content:factual_review', 'content:brand_approve',
        'lead:read', 'lead:write',
        'case:read', 'case:write',
        'knowledge:read', 'knowledge:write',
        'report:view', 'team:manage'
      ]),
    },
  });
  console.log('Tier 3 Role (Consultant & Management):', consultantRole.name);

  // 2. Assign Users to 3 Profile Tiers

  // Profile 1: Founder (Thet Htoo Naing)
  const founderUser = await prisma.user.upsert({
    where: { email: 'thn@goeuro.de' },
    update: {
      roleId: founderRole.id,
      title: 'Founder & Managing Director',
      status: 'ACTIVE',
    },
    create: {
      orgId: org.id,
      name: 'Thet Htoo Naing',
      email: 'thn@goeuro.de',
      title: 'Founder & Managing Director',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
      roleId: founderRole.id,
      passwordHash: DEFAULT_PASSWORD_HASH,
      status: 'ACTIVE',
    },
  });
  console.log('Profile 1 Configured ->', founderUser.name, 'as', founderRole.name);

  // Profile 2: Super Admin (System Admin)
  const superAdminUser = await prisma.user.upsert({
    where: { email: 'admin@goeuro.de' },
    update: {
      roleId: superAdminRole.id,
      title: 'Super Administrator & IT Systems',
      status: 'ACTIVE',
    },
    create: {
      orgId: org.id,
      name: 'System Admin',
      email: 'admin@goeuro.de',
      title: 'Super Administrator & IT Systems',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      roleId: superAdminRole.id,
      passwordHash: DEFAULT_PASSWORD_HASH,
      status: 'ACTIVE',
    },
  });
  console.log('Profile 2 Configured ->', superAdminUser.name, 'as', superAdminRole.name);

  // Profile 3: Consultant & Management
  const consultantUsers = [
    {
      name: 'Kaung Myat Hein',
      email: 'kmh@goeuro.de',
      title: 'Student Relations Lead & Senior Counselor',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'Ye Yint Tun Thant',
      email: 'yytt@goeuro.de',
      title: 'Operations & Academic Coordinator',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'Nay Myo Thiha',
      email: 'nay@goeuro.de',
      title: 'Ausbildung Specialist & Regional Consultant',
      avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'Lu Min Myat',
      email: 'lu@goeuro.de',
      title: 'Germany Representative & Case Consultant',
      avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
    },
    {
      name: 'Su Su Hlaing',
      email: 'susu@goeuro.de',
      title: 'Admissions Counselor & Student Advisor',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
    },
  ];

  for (const c of consultantUsers) {
    const user = await prisma.user.upsert({
      where: { email: c.email },
      update: {
        roleId: consultantRole.id,
        title: c.title,
        avatar: c.avatar,
        status: 'ACTIVE',
      },
      create: {
        orgId: org.id,
        name: c.name,
        email: c.email,
        title: c.title,
        avatar: c.avatar,
        roleId: consultantRole.id,
        passwordHash: DEFAULT_PASSWORD_HASH,
        status: 'ACTIVE',
      },
    });
    console.log('Profile 3 Configured ->', user.name, 'as', consultantRole.name);
  }

  // Also update any other users if necessary
  const allCurrentUsers = await prisma.user.findMany({
    include: { role: true },
  });
  console.log('\n--- Current Database Users & Tiers ---');
  allCurrentUsers.forEach((u) => {
    console.log(`- ${u.name} (${u.email}) -> [${u.role.name}] ${u.title}`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

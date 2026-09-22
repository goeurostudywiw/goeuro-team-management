const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('--- Syncing Database Users to Guideline Version 1.2 ---');

  const updates = [
    { email: 'thn@goeuro.de', name: 'Thet Htoo Naing', title: 'Founder and Growth Lead' },
    { email: 'kmh@goeuro.de', name: 'Kaung Myat Htine', title: 'Student Journey and Case Lead' },
    { email: 'yytt@goeuro.de', name: 'Ye Yint Tun Thant', title: 'Campaign Operations Coordinator' },
    { email: 'nay@goeuro.de', name: 'Nay Myo Thiha', title: 'Ausbildung Pathway Specialist' },
    { email: 'lu@goeuro.de', name: 'Lu Min Myat', title: 'Germany Experience and Content Lead' },
  ];

  for (const u of updates) {
    const user = await prisma.user.findUnique({ where: { email: u.email } });
    if (user) {
      await prisma.user.update({
        where: { email: u.email },
        data: { name: u.name, title: u.title },
      });
      console.log(`Updated ${u.email}: ${u.name} -> ${u.title}`);
    } else {
      console.log(`User ${u.email} not found.`);
    }
  }

  console.log('User roster synchronized successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

function verifyPassword(password, storedHash) {
  if (!storedHash) return false;
  const [salt, key] = storedHash.split(':');
  const derivedKey = crypto.scryptSync(password, salt, 64).toString('hex');
  return crypto.timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(derivedKey, 'hex'));
}

async function check() {
  const user = await prisma.user.findUnique({
    where: { email: 'ceothnaing@gmail.com' },
    include: { role: true }
  });
  console.log('--- FOUNDER CREDENTIAL VERIFICATION ---');
  console.log('User Name:', user ? user.name : 'null');
  console.log('Email:', user?.email);
  console.log('Role:', user?.role?.name);
  console.log('Title:', user?.title);
  const isValid = verifyPassword('GoEuro@Founder', user?.passwordHash);
  console.log('Password GoEuro@Founder valid?:', isValid);
  await prisma.$disconnect();
}

check().catch(console.error);

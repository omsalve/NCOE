// prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // Hash a password for our test users
  const password = 'password123';
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a test student
  const student = await prisma.user.create({
    data: {
      name: 'Test Student',
      email: 'student@test.com',
      passwordHash: hashedPassword,
      role: 'STUDENT', // Use the string value
      rollNo: 'S2024001',
      year: 1,
      section: 'A',
    },
  });

  // Create a test professor
  const professor = await prisma.user.create({
    data: {
      name: 'Test Professor',
      email: 'professor@test.com',
      passwordHash: hashedPassword,
      role: 'PROFESSOR', // Use the string value
      designation: 'Assistant Professor',
    },
  });

  console.log('Seeding finished.');
  console.log(`Created student: ${student.email} (password: password123)`);
  console.log(`Created professor: ${professor.email} (password: password123)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
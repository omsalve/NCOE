// src/prisma/seed.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  const password = 'password123';
  const hashedPassword = await bcrypt.hash(password, 10);

  // Create a Department
  const csDept = await prisma.department.create({
    data: {
      name: 'Computer Science',
    },
  });

  // Create a Student (User + Student relation)
  const studentUser = await prisma.user.create({
    data: {
      name: 'Test Student',
      email: 'student@test.com',
      passwordHash: hashedPassword,
      role: 'STUDENT',
      departmentId: csDept.id,
      student: {
        create: {
          rollNo: 'S2024001',
          year: 1,
          section: 'A',
        },
      },
    },
    include: { student: true },
  });

  // Create a Faculty (User + Faculty relation)
  const professorUser = await prisma.user.create({
    data: {
      name: 'Test Professor',
      email: 'professor@test.com',
      passwordHash: hashedPassword,
      role: 'PROFESSOR',
      departmentId: csDept.id,
      faculty: {
        create: {
          designation: 'Assistant Professor',
        },
      },
    },
    include: { faculty: true },
  });

  console.log('Seeding finished.');
  console.log(`Created student: ${studentUser.email} (password: password123)`);
  console.log(`Created professor: ${professorUser.email} (password: password123)`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

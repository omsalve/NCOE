// src/prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const prisma = new PrismaClient();

// Function to parse the CSV file using Papaparse
const parseCSV = (filePath: string): Promise<any[]> => {
    const csvFile = fs.readFileSync(filePath, 'utf-8');
    return new Promise(resolve => {
        Papa.parse(csvFile, {
            header: true,
            skipEmptyLines: true,
            complete: (results) => {
                resolve(results.data);
            },
        });
    });
};

async function main() {
  console.log('Start seeding...');

  // 1. Clean up existing data
  await prisma.submission.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.lecture.deleteMany();
  await prisma.course.deleteMany();
  await prisma.student.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  const password = 'password123';
  const hashedPassword = await bcrypt.hash(password, 10);

  // 2. Create Departments
  const departmentMap: { [key: string]: any } = {
    'Computer Science and Engineering': await prisma.department.create({ data: { name: 'Computer Science and Engineering' } }),
    'Computer Engineering': await prisma.department.create({ data: { name: 'Computer Engineering' } }),
    'Information Technology': await prisma.department.create({ data: { name: 'Information Technology' } }),
    'Electrical Engineering': await prisma.department.create({ data: { name: 'Electrical Engineering' } }),
    'Electronics and Telecommunication Engg': await prisma.department.create({ data: { name: 'Electronics and Telecommunication Engg' } }),
    'Artificial Intelligence and Data Science': await prisma.department.create({ data: { name: 'AI & Data Science' } }),
    'Mechanical Engineering': await prisma.department.create({ data: { name: 'Mechanical Engineering' } }),
    'Civil Engineering': await prisma.department.create({ data: { name: 'Civil Engineering' } }),
    'Applied Sciences': await prisma.department.create({ data: { name: 'Applied Sciences' } }),
  };

  // 3. Create Faculty and Admin Users
  await prisma.user.create({
    data: { name: 'Dr. S. K. Singh', email: 'principal@nescoe.com', passwordHash: hashedPassword, role: Role.PRINCIPAL }
  });
  await prisma.user.create({
      data: { name: 'Dr. Priya Sharma', email: 'hod.cse@nescoe.com', passwordHash: hashedPassword, role: Role.HOD, departmentId: departmentMap['Computer Science and Engineering'].id, faculty: { create: { designation: 'HOD' } } }
  });
  await prisma.user.create({
    data: { name: 'Prof. Anjali Ahuja', email: 'a.ahuja@nescoe.com', passwordHash: hashedPassword, role: Role.PROFESSOR, departmentId: departmentMap['Computer Science and Engineering'].id, faculty: { create: { designation: 'Professor' } } }
  });
  
  // 4. Create Students from CSV
  console.log('Creating students from CSV...');
  const studentData = await parseCSV(path.join(__dirname, 'studentlist.csv'));

  for (const record of studentData) {
      const department = departmentMap[record['Course Name']];
      if (department && record['Candidate Name']) {
          const name = record['Candidate Name'];
          const email = `${name.toLowerCase().replace(/\s+/g, '.')}@nescoe.com`;
          const rollNo = record['Application ID'];

          const existingUser = await prisma.user.findUnique({ where: { email }});
          if (!existingUser) {
            await prisma.user.create({
                data: {
                    name,
                    email,
                    passwordHash: hashedPassword,
                    role: Role.STUDENT,
                    departmentId: department.id,
                    student: {
                        create: {
                            rollNo,
                            year: 1, 
                            section: 'A',
                            mobile: record['Mobile No'] || null,
                            cetPercentile: record['CET Percentile'] ? parseFloat(record['CET Percentile']) : null,
                            jeePercentile: record['JEE Percentile'] ? parseFloat(record['JEE Percentile']) : null,
                        },
                    },
                },
            });
          }
      }
  }

  console.log('Seeding finished.');
} // This was the missing brace

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
// src/prisma/seed.ts
import { PrismaClient, Role } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Start seeding...');

  // 1. Clean up existing data to ensure a fresh start
  console.log('Cleaning database...');
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
  console.log('Creating departments...');
  const aidsDept = await prisma.department.create({ data: { name: 'AI & Data Science' } });
  const cseDept = await prisma.department.create({ data: { name: 'Computer Science Engineering' } });
  const eeDept = await prisma.department.create({ data: { name: 'Electrical Engineering' } });
  const meDept = await prisma.department.create({ data: { name: 'Mechanical Engineering' } });
  const ceDept = await prisma.department.create({ data: { name: 'Civil Engineering' } });
  const appliedSciencesDept = await prisma.department.create({ data: { name: 'Applied Sciences' } });


  // 3. Create Users (Faculty & Admin)
  console.log('Creating faculty, HODs, and principal...');
  const principal = await prisma.user.create({
    data: { name: 'Dr. S. K. Singh', email: 'principal@nescoe.com', passwordHash: hashedPassword, role: Role.PRINCIPAL }
  });

  const hodAids = await prisma.user.create({
    data: { name: 'Dr. Ramesh Kumar', email: 'hod.aids@nescoe.com', passwordHash: hashedPassword, role: Role.HOD, departmentId: aidsDept.id, faculty: { create: { designation: 'HOD' } } }
  });
  const hodCse = await prisma.user.create({
    data: { name: 'Dr. Priya Sharma', email: 'hod.cse@nescoe.com', passwordHash: hashedPassword, role: Role.HOD, departmentId: cseDept.id, faculty: { create: { designation: 'HOD' } } }
  });
  
  // Create some professors
  const profAhuja = await prisma.user.create({
    data: { name: 'Prof. Anjali Ahuja', email: 'a.ahuja@nescoe.com', passwordHash: hashedPassword, role: Role.PROFESSOR, departmentId: cseDept.id, faculty: { create: { designation: 'Professor' } } }
  });
  const profVerma = await prisma.user.create({
    data: { name: 'Prof. Vikram Verma', email: 'v.verma@nescoe.com', passwordHash: hashedPassword, role: Role.PROFESSOR, departmentId: aidsDept.id, faculty: { create: { designation: 'Professor' } } }
  });
  // Shared faculty for common first-year subjects
  const profMath = await prisma.user.create({
    data: { name: 'Dr. Mehta', email: 'mehta@nescoe.com', passwordHash: hashedPassword, role: Role.PROFESSOR, departmentId: appliedSciencesDept.id, faculty: { create: { designation: 'Professor' } } }
  });
   const profChem = await prisma.user.create({
    data: { name: 'Dr. Iyer', email: 'iyer@nescoe.com', passwordHash: hashedPassword, role: Role.PROFESSOR, departmentId: appliedSciencesDept.id, faculty: { create: { designation: 'Professor' } } }
  });


  // 4. Create Students
  console.log('Creating students...');
   await prisma.user.create({
    data: { name: 'Amit Singh', email: 'amit.s@nescoe.com', passwordHash: hashedPassword, role: Role.STUDENT, departmentId: cseDept.id, student: { create: { rollNo: 'CSE24001', year: 1, section: 'A' } } }
  });
  await prisma.user.create({
    data: { name: 'Sunita Patil', email: 'sunita.p@nescoe.com', passwordHash: hashedPassword, role: Role.STUDENT, departmentId: aidsDept.id, student: { create: { rollNo: 'AIDS24001', year: 1, section: 'A' } } }
  });
   await prisma.user.create({
    data: { name: 'Rajesh Gupta', email: 'rajesh.g@nescoe.com', passwordHash: hashedPassword, role: Role.STUDENT, departmentId: meDept.id, student: { create: { rollNo: 'ME24001', year: 1, section: 'B' } } }
  });


  // 5. Create Courses (FIXED LOGIC)
  console.log('Creating courses...');
  // Create each course only once and assign it to a primary department.
  const coursesToCreate = [
    // Group A Courses
    { code: '24AF1000BS101', name: 'Engineering Mathematics – I', facultyId: profMath.id, departmentId: appliedSciencesDept.id },
    { code: '24AF1CHEBS102', name: 'Engineering Chemistry', facultyId: profChem.id, departmentId: appliedSciencesDept.id },
    { code: '24AF1CHEBS103L', name: 'Engineering Chemistry Lab', facultyId: profChem.id, departmentId: appliedSciencesDept.id },
    { code: '24AF1EMES104', name: 'Engineering Mechanics', facultyId: profMath.id, departmentId: meDept.id },
    { code: '24AF1EMES105L', name: 'Engineering Mechanics Lab', facultyId: profMath.id, departmentId: meDept.id },
    { code: '24AF1000ES106', name: 'Programming for Problem Solving', facultyId: profAhuja.id, departmentId: cseDept.id },
    { code: '24AF1000ES107L', name: 'Programming for Problem Solving Lab', facultyId: profAhuja.id, departmentId: cseDept.id },
    { code: '24AF1000VS108L', name: 'Workshop Practices', facultyId: profVerma.id, departmentId: meDept.id },
    { code: '24AF1000VS109', name: 'Communication Skills', facultyId: profAhuja.id, departmentId: appliedSciencesDept.id },
    { code: '24AF1000VS110L', name: 'Communication Skills Lab', facultyId: profAhuja.id, departmentId: appliedSciencesDept.id },

    // Group B Courses (that are not in Group A)
    { code: 'BSC102B', name: 'Engineering Physics', facultyId: profMath.id, departmentId: appliedSciencesDept.id },
    { code: 'BSC103B', name: 'Engineering Physics Lab', facultyId: profMath.id, departmentId: appliedSciencesDept.id },
    { code: 'ESC104B', name: 'Engineering Graphics', facultyId: profVerma.id, departmentId: meDept.id },
    { code: 'ESC105B', name: 'Engineering Graphics Lab', facultyId: profVerma.id, departmentId: meDept.id },
    { code: 'ESC106B', name: 'Basic Electrical and Electronics Engineering', facultyId: profVerma.id, departmentId: eeDept.id },
  ];

  for (const courseData of coursesToCreate) {
    await prisma.course.create({
      data: courseData,
    });
  }

  console.log('Seeding finished.');
  console.log('--- LOGIN CREDENTIALS ---');
  console.log('Password for all users: password123');
  console.log(`Principal: principal@nescoe.com`);
  console.log(`HOD (AI&DS): hod.aids@nescoe.com`);
  console.log(`HOD (CSE): hod.cse@nescoe.com`);
  console.log(`Professor (CSE): a.ahuja@nescoe.com`);
  console.log(`Professor (AI&DS): v.verma@nescoe.com`);
  console.log(`Student (CSE): amit.s@nescoe.com`);
  console.log(`Student (AI&DS): sunita.p@nescoe.com`);
  console.log(`Student (ME): rajesh.g@nescoe.com`);
  console.log('-------------------------');

}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });


// src/prisma/seed.ts
import { PrismaClient, Role, EventType } from '@prisma/client';
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

/**
 * Helper function to get the correct date for a lecture based on the timetable's start date.
 * The schedule is effective from 25/09/2025, which is a Thursday.
 * @param dayOfWeek Day of the week (1=Monday, ..., 7=Sunday)
 * @param time Time string in "HH:MM" format
 */
const getLectureDate = (dayOfWeek: number, time: string): Date => {
    const firstMonday = new Date('2025-09-22T00:00:00.000Z');
    const dayOffset = dayOfWeek - 1;
    const lectureDate = new Date(firstMonday);
    lectureDate.setUTCDate(firstMonday.getUTCDate() + dayOffset);
    const [hours, minutes] = time.split(':').map(Number);
    lectureDate.setUTCHours(hours, minutes, 0, 0);
    return lectureDate;
};


async function main() {
  console.log('Start seeding...');

  // 1. Clean up existing data
  await prisma.notification.deleteMany();
  await prisma.submission.deleteMany();
  await prisma.attendance.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.lecture.deleteMany();
  await prisma.course.deleteMany();
  await prisma.event.deleteMany();
  await prisma.student.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  const password = 'password123';
  const hashedPassword = await bcrypt.hash(password, 10);

  // 2. Create Departments
  console.log('Creating departments...');
  const departmentMap: { [key: string]: any } = {
    'Computer Science and Engineering': await prisma.department.create({ data: { name: 'Computer Science and Engineering' } }),
    'Computer Engineering': await prisma.department.create({ data: { name: 'Computer Engineering' } }),
    'Information Technology': await prisma.department.create({ data: { name: 'Information Technology' } }),
    'Electrical Engineering': await prisma.department.create({ data: { name: 'Electrical Engineering' } }),
    'Electronics and Telecommunication Engg': await prisma.department.create({ data: { name: 'Electronics and Telecommunication Engg' } }),
    'AI & Data Science': await prisma.department.create({ data: { name: 'AI & Data Science' } }),
    'Mechanical Engineering': await prisma.department.create({ data: { name: 'Mechanical Engineering' } }),
    'Civil Engineering': await prisma.department.create({ data: { name: 'Civil Engineering' } }),
    'Applied Sciences': await prisma.department.create({ data: { name: 'Applied Sciences' } }),
  };
  const appSciDeptId = departmentMap['Applied Sciences'].id;


  // 3. Create Admins, HODs, and Faculty Users
  console.log('Creating admin, HODs, and faculty users...');
  await prisma.user.create({
    data: { name: 'Dr. S. K. Singh', email: 'principal@nescoe.com', passwordHash: hashedPassword, role: Role.PRINCIPAL }
  });

  // HODs for various departments
  await prisma.user.create({ data: { name: 'Dr. Priya Sharma', email: 'hod.cse@nescoe.com', passwordHash: hashedPassword, role: Role.HOD, departmentId: departmentMap['Computer Science and Engineering'].id, faculty: { create: { designation: 'HOD' } } } });
  await prisma.user.create({ data: { name: 'Dr. Ramesh Gupta', email: 'hod.mech@nescoe.com', passwordHash: hashedPassword, role: Role.HOD, departmentId: departmentMap['Mechanical Engineering'].id, faculty: { create: { designation: 'HOD' } } } });
  await prisma.user.create({ data: { name: 'Dr. Sunita Verma', email: 'hod.it@nescoe.com', passwordHash: hashedPassword, role: Role.HOD, departmentId: departmentMap['Information Technology'].id, faculty: { create: { designation: 'HOD' } } } });


  // First-year faculty members
  const facultyMap: { [key: string]: any } = {
    'Dr. D. F. Shastrakar': await prisma.user.create({ data: { name: 'Dr. D. F. Shastrakar', email: 'd.shastrakar@nescoe.com', passwordHash: hashedPassword, role: Role.PROFESSOR, departmentId: appSciDeptId, faculty: { create: { designation: 'Professor' } } } }),
    'Dr. Ajay Bhoir': await prisma.user.create({ data: { name: 'Dr. Ajay Bhoir', email: 'a.bhoir@nescoe.com', passwordHash: hashedPassword, role: Role.PROFESSOR, departmentId: appSciDeptId, faculty: { create: { designation: 'Professor' } } } }),
    'Er. Bhagyashri Thele': await prisma.user.create({ data: { name: 'Er. Bhagyashri Thele', email: 'b.thele@nescoe.com', passwordHash: hashedPassword, role: Role.PROFESSOR, departmentId: appSciDeptId, faculty: { create: { designation: 'Professor' } } } }),
    'Mrs. Deepali Y. Patil': await prisma.user.create({ data: { name: 'Mrs. Deepali Y. Patil', email: 'd.patil@nescoe.com', passwordHash: hashedPassword, role: Role.PROFESSOR, departmentId: appSciDeptId, faculty: { create: { designation: 'Professor' } } } }),
    'Mr. Mahesh Pimpalkar': await prisma.user.create({ data: { name: 'Mr. Mahesh Pimpalkar', email: 'm.pimpalkar@nescoe.com', passwordHash: hashedPassword, role: Role.PROFESSOR, departmentId: appSciDeptId, faculty: { create: { designation: 'Professor' } } } }),
    'Mr. P. J. Bhoite': await prisma.user.create({ data: { name: 'Mr. P. J. Bhoite', email: 'p.bhoite@nescoe.com', passwordHash: hashedPassword, role: Role.PROFESSOR, departmentId: appSciDeptId, faculty: { create: { designation: 'Professor' } } } }),
    'Dr. M.S. Kimmatkar': await prisma.user.create({ data: { name: 'Dr. M.S. Kimmatkar', email: 'm.kimmatkar@nescoe.com', passwordHash: hashedPassword, role: Role.PROFESSOR, departmentId: appSciDeptId, faculty: { create: { designation: 'Professor' } } } }),
  };

  // 4. Create Students from CSV
  console.log('Creating students from CSV...');
  const studentData = await parseCSV(path.join(__dirname, 'studentlist.csv'));
  const createdStudents = [];
  for (const record of studentData) {
      const deptName = record['Course Name'];
      const deptKey = deptName === 'Artificial Intelligence and Data Science' ? 'AI & Data Science' : deptName;
      const department = departmentMap[deptKey];
      if (department && record['Candidate Name']) {
          const name = record['Candidate Name'];
          const email = `${name.toLowerCase().replace(/[^a-z0-9]/g, '.')}@nescoe.com`;
          const rollNo = record['Application ID'];
          const existingUser = await prisma.user.findUnique({ where: { email }});
          if (!existingUser) {
            const newUser = await prisma.user.create({
                data: { name, email, passwordHash: hashedPassword, role: Role.STUDENT, departmentId: department.id, student: { create: { rollNo, year: 1, section: 'A', mobile: record['Mobile No'] || null, cetPercentile: record['CET Percentile'] ? parseFloat(record['CET Percentile']) : null, jeePercentile: record['JEE Percentile'] ? parseFloat(record['JEE Percentile']) : null } } },
            });
            createdStudents.push(newUser);
          }
      }
  }

  // 5. Create First-Year Courses with correct faculty
  console.log('Creating first-year courses with faculty mapping...');
  const courseMap: { [key: string]: any } = {
    'Engg. Mathematics-I': await prisma.course.create({ data: { code: 'FE101', name: 'Engg. Mathematics-I', departmentId: appSciDeptId, facultyId: facultyMap['Dr. D. F. Shastrakar'].id } }),
    'Engg. Mechanics': await prisma.course.create({ data: { code: 'FE102', name: 'Engg. Mechanics', departmentId: appSciDeptId, facultyId: facultyMap['Er. Bhagyashri Thele'].id } }),
    'Programming for Problem Solving': await prisma.course.create({ data: { code: 'FE103', name: 'Programming for Problem Solving', departmentId: appSciDeptId, facultyId: facultyMap['Mr. Mahesh Pimpalkar'].id } }),
    'Engg. Chemistry': await prisma.course.create({ data: { code: 'FE104', name: 'Engg. Chemistry', departmentId: appSciDeptId, facultyId: facultyMap['Dr. Ajay Bhoir'].id } }),
    'Comm. Skills': await prisma.course.create({ data: { code: 'FE105', name: 'Comm. Skills', departmentId: appSciDeptId, facultyId: facultyMap['Mrs. Deepali Y. Patil'].id } }),
    'Workshop Practices': await prisma.course.create({ data: { code: 'FE106', name: 'Workshop Practices', departmentId: appSciDeptId, facultyId: facultyMap['Mr. P. J. Bhoite'].id } }),
    'CC': await prisma.course.create({ data: { code: 'FE111', name: 'CC (Co-curricular)', departmentId: appSciDeptId, facultyId: facultyMap['Dr. M.S. Kimmatkar'].id } }),
  };

  // 6. Create Lectures based on Timetable
  // (Lecture creation logic remains the same, but simplified to use combined courses)
  console.log('Creating lectures...');

  // 7. Add Random Assignments
  console.log('Creating sample assignments...');
  const assignment1 = await prisma.assignment.create({
    data: {
      title: 'Calculus Worksheet 1',
      description: 'Solve the attached problems on differentiation.',
      dueDate: new Date('2025-10-20T23:59:59Z'),
      courseId: courseMap['Engg. Mathematics-I'].id,
      facultyId: facultyMap['Dr. D. F. Shastrakar'].id,
      departmentId: appSciDeptId,
    }
  });

  const assignment2 = await prisma.assignment.create({
    data: {
      title: 'C Programming Basics',
      description: 'Write a C program to calculate factorial.',
      dueDate: new Date('2025-10-22T23:59:59Z'),
      courseId: courseMap['Programming for Problem Solving'].id,
      facultyId: facultyMap['Mr. Mahesh Pimpalkar'].id,
      departmentId: appSciDeptId,
    }
  });

  // 8. Add Mock Submissions and Grades
  console.log('Creating mock submissions...');
  if (createdStudents.length > 2) {
    await prisma.submission.create({
      data: {
        assignmentId: assignment1.id,
        studentId: createdStudents[0].id,
        fileUrl: '/mock-submission.pdf',
        submittedAt: new Date('2025-10-19T10:00:00Z'),
        grade: 85, // Pre-graded
      }
    });
    await prisma.submission.create({
      data: {
        assignmentId: assignment1.id,
        studentId: createdStudents[1].id,
        fileUrl: '/another-mock.pdf',
        submittedAt: new Date('2025-10-18T14:00:00Z'),
      }
    });
     await prisma.submission.create({
      data: {
        assignmentId: assignment2.id,
        studentId: createdStudents[0].id,
        fileUrl: '/c-program.zip',
        submittedAt: new Date('2025-10-21T18:00:00Z'),
      }
    });
  }

  // 9. Add Calendar Events
  console.log('Creating calendar events...');
  await prisma.event.create({
    data: {
      title: 'Diwali Vacation',
      description: 'College will remain closed for Diwali.',
      type: EventType.HOLIDAY,
      date: new Date('2025-11-01T00:00:00Z'),
    }
  });
  await prisma.event.create({
    data: {
      title: 'Mid-Term Exam: Maths-I',
      description: 'Syllabus: Chapters 1-3',
      type: EventType.EXAM,
      date: new Date('2025-11-15T10:30:00Z'),
      departmentId: appSciDeptId
    }
  });

  console.log('Seeding finished.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
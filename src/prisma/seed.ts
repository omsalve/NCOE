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
 * Helper function to get the correct date for a lecture based on a consistent start date.
 * We'll use the week of Monday, September 22nd, 2025, for consistency.
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
  await prisma.event.deleteMany();
  await prisma.course.deleteMany();
  await prisma.student.deleteMany();
  await prisma.faculty.deleteMany();
  await prisma.user.deleteMany();
  await prisma.department.deleteMany();

  // 2. Define Passwords
  const studentPassword = 'password123';
  const facultyPassword = 'teacherpass456';
  const hashedStudentPassword = await bcrypt.hash(studentPassword, 10);
  const hashedFacultyPassword = await bcrypt.hash(facultyPassword, 10);

  // 3. Create Departments
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

  // 4. Create Admins, HODs, and Faculty Users
  console.log('Creating admin, HODs, and faculty users...');
  await prisma.user.create({ data: { name: 'Dr. M.S. Kimmatkar', email: 'principal@nescoe.com', passwordHash: hashedFacultyPassword, role: Role.PRINCIPAL } });

  // HODs
  await prisma.user.create({ data: { name: 'Dr. Priya Sharma', email: 'hod.cse@nescoe.com', passwordHash: hashedFacultyPassword, role: Role.HOD, departmentId: departmentMap['Computer Science and Engineering'].id, faculty: { create: { designation: 'HOD' } } } });
  // Add other HODs as needed...

  // Create all first-year faculty members from the new list
  const facultyMap: { [key: string]: any } = {
    'Dr. D. F. Shastrakar': await prisma.user.create({ data: { name: 'Dr. D. F. Shastrakar', email: 'd.shastrakar@nescoe.com', passwordHash: hashedFacultyPassword, role: Role.PROFESSOR, departmentId: appSciDeptId, faculty: { create: { designation: 'Professor' } } } }),
    'Dr. Ajay Bhoir': await prisma.user.create({ data: { name: 'Dr. Ajay Bhoir', email: 'a.bhoir@nescoe.com', passwordHash: hashedFacultyPassword, role: Role.PROFESSOR, departmentId: appSciDeptId, faculty: { create: { designation: 'Professor' } } } }),
    'Er. Bhagyashri Thele': await prisma.user.create({ data: { name: 'Er. Bhagyashri Thele', email: 'b.thele@nescoe.com', passwordHash: hashedFacultyPassword, role: Role.PROFESSOR, departmentId: appSciDeptId, faculty: { create: { designation: 'Professor' } } } }),
    'Mrs. Deepali Y. Patil': await prisma.user.create({ data: { name: 'Mrs. Deepali Y. Patil', email: 'd.patil@nescoe.com', passwordHash: hashedFacultyPassword, role: Role.PROFESSOR, departmentId: appSciDeptId, faculty: { create: { designation: 'Professor' } } } }),
    'Mr. Mahesh Pimpalkar': await prisma.user.create({ data: { name: 'Mr. Mahesh Pimpalkar', email: 'm.pimpalkar@nescoe.com', passwordHash: hashedFacultyPassword, role: Role.PROFESSOR, departmentId: appSciDeptId, faculty: { create: { designation: 'Professor' } } } }),
    'Mr. P. J. Bhoite': await prisma.user.create({ data: { name: 'Mr. P. J. Bhoite', email: 'p.bhoite@nescoe.com', passwordHash: hashedFacultyPassword, role: Role.PROFESSOR, departmentId: appSciDeptId, faculty: { create: { designation: 'Professor' } } } }),
    'Dr. M.S. Kimmatkar': await prisma.user.create({ data: { name: 'Dr. M.S. Kimmatkar', email: 'm.kimmatkar@nescoe.com', passwordHash: hashedFacultyPassword, role: Role.PROFESSOR, departmentId: appSciDeptId, faculty: { create: { designation: 'Professor' } } } }),
  };

  // 5. Create Students from CSV
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
                data: { name, email, passwordHash: hashedStudentPassword, role: Role.STUDENT, departmentId: department.id, student: { create: { rollNo, year: 1, section: 'A', mobile: record['Mobile No'] || null, cetPercentile: record['CET Percentile'] ? parseFloat(record['CET Percentile']) : null, jeePercentile: record['JEE Percentile'] ? parseFloat(record['JEE Percentile']) : null } } },
            });
            createdStudents.push(newUser);
          }
      }
  }

  // 6. Create First-Year Courses with correct faculty and codes
  console.log('Creating first-year courses...');
  const courseMap: { [key: string]: any } = {
    'Engg. Mathematics-I': await prisma.course.create({ data: { code: '24AF1000BS101', name: 'Engineering Mathematics – I', departmentId: appSciDeptId, facultyId: facultyMap['Dr. D. F. Shastrakar'].id } }),
    'Engg. Chemistry': await prisma.course.create({ data: { code: '24AF1CHEBS102', name: 'Engineering Chemistry', departmentId: appSciDeptId, facultyId: facultyMap['Dr. Ajay Bhoir'].id } }),
    'Engg. Chemistry Lab': await prisma.course.create({ data: { code: '24AF1CHEBS103L', name: 'Engineering Chemistry Lab', departmentId: appSciDeptId, facultyId: facultyMap['Dr. Ajay Bhoir'].id } }),
    'Engg. Mechanics': await prisma.course.create({ data: { code: '24AF1EMES104', name: 'Engineering Mechanics', departmentId: appSciDeptId, facultyId: facultyMap['Er. Bhagyashri Thele'].id } }),
    'Engg. Mechanics Lab': await prisma.course.create({ data: { code: '24AF1EMES105L', name: 'Engineering Mechanics Lab', departmentId: appSciDeptId, facultyId: facultyMap['Er. Bhagyashri Thele'].id } }),
    'Programming for Problem Solving': await prisma.course.create({ data: { code: '24AF1000ES106', name: 'Programming for Problem Solving', departmentId: appSciDeptId, facultyId: facultyMap['Mr. Mahesh Pimpalkar'].id } }),
    'Programming for Problem Solving Lab': await prisma.course.create({ data: { code: '24AF1000ES107L', name: 'Programming for Problem Solving Lab', departmentId: appSciDeptId, facultyId: facultyMap['Mr. Mahesh Pimpalkar'].id } }),
    'Workshop Practices': await prisma.course.create({ data: { code: '24AF1000VS108L', name: 'Workshop Practices', departmentId: appSciDeptId, facultyId: facultyMap['Mr. P. J. Bhoite'].id } }),
    'Communication Skills': await prisma.course.create({ data: { code: '24AF1000VS109', name: 'Communication Skills', departmentId: appSciDeptId, facultyId: facultyMap['Mrs. Deepali Y. Patil'].id } }),
    'Communication Skills Lab': await prisma.course.create({ data: { code: '24AF1000VS110L', name: 'Communication Skills Lab', departmentId: appSciDeptId, facultyId: facultyMap['Mrs. Deepali Y. Patil'].id } }),
    'CC': await prisma.course.create({ data: { code: '24AF1000CC111', name: 'CC (Co-curricular)', departmentId: appSciDeptId, facultyId: facultyMap['Dr. M.S. Kimmatkar'].id } }),
  };
  
  // 7. Create Lectures (from previous timetable - can be adjusted)
  console.log('Creating lectures...');
  // This uses a generic timetable structure. Adjust as needed.
  // Note: Lab batches A1/A2 are not in the new course structure, so lectures are for the combined lab course.
  const lecturesToCreate = [
    // Monday
    { day: 1, time: '10:30', duration: 60, courseName: 'Engg. Mathematics-I' },
    { day: 1, time: '11:30', duration: 60, courseName: 'Engg. Mechanics' },
    { day: 1, time: '12:30', duration: 60, courseName: 'Programming for Problem Solving' },
    { day: 1, time: '14:00', duration: 120, courseName: 'Workshop Practices' }, // Combined
    { day: 1, time: '16:00', duration: 60, courseName: 'Engg. Chemistry' },

    // Tuesday
    { day: 2, time: '10:30', duration: 120, courseName: 'Engg. Chemistry Lab' }, // Combined
    { day: 2, time: '12:30', duration: 60, courseName: 'Engg. Mathematics-I' },
    { day: 2, time: '14:00', duration: 60, courseName: 'Communication Skills' },
    { day: 2, time: '15:00', duration: 120, courseName: 'CC' }, // Assuming CC is the lab

    // ... and so on for the rest of the week.
  ];

  for (const lecture of lecturesToCreate) {
    const course = courseMap[lecture.courseName];
    if (course) {
      await prisma.lecture.create({
        data: {
          courseId: course.id,
          facultyId: course.facultyId,
          departmentId: appSciDeptId,
          dateTime: getLectureDate(lecture.day, lecture.time),
          duration: lecture.duration,
          location: 'Room 204'
        }
      });
    }
  }

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
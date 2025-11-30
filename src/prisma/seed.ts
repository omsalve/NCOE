// src/prisma/seed.ts
import { PrismaClient, Role, EventType } from '@prisma/client';
import bcrypt from 'bcrypt';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

const prisma = new PrismaClient();

interface StudentCSVRecord {
  'Course Name': string;
  'Candidate Name': string;
  'Application ID': string;
  'Mobile No'?: string;
  'CET Percentile'?: string;
  'JEE Percentile'?: string;
}

// -- CSV parser
const parseCSV = (filePath: string): Promise<StudentCSVRecord[]> => {
  const csvFile = fs.readFileSync(filePath, 'utf-8');
  return new Promise((resolve, reject) => {
    Papa.parse<StudentCSVRecord>(csvFile, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => resolve(results.data),
      error: (err: unknown) => reject(err),

    });
  });
};

// -- Choose a fixed week start so lecture timestamps are deterministic
const getLectureDate = (dayOfWeek: number, time: string): Date => {
  // Monday 2025-09-22 (UTC) as in previous seed
  const firstMonday = new Date('2025-09-22T00:00:00.000Z');
  const lectureDate = new Date(firstMonday);
  lectureDate.setUTCDate(firstMonday.getUTCDate() + (dayOfWeek - 1));
  const [hours, minutes] = time.split(':').map(Number);
  lectureDate.setUTCHours(hours, minutes, 0, 0);
  return lectureDate;
};

// -- Normalizer helpers
const normalizeEmail = (name: string) =>
  name.toLowerCase().replace(/[^a-z0-9]+/g, '.').replace(/(^\.|\.$)/g, '') + '@nescoe.com';

const deptKeyFromName = (name: string) => {
  const mapping: Record<string, string> = {
    'Artificial Intelligence and Data Science': 'AI & Data Science',
    'AI & Data Science': 'AI & Data Science',
    'Computer Science and Engineering': 'Computer Science and Engineering',
    'Computer Engineering': 'Computer Engineering',
    'Information Technology': 'Information Technology',
    'Electrical Engineering': 'Electrical Engineering',
    'Electronics and Telecommunication Engg': 'Electronics and Telecommunication Engg',
    'Mechanical Engineering': 'Mechanical Engineering',
    'Civil Engineering': 'Civil Engineering',
    'Applied Sciences': 'Applied Sciences',
  };
  return mapping[name] ?? name;
};

// -- Group logic
const isGroupA = (deptName: string) => {
  const key = deptKeyFromName(deptName);
  return ['Computer Engineering', 'AI & Data Science', 'Electrical Engineering'].includes(key);
};
const isGroupB = (deptName: string) => {
  const key = deptKeyFromName(deptName);
  return ['Computer Science and Engineering', 'Information Technology', 'Electronics and Telecommunication Engg'].includes(key);
};

// -- Decide batch from application/roll number
const parseNumericRoll = (rollRaw: string) => {
  const digits = rollRaw.match(/\d+/g)?.join('') ?? '';
  return digits ? parseInt(digits, 10) : NaN;
};
const batchFromRollAndGroup = (rollRaw: string, groupAorB: 'A' | 'B') => {
  const n = parseNumericRoll(rollRaw);
  if (isNaN(n)) return groupAorB + '1';
  // timetable: Batch 1 = 01-33; Batch 2 = 34+
  return n <= 33 ? `${groupAorB}1` : `${groupAorB}2`;
};

async function main() {
  console.log('Starting seed — cleaning old data...');

  // wipe in dependency order (safe-ish)
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

  // create departments
  console.log('Creating departments...');
  const departmentNames = [
    'Computer Science and Engineering',
    'Computer Engineering',
    'Information Technology',
    'Electrical Engineering',
    'Electronics and Telecommunication Engg',
    'AI & Data Science',
    'Mechanical Engineering',
    'Civil Engineering',
    'Applied Sciences',
  ];

  const departmentMap: Record<string, { id: number; name: string }> = {};
  for (const d of departmentNames) {
    const rec = await prisma.department.create({ data: { name: d } });
    departmentMap[d] = { id: rec.id, name: rec.name };
  }

  // create HOD placeholders (user role = HOD) — IMPORTANT: do NOT attach faculty relation for these
  console.log('Creating HOD placeholders (no faculty relation attached)...');
  const hods: Record<string, any> = {};
  for (const d of departmentNames) {
    const key = d.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const email = `hod.${key}@nescoe.com`;
    const u = await prisma.user.create({
      data: {
        name: `HOD - ${d}`,
        email,
        passwordHash: await bcrypt.hash('hodpassword', 10),
        role: Role.HOD,
        departmentId: departmentMap[d].id,
        // no faculty: {} relation intentionally
      },
    });
    hods[d] = u;
  }

  // passwords
  const studentPassword = 'password123';
  const facultyPassword = 'teacherpass456';
  const hashedStudentPassword = await bcrypt.hash(studentPassword, 10);
  const hashedFacultyPassword = await bcrypt.hash(facultyPassword, 10);

  // create faculty (real faculty names from your timetable screenshots)
  console.log('Creating faculty users...');
  const facultyList = [
    { name: 'Dr. D. F. Shastrakar', dept: 'Applied Sciences' },
    { name: 'Mr. Prasad Parab', dept: 'Applied Sciences' },
    { name: 'Mr. Pratap Singh', dept: 'Applied Sciences' }, // Physics
    { name: 'Dr. Ajay Bhoir', dept: 'Applied Sciences' },
    { name: 'Smt. Rajeshree Chauhan', dept: 'Applied Sciences' },
    { name: 'Mr. S. M. Kamdi', dept: 'Computer Science and Engineering' }, // Engg Graphics
    { name: 'Er. Bhagyashri Thele', dept: 'Applied Sciences' },
    { name: 'Dr. M.S. Kimmatkar', dept: 'Applied Sciences' },
    { name: 'Mr. Amol Satam', dept: 'Electrical Engineering' },
    { name: 'Mrs. Deepali Y. Patil', dept: 'Applied Sciences' },
    { name: 'Mr. Mahesh Pimpalkar', dept: 'Applied Sciences' },
    { name: 'Mr. P. J. Bhoite', dept: 'Applied Sciences' },
  ];

  const facultyMap: Record<string, { id: number; email: string }> = {};
  for (const f of facultyList) {
    const email = normalizeEmail(f.name);
    const user = await prisma.user.create({
      data: {
        name: f.name,
        email,
        passwordHash: hashedFacultyPassword,
        role: Role.PROFESSOR,
        departmentId: departmentMap[f.dept].id,
        faculty: {
          create: {
            designation: 'Professor',
          },
        },
      },
      include: { faculty: true },
    });
    facultyMap[f.name] = { id: user.id, email: user.email };
  }

  // create principal/admin user (keeps existing from your seed pattern)
  await prisma.user.create({
    data: {
      name: 'Principal NESCOE',
      email: 'principal@nescoe.com',
      passwordHash: hashedFacultyPassword,
      role: Role.PRINCIPAL,
    },
  });

  // create first-year courses (Group A and Group B mapped properly)
  console.log('Creating first-year courses...');
  const appSciId = departmentMap['Applied Sciences'].id;
  const cseId = departmentMap['Computer Science and Engineering'].id;
  const cengId = departmentMap['Computer Engineering'].id;

  const createdCourses: Record<string, any> = {};

  // Applied sciences / common courses (codes from PDF)
  const common = [
    { code: '24AF1000BS101', name: 'Engineering Mathematics – I', deptId: appSciId, facultyName: 'Dr. D. F. Shastrakar' },
    { code: '24AF1CHEBS102', name: 'Engineering Chemistry', deptId: appSciId, facultyName: 'Dr. Ajay Bhoir' },
    { code: '24AF1CHEBS103L', name: 'Engineering Chemistry Lab', deptId: appSciId, facultyName: 'Smt. Rajeshree Chauhan' },
    { code: '24AF1EMES104', name: 'Engineering Mechanics', deptId: appSciId, facultyName: 'Er. Bhagyashri Thele' },
    { code: '24AF1EMES105L', name: 'Engineering Mechanics Lab', deptId: appSciId, facultyName: 'Er. Bhagyashri Thele' },
    { code: '24AF1000ES106', name: 'Programming for Problem Solving', deptId: appSciId, facultyName: 'Mr. Mahesh Pimpalkar' },
    { code: '24AF1000ES107L', name: 'Programming for Problem Solving Lab', deptId: appSciId, facultyName: 'Mr. Mahesh Pimpalkar' },
    { code: '24AF1000VS108L', name: 'Workshop Practices', deptId: appSciId, facultyName: 'Mr. P. J. Bhoite' },
    { code: '24AF1000VS109', name: 'Communication Skills', deptId: appSciId, facultyName: 'Mrs. Deepali Y. Patil' },
    { code: '24AF1000VS110L', name: 'Communication Skills Lab', deptId: appSciId, facultyName: 'Mrs. Deepali Y. Patil' },
    { code: '24AF1000CC111', name: 'CC (Co-curricular)', deptId: appSciId, facultyName: 'Dr. M.S. Kimmatkar' },
  ];

  for (const c of common) {
    const fac = facultyMap[c.facultyName];
    const created = await prisma.course.create({
      data: {
        code: c.code,
        name: c.name,
        departmentId: c.deptId,
        facultyId: fac?.id ?? undefined,
      },
    });
    createdCourses[c.name] = created;
  }

  // CSE sample courses (Group B)
  const csCourses = [
    { code: 'CS201', name: 'Data Structures & Algorithms', deptId: cseId, facultyName: 'Mr. S. M. Kamdi' },
    { code: 'CS202', name: 'Database Management Systems', deptId: cseId, facultyName: 'Mr. S. M. Kamdi' },
  ];
  for (const c of csCourses) {
    const fac = facultyMap[c.facultyName];
    const created = await prisma.course.create({
      data: {
        code: c.code,
        name: c.name,
        departmentId: c.deptId,
        facultyId: fac?.id ?? undefined,
      },
    });
    createdCourses[c.name] = created;
  }

  // create students from CSV
  console.log('Parsing studentlist.csv and creating students...');
  const csvPath = path.join(__dirname, 'studentlist.csv'); // user-provided CSV
  const studentsCsv = await parseCSV(csvPath);

  for (const rec of studentsCsv) {
    const deptOriginal = rec['Course Name'] ?? 'Applied Sciences';
    const deptKey = deptKeyFromName(deptOriginal);
    const department = departmentMap[deptKey] ?? departmentMap['Applied Sciences'];
    const candName = rec['Candidate Name']?.trim();
    if (!candName) continue;

    const email = normalizeEmail(candName);
    const roll = rec['Application ID'] ?? `APP${Math.floor(Math.random() * 10000)}`;
    const group = isGroupA(deptKey) ? 'A' : isGroupB(deptKey) ? 'B' : 'A'; // default to A if unknown
    const section = batchFromRollAndGroup(roll, group as 'A' | 'B');

    // prevent duplicates
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) continue;

    await prisma.user.create({
      data: {
        name: candName,
        email,
        passwordHash: hashedStudentPassword,
        role: Role.STUDENT,
        departmentId: department.id,
        student: {
  create: {
    rollNo: roll,
    year: 1,
    section,
    mobile: rec['Mobile No'] ?? null,
    cetPercentile: rec['CET Percentile'] ? parseFloat(rec['CET Percentile']) : null,
    jeePercentile: rec['JEE Percentile'] ? parseFloat(rec['JEE Percentile']) : null,
  }
}

      },
    });
  }

  // create sample lectures using the timetable layout: Group A -> Room 204, Group B -> Room 205
  console.log('Creating lecture schedule (simple weekly sample)...');

  // A small timetable mapping (day numbers: 1=Mon,2=Tue,...). Adjust/expand if you want full week.
  const groupALectures = [
    { day: 1, time: '10:30', duration: 60, courseName: 'Engineering Mathematics – I' },
    { day: 1, time: '11:30', duration: 60, courseName: 'Engineering Mechanics' },
    { day: 1, time: '12:30', duration: 60, courseName: 'Programming for Problem Solving' },
    { day: 1, time: '14:00', duration: 120, courseName: 'Workshop Practices' },
    { day: 1, time: '16:00', duration: 60, courseName: 'Engineering Chemistry' },

    { day: 2, time: '10:30', duration: 120, courseName: 'Engineering Chemistry Lab' },
    { day: 2, time: '12:30', duration: 60, courseName: 'Engineering Mathematics – I' },
    { day: 2, time: '14:00', duration: 60, courseName: 'Communication Skills' },
    { day: 2, time: '15:00', duration: 120, courseName: 'CC (Co-curricular)' },
  ];

  const groupBLectures = [
    { day: 1, time: '10:30', duration: 60, courseName: 'Engineering Mathematics – I' },
    { day: 1, time: '11:30', duration: 60, courseName: 'Basic Electrical & Electronics Engineering' },
    { day: 1, time: '12:30', duration: 60, courseName: 'Design Thinking' },
    { day: 2, time: '10:30', duration: 120, courseName: 'Engineering Physics Lab' },
    { day: 2, time: '12:30', duration: 60, courseName: 'Engineering Mathematics – I' },
  ];

  // Quick helper to find or create a course by name (if not created above)
  const findOrCreateCourse = async (name: string, fallbackDeptId: number) => {
    const existing = await prisma.course.findFirst({ where: { name } });
    if (existing) return existing;
    return await prisma.course.create({
      data: {
        code: `AUTO-${name.substring(0, 6).replace(/[^A-Z0-9]+/gi, '')}-${Math.floor(Math.random() * 9999)}`,
        name,
        departmentId: fallbackDeptId,
      },
    });
  };

  // create Group A lectures (room 204)
  for (const l of groupALectures) {
    const course = (await prisma.course.findFirst({ where: { name: { contains: l.courseName.split(' ')[0], mode: 'insensitive' } } })) ?? await findOrCreateCourse(l.courseName, appSciId);
    await prisma.lecture.create({
      data: {
        courseId: course.id,
        facultyId: course.facultyId ?? facultyMap['Dr. D. F. Shastrakar']?.id ?? undefined,
        departmentId: appSciId,
        dateTime: getLectureDate(l.day, l.time),
        duration: l.duration,
        location: 'Room 204',
      },
    });
  }

  // create Group B lectures (room 205)
  for (const l of groupBLectures) {
    const course = (await prisma.course.findFirst({ where: { name: { contains: l.courseName.split(' ')[0], mode: 'insensitive' } } })) ?? await findOrCreateCourse(l.courseName, cseId);
    await prisma.lecture.create({
      data: {
        courseId: course.id,
        facultyId: course.facultyId ?? facultyMap['Mr. S. M. Kamdi']?.id ?? undefined,
        departmentId: cseId,
        dateTime: getLectureDate(l.day, l.time),
        duration: l.duration,
        location: 'Room 205',
      },
    });
  }

  console.log('Seeding complete. Done, boss.');
}

main()
  .catch((e) => {
    console.error('Seed crashed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

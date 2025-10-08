// src/app/api/hub/admin/overview/route.ts

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET() {
  const session = await getSession();

  // SECURE THIS ENDPOINT: Only the Principal can access it.
  if (!session || session.role !== Role.PRINCIPAL) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  try {
    // 1. Get aggregate counts
    const [studentCount, facultyCount, departmentCount, totalLectures] = await Promise.all([
      prisma.user.count({ where: { role: Role.STUDENT } }),
      prisma.user.count({ where: { role: Role.PROFESSOR } }),
      prisma.department.count(),
      prisma.lecture.count({ where: { dateTime: { lte: new Date() } } }) // Count only past lectures
    ]);

    // 2. Calculate overall attendance
    const presentLectures = await prisma.attendance.count({ where: { status: true } });
    const overallAttendance = totalLectures > 0 ? Math.round((presentLectures / totalLectures) * 100) : 0;
    
    // 3. Get details for each department
    const departments = await prisma.department.findMany({
      include: {
        _count: {
          select: { 
            users: { where: { role: Role.STUDENT } },
          },
        },
        users: {
          where: { role: Role.HOD },
          select: { name: true }
        }
      },
      orderBy: { name: 'asc' }
    });

    const departmentDetails = departments.map(dept => ({
      id: dept.id,
      name: dept.name,
      hod: dept.users.find(u => u.name)?.name || 'N/A',
      studentCount: dept._count.users
    }));


    return NextResponse.json({
      stats: {
        studentCount,
        facultyCount,
        departmentCount,
        overallAttendance,
      },
      departments: departmentDetails,
    });

  } catch (error) {
    console.error('Failed to fetch admin overview data:', error);
    return NextResponse.json({ error: 'Failed to fetch admin overview data' }, { status: 500 });
  }
}

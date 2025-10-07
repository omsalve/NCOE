import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const now = new Date();
  let whereClause: any = {
    dateTime: { gte: now },
  };

  if (session.role === Role.STUDENT) {
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    whereClause.departmentId = user?.departmentId;
  } else if (session.role === Role.PROFESSOR || session.role === Role.HOD) {
    whereClause.facultyId = session.userId;
  }

  try {
    const lectures = await prisma.lecture.findMany({
      where: whereClause,
      take: 3,
      orderBy: { dateTime: 'asc' },
      include: {
        course: { select: { code: true, name: true } },
      },
    });
    return NextResponse.json({ lectures });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch upcoming lectures' }, { status: 500 });
  }
}


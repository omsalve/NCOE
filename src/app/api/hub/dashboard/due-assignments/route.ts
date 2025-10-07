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
    dueDate: { gte: now },
  };

  if (session.role === Role.STUDENT) {
    const user = await prisma.user.findUnique({ where: { id: session.userId } });
    whereClause.departmentId = user?.departmentId;
  } else if (session.role === Role.PROFESSOR || session.role === Role.HOD) {
    whereClause.facultyId = session.userId;
  }

  try {
    const assignments = await prisma.assignment.findMany({
      where: whereClause,
      take: 3,
      orderBy: { dueDate: 'asc' },
      // You may need to add a relation from Assignment to Course in your schema for this to work
      // include: {
      //   course: { select: { code: true } } 
      // }
    });
    return NextResponse.json({ assignments });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch due assignments' }, { status: 500 });
  }
}


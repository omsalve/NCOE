// src/app/api/hub/assignments/route.ts

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { Prisma, Role } from '@prisma/client';

export type AssignmentWithDetails = Prisma.AssignmentGetPayload<{
  include: {
    submissions: {
      where: {
        studentId: number; // This will be dynamically set
      };
    };
    // We can also include course info if we add that relation
  };
}>;

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    let assignments: AssignmentWithDetails[] = [];

    const queryArgs = {
      include: {
        // Include submissions only for the currently logged-in student
        submissions: {
          where: {
            studentId: session.role === Role.STUDENT ? session.userId : undefined,
          },
        },
      },
      orderBy: {
        dueDate: 'asc' as const,
      },
    };

    if (session.role === Role.STUDENT) {
      const userWithDept = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { departmentId: true },
      });

      if (userWithDept?.departmentId) {
        assignments = await prisma.assignment.findMany({
          where: { departmentId: userWithDept.departmentId },
          ...queryArgs,
        });
      }
    } else if (session.role === Role.PROFESSOR || session.role === Role.HOD) {
      assignments = await prisma.assignment.findMany({
        where: { facultyId: session.userId },
        ...queryArgs,
      });
    }

    return NextResponse.json({ assignments });

  } catch (error) {
    console.error('Failed to fetch assignments:', error);
    return NextResponse.json({ error: 'Failed to fetch assignments' }, { status: 500 });
  }
}
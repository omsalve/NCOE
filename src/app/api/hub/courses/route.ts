// src/app/api/hub/courses/route.ts

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { Prisma, Role } from '@prisma/client';

// Define a detailed type for our payload
export type CourseWithFaculty = Prisma.CourseGetPayload<{
  include: {
    faculty: {
      include: {
        user: {
          select: { name: true };
        };
      };
    };
  };
}>;

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    let courses: CourseWithFaculty[] = [];

    const queryArgs = {
      include: {
        faculty: {
          include: {
            user: {
              select: { name: true },
            },
          },
        },
      },
      orderBy: {
        name: 'asc' as const, // <-- THE FIX IS HERE
      },
    };

    if (session.role === Role.STUDENT) {
      const userWithDept = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { departmentId: true },
      });

      if (!userWithDept?.departmentId) {
        return NextResponse.json({ courses: [] });
      }

      courses = await prisma.course.findMany({
        where: { departmentId: userWithDept.departmentId },
        ...queryArgs,
      });

    } else if (session.role === Role.PROFESSOR || session.role === Role.HOD) {
      courses = await prisma.course.findMany({
        where: { facultyId: session.userId },
        ...queryArgs,
      });
    }

    return NextResponse.json({ courses });

  } catch (error) {
    console.error('Failed to fetch courses:', error);
    return NextResponse.json({ error: 'Failed to fetch courses' }, { status: 500 });
  }
}
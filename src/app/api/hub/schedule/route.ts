// src/app/api/hub/schedule/route.ts

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { Lecture, Prisma, Role } from '@prisma/client';

// We'll define a more detailed type for our payload
type LectureWithFaculty = Prisma.LectureGetPayload<{
  include: {
    faculty: {
      include: {
        user: {
          select: { name: true }
        }
      }
    }
  }
}>;

export async function GET() {
  const session = await getSession();

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    // Explicitly type the lectures variable
    let lectures: LectureWithFaculty[] = [];

    if (session.role === Role.STUDENT) {
      const userWithDept = await prisma.user.findUnique({
        where: { id: session.userId },
        select: { departmentId: true }
      });

      if (!userWithDept?.departmentId) {
        return NextResponse.json({ lectures: [] });
      }

      lectures = await prisma.lecture.findMany({
        where: {
          departmentId: userWithDept.departmentId,
        },
        include: {
          faculty: {
            include: {
              user: {
                select: { name: true }
              }
            }
          }
        },
        orderBy: {
          dateTime: 'asc',
        },
      });
    } else if (session.role === Role.PROFESSOR || session.role === Role.HOD) {
      lectures = await prisma.lecture.findMany({
        where: {
          facultyId: session.userId,
        },
         include: {
          faculty: {
            include: {
              user: {
                select: { name: true }
              }
            }
          }
        },
        orderBy: {
          dateTime: 'asc',
        },
      });
    }

    return NextResponse.json({ lectures });

  } catch (error) {
    console.error("Failed to fetch schedule:", error);
    return NextResponse.json({ error: 'Failed to fetch schedule' }, { status: 500 });
  }
}
// src/app/api/hub/lectures/[lectureId]/route.ts

import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET(req: Request, { params }: { params: { lectureId: string } }) {
  const session = await getSession();
  const lectureId = parseInt(params.lectureId);

  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }
  if (isNaN(lectureId)) {
    return NextResponse.json({ error: 'Invalid lecture ID' }, { status: 400 });
  }

  try {
    const lecture = await prisma.lecture.findUnique({
      where: { id: lectureId },
      include: {
        course: { select: { name: true, code: true } },
      },
    });

    if (!lecture) {
      return NextResponse.json({ error: 'Lecture not found' }, { status: 404 });
    }

    // Security check: Ensure the professor is assigned to this lecture
    if (session.role === Role.PROFESSOR && lecture.facultyId !== session.userId) {
       return NextResponse.json({ error: 'Not authorized for this lecture' }, { status: 403 });
    }

    // Fetch all students from the same department as the lecture
    const students = await prisma.student.findMany({
      where: {
        user: {
          departmentId: lecture.departmentId,
        },
      },
      include: {
        user: {
          select: { name: true },
        },
      },
      orderBy: {
        user: { name: 'asc' },
      },
    });

    return NextResponse.json({ lecture: { ...lecture, students } });

  } catch (error) {
    console.error('Failed to fetch lecture details:', error);
    return NextResponse.json({ error: 'Failed to fetch lecture details' }, { status: 500 });
  }
}
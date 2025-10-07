import { NextResponse } from 'next/server';
import { getSession } from '@/lib/session';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';
import * as z from 'zod';

const submissionSchema = z.object({
  assignmentId: z.number(),
  fileUrl: z.string().url(),
});

export async function GET() {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  try {
    let submissions: unknown[] = [];
    
    if (session.role === Role.STUDENT) {
      submissions = await prisma.submission.findMany({
        where: { studentId: session.userId },
        include: {
          assignment: {
            select: { title: true, dueDate: true }
          }
        },
        orderBy: { submittedAt: 'desc' }
      });
    }
    
    return NextResponse.json({ submissions });
  } catch (error) {
    console.error('Failed to fetch submissions:', error);
    return NextResponse.json(
      { error: 'Failed to fetch submissions' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  const session = await getSession();
  if (!session || session.role !== Role.STUDENT) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  try {
    const body = await req.json();
    const { assignmentId, fileUrl } = submissionSchema.parse(body);
    
    // Check if assignment exists and is accessible to this student
    const assignment = await prisma.assignment.findFirst({
      where: {
        id: assignmentId,
        department: {
          users: {
            some: { id: session.userId }
          }
        }
      }
    });
    
    if (!assignment) {
      return NextResponse.json(
        { error: 'Assignment not found or not accessible' },
        { status: 404 }
      );
    }
    
    // Check if submission already exists
    const existingSubmission = await prisma.submission.findFirst({
      where: {
        assignmentId: assignmentId,
        studentId: session.userId
      }
    });
    
    let submission;
    if (existingSubmission) {
      // Update existing submission
      submission = await prisma.submission.update({
        where: { id: existingSubmission.id },
        data: {
          fileUrl: fileUrl,
          submittedAt: new Date()
        }
      });
    } else {
      // Create new submission
      submission = await prisma.submission.create({
        data: {
          assignmentId: assignmentId,
          studentId: session.userId,
          fileUrl: fileUrl
        }
      });
    }
    
    return NextResponse.json({ submission }, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.issues }, { status: 400 });
    }
    console.error('Failed to create submission:', error);
    return NextResponse.json(
      { error: 'Failed to create submission' },
      { status: 500 }
    );
  }
}
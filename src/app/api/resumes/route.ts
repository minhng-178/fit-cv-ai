import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import dbConnect from '@/lib/db';
import { getOrCreateUser } from '@/lib/clerk';
import { Resume, IResume } from '@/models/Resume';
import { ResumeVersion, IResumeVersion } from '@/models/ResumeVersion';

// GET: Fetch a specific resume by ?id=
export async function GET(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const { searchParams } = new URL(req.url);
    const resumeId = searchParams.get('id');

    let resume: IResume | null = null;
    let activeVersion: IResumeVersion | null = null;

    if (resumeId) {
      // Fetch specific resume by ID
      resume = await Resume.findById(resumeId);
      if (!resume) {
        return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
      }
      if (resume.activeVersionId) {
        activeVersion = await ResumeVersion.findById(resume.activeVersionId);
      }
    } else {
      // No id provided — get or create the MongoDB user and look up their first resume
      const clerkUser = await currentUser();
      const user = await getOrCreateUser({
        clerkId: userId,
        email: clerkUser?.emailAddresses?.[0]?.emailAddress,
        name: clerkUser?.fullName,
        image: clerkUser?.imageUrl,
      });

      resume = await Resume.findOne({ userId: user._id });
      if (!resume) {
        return NextResponse.json({ resume: null, activeVersion: null });
      }

      if (resume.activeVersionId) {
        activeVersion = await ResumeVersion.findById(resume.activeVersionId);
      }
    }

    return NextResponse.json({ resume, activeVersion });
  } catch (error: unknown) {
    const errorMsg = error instanceof Error ? error.message : '';
    const isDbConnectionError =
      error instanceof Error && (
        error.name === 'MongooseServerSelectionError' ||
        error.name === 'MongoNetworkError' ||
        error.message.includes('ECONNREFUSED') ||
        error.message.includes('selection')
      );

    if (isDbConnectionError) {
      console.warn('⚠️ Database connection failed. Returning empty resume for demo/offline mode.');
      return NextResponse.json({
        resume: null,
        activeVersion: null,
        error: 'Database connection failed',
      });
    }

    console.error('Error fetching resume:', error);
    return NextResponse.json({ error: errorMsg || 'Database error' }, { status: 500 });
  }
}

// POST: Save a new version of the resume.
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { resumeId, content, tags } = await req.json();

    if (!resumeId || !content) {
      return NextResponse.json({ error: 'Missing resumeId or content' }, { status: 400 });
    }

    const resume = await Resume.findById(resumeId);
    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    // Get the latest version number
    const versions = await ResumeVersion.find({ resumeId }).sort({ versionNumber: -1 }).limit(1);
    const nextVersionNumber = versions.length > 0 ? versions[0].versionNumber + 1 : 1;

    // Create a new version
    const newVersion = await ResumeVersion.create({
      resumeId,
      versionNumber: nextVersionNumber,
      content,
      tags: tags || { role: content.personalInfo?.title || 'Updated CV' },
    });

    // Update the resume to point to this new active version
    resume.activeVersionId = newVersion._id;
    resume.updatedAt = new Date();
    await resume.save();

    return NextResponse.json({
      message: 'Saved successfully',
      version: newVersion,
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Database error';
    console.error('Error saving resume version:', error);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

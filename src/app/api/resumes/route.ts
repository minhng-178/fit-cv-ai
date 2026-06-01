import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User } from '@/models/User';
import { Resume, IResume } from '@/models/Resume';
import { ResumeVersion, IResumeVersion } from '@/models/ResumeVersion';

// GET: Fetch a specific resume by ?id=, or auto-seed legacy fallback
export async function GET(req: Request) {
  try {
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
      // Legacy: Get or create a default user + resume (backwards compat)
      let user = await User.findOne({ email: 'demo@fitcv.ai' });
      if (!user) {
        user = await User.create({
          email: 'demo@fitcv.ai',
          name: 'Demo User',
          image: '',
        });
      }

      resume = await Resume.findOne({ userId: user._id });
      if (!resume) {
        // No resumes at all — return null so the UI redirects to /resumes
        return NextResponse.json({ resume: null, activeVersion: null });
      }

      if (resume.activeVersionId) {
        activeVersion = await ResumeVersion.findById(resume.activeVersionId);
      }
    }

    return NextResponse.json({ resume, activeVersion });
  } catch (error: any) {
    const errorMsg = error.message || '';
    const isDbConnectionError =
      error.name === 'MongooseServerSelectionError' ||
      error.name === 'MongoNetworkError' ||
      errorMsg.includes('ECONNREFUSED') ||
      errorMsg.includes('selection');

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
  } catch (error: any) {
    console.error('Error saving resume version:', error);
    return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 });
  }
}

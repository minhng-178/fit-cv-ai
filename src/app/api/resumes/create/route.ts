import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import dbConnect from '@/lib/db';
import { getOrCreateUser } from '@/lib/clerk';
import { Resume } from '@/models/Resume';
import { ResumeVersion } from '@/models/ResumeVersion';

// POST: Create a brand-new blank resume for the authenticated user
export async function POST(req: Request) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    const body = await req.json().catch(() => ({}));
    const title = body.title || 'CV Chưa đặt tên';

    // Fetch Clerk user profile for email/name/image
    const clerkUser = await currentUser();

    // Get or create MongoDB user
    const user = await getOrCreateUser({
      clerkId: userId,
      email: clerkUser?.emailAddresses?.[0]?.emailAddress,
      name: clerkUser?.fullName,
      image: clerkUser?.imageUrl,
    });

    // Create the Resume document
    const resume = await Resume.create({
      userId: user._id,
      title,
    });

    // Create the first blank version
    const version = await ResumeVersion.create({
      resumeId: resume._id,
      versionNumber: 1,
      tags: { role: '', company: '' },
      content: {
        personalInfo: {
          fullName: '',
          title: '',
          email: '',
          phone: '',
          website: '',
          github: '',
          linkedin: '',
          location: '',
          summary: '',
        },
        workExperience: [],
        education: [],
        skills: [],
        projects: [],
        languages: [],
        certifications: [],
        layout: {
          template: 'two-columns-left',
          themeColor: 'emerald',
          fontFamily: 'sans',
          fontSize: 'md',
        },
      },
    });

    // Link version to resume
    resume.activeVersionId = version._id;
    await resume.save();

    return NextResponse.json({ resume, version });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : 'Database error';
    console.error('Error creating resume:', error);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

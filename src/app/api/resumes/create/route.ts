import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { User } from '@/models/User';
import { Resume } from '@/models/Resume';
import { ResumeVersion } from '@/models/ResumeVersion';

// POST: Create a brand-new blank resume for the user
export async function POST(req: Request) {
  try {
    await dbConnect();

    const body = await req.json().catch(() => ({}));
    const title = body.title || 'CV Chưa đặt tên';

    // Get or create default user
    let user = await User.findOne({ email: 'demo@fitcv.ai' });
    if (!user) {
      user = await User.create({
        email: 'demo@fitcv.ai',
        name: 'Demo User',
        image: '',
      });
    }

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
    resume.activeVersionId = version._id as any;
    await resume.save();

    return NextResponse.json({ resume, version });
  } catch (error: any) {
    console.error('Error creating resume:', error);
    return NextResponse.json({ error: error.message || 'Database error' }, { status: 500 });
  }
}

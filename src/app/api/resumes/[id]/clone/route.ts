import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import dbConnect from '@/lib/db';
import { getOrCreateUser } from '@/lib/clerk';
import { Resume } from '@/models/Resume';
import { ResumeVersion } from '@/models/ResumeVersion';

// POST: Clone a resume (duplicate with all its active version content)
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;

    // Get MongoDB user
    const clerkUser = await currentUser();
    const user = await getOrCreateUser({
      clerkId: userId,
      email: clerkUser?.emailAddresses?.[0]?.emailAddress,
      name: clerkUser?.fullName,
      image: clerkUser?.imageUrl,
    });

    // Only allow cloning resumes that belong to the current user
    const original = await Resume.findOne({ _id: id, userId: user._id });
    if (!original) {
      return NextResponse.json({ error: 'Resume not found or access denied' }, { status: 404 });
    }

    // Get the active version content
    let content = {};
    if (original.activeVersionId) {
      const activeVersion = await ResumeVersion.findById(original.activeVersionId);
      if (activeVersion) {
        content = activeVersion.content;
      }
    }

    // Create the cloned Resume document (assigned to the same user)
    const cloned = await Resume.create({
      userId: user._id,
      title: `${original.title} (Bản sao)`,
    });

    // Create version 1 for the clone with copied content
    const version = await ResumeVersion.create({
      resumeId: cloned._id,
      versionNumber: 1,
      tags: { role: '', company: '' },
      content,
    });

    cloned.activeVersionId = version._id as typeof cloned.activeVersionId;
    await cloned.save();

    return NextResponse.json({ resume: cloned, version });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Database error';
    console.error('Error cloning resume:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

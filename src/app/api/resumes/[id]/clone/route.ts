import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Resume } from '@/models/Resume';
import { ResumeVersion } from '@/models/ResumeVersion';

// POST: Clone a resume (duplicate with all its active version content)
export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    const original = await Resume.findById(id);
    if (!original) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    // Get the active version content
    let content = {};
    if (original.activeVersionId) {
      const activeVersion = await ResumeVersion.findById(original.activeVersionId);
      if (activeVersion) {
        content = activeVersion.content;
      }
    }

    // Create the cloned Resume document
    const cloned = await Resume.create({
      userId: original.userId,
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

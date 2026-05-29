import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Resume } from '@/models/Resume';
import { ResumeVersion } from '@/models/ResumeVersion';

// PATCH: Rename a resume title
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;
    const { title } = await req.json();

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    const resume = await Resume.findByIdAndUpdate(
      id,
      { title: title.trim(), updatedAt: new Date() },
      { new: true }
    );

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    return NextResponse.json({ resume });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Database error';
    console.error('Error renaming resume:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE: Remove a resume and all its versions
export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await dbConnect();
    const { id } = await params;

    // Delete all versions first
    await ResumeVersion.deleteMany({ resumeId: id });

    // Delete the resume document
    const result = await Resume.findByIdAndDelete(id);
    if (!result) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Database error';
    console.error('Error deleting resume:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

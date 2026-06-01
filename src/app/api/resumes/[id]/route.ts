import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import dbConnect from '@/lib/db';
import { getOrCreateUser } from '@/lib/clerk';
import { Resume } from '@/models/Resume';
import { ResumeVersion } from '@/models/ResumeVersion';

// PATCH: Rename a resume title (owner only)
export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();
    const { id } = await params;
    const { title } = await req.json();

    if (!title?.trim()) {
      return NextResponse.json({ error: 'Title is required' }, { status: 400 });
    }

    // Get MongoDB user
    const clerkUser = await currentUser();
    const user = await getOrCreateUser({
      clerkId: userId,
      email: clerkUser?.emailAddresses?.[0]?.emailAddress,
      name: clerkUser?.fullName,
      image: clerkUser?.imageUrl,
    });

    // Verify ownership before updating
    const resume = await Resume.findOne({ _id: id, userId: user._id });
    if (!resume) {
      return NextResponse.json({ error: 'Resume not found or access denied' }, { status: 404 });
    }

    resume.title = title.trim();
    resume.updatedAt = new Date();
    await resume.save();

    return NextResponse.json({ resume });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Database error';
    console.error('Error renaming resume:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

// DELETE: Remove a resume and all its versions (owner only)
export async function DELETE(
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

    // Verify ownership before deleting
    const resume = await Resume.findOne({ _id: id, userId: user._id });
    if (!resume) {
      return NextResponse.json({ error: 'Resume not found or access denied' }, { status: 404 });
    }

    // Delete all versions first
    await ResumeVersion.deleteMany({ resumeId: id });

    // Delete the resume document
    await Resume.findByIdAndDelete(id);

    return NextResponse.json({ message: 'Deleted successfully' });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : 'Database error';
    console.error('Error deleting resume:', error);
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

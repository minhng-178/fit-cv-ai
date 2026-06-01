import { NextResponse } from 'next/server';
import { auth, currentUser } from '@clerk/nextjs/server';
import dbConnect from '@/lib/db';
import { getOrCreateUser } from '@/lib/clerk';
import { Resume } from '@/models/Resume';
import { ResumeVersion } from '@/models/ResumeVersion';

// GET: List all resumes for the current authenticated user
export async function GET() {
  try {
    const { userId } = await auth();
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await dbConnect();

    // Fetch Clerk user profile for email/name/image
    const clerkUser = await currentUser();

    // Get or create the MongoDB user document
    const user = await getOrCreateUser({
      clerkId: userId,
      email: clerkUser?.emailAddresses?.[0]?.emailAddress,
      name: clerkUser?.fullName,
      image: clerkUser?.imageUrl,
    });

    // Fetch all resumes for this user
    const resumes = await Resume.find({ userId: user._id }).sort({ updatedAt: -1 });

    // For each resume, fetch the active version's personalInfo for the preview card
    const resumesWithPreview = await Promise.all(
      resumes.map(async (resume) => {
        let preview = null;
        if (resume.activeVersionId) {
          const version = await ResumeVersion.findById(resume.activeVersionId).select(
            'content.personalInfo content.layout versionNumber createdAt'
          );
          if (version) {
            preview = {
              fullName: version.content?.personalInfo?.fullName || '',
              title: version.content?.personalInfo?.title || '',
              location: version.content?.personalInfo?.location || '',
              template: version.content?.layout?.template || 'two-columns-left',
              themeColor: version.content?.layout?.themeColor || 'emerald',
              versionNumber: version.versionNumber,
              lastEdited: version.createdAt,
            };
          }
        }
        return {
          _id: resume._id,
          title: resume.title,
          updatedAt: resume.updatedAt,
          createdAt: resume.createdAt,
          preview,
        };
      })
    );

    return NextResponse.json({ resumes: resumesWithPreview });
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
      console.warn('⚠️ Database connection failed. Returning empty list.');
      return NextResponse.json({ resumes: [], error: 'Database connection failed' });
    }

    console.error('Error listing resumes:', error);
    return NextResponse.json({ error: errorMsg || 'Database error' }, { status: 500 });
  }
}

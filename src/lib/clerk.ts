import { User, IUser } from '@/models/User';

interface ClerkUserInfo {
  clerkId: string;
  email?: string | null;
  name?: string | null;
  image?: string | null;
}

/**
 * Find or create a MongoDB User document from a Clerk user identity.
 * Uses `clerkId` as the unique key (upsert).
 */
export async function getOrCreateUser(info: ClerkUserInfo): Promise<IUser> {
  const { clerkId, email, name, image } = info;

  const user = await User.findOneAndUpdate(
    { clerkId },
    {
      $setOnInsert: { clerkId, createdAt: new Date() },
      $set: {
        ...(email && { email }),
        ...(name && { name }),
        ...(image && { image }),
      },
    },
    { upsert: true, new: true }
  );

  return user;
}

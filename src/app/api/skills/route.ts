import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import { Skill } from '@/models/Skill';

/**
 * GET /api/skills?q=react
 * Search skills by name (prefix match, case-insensitive).
 * Returns top 20 results sorted by usageCount desc.
 */
export async function GET(req: NextRequest) {
  try {
    await dbConnect();

    const q = req.nextUrl.searchParams.get('q') ?? '';
    const query = q.trim()
      ? { name: { $regex: q.trim(), $options: 'i' } }
      : {};

    const skills = await Skill.find(query)
      .sort({ usageCount: -1, name: 1 })
      .limit(30)
      .select('name category usageCount')
      .lean();

    return NextResponse.json({ skills });
  } catch (err: unknown) {
    console.error('[GET /api/skills]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

/**
 * POST /api/skills
 * Body: { name: string; category?: string }
 * Creates a new skill or increments usageCount if it already exists.
 * Returns the upserted skill document.
 */
export async function POST(req: NextRequest) {
  try {
    await dbConnect();

    const body = await req.json();
    const name = (body.name ?? '').trim();

    if (!name) {
      return NextResponse.json({ error: 'Skill name is required' }, { status: 400 });
    }

    const skill = await Skill.findOneAndUpdate(
      { name: { $regex: `^${name}$`, $options: 'i' } },
      {
        $setOnInsert: { name, category: body.category ?? '' },
        $inc: { usageCount: 1 },
      },
      { upsert: true, new: true }
    );

    return NextResponse.json({ skill });
  } catch (err: unknown) {
    console.error('[POST /api/skills]', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

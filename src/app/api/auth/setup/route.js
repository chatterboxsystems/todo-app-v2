import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getRedisClient } from '@/lib/redis';

// One-time setup route — only works if NO users exist yet
export async function POST(request) {
  try {
    const redis = await getRedisClient();

    // Check if any users already exist — if so, setup is locked
    const existing = await redis.hGetAll('emc:users');
    if (existing && Object.keys(existing).length > 0) {
      return NextResponse.json(
        { error: 'Setup already completed. This route is disabled.' },
        { status: 403 }
      );
    }

    const { password } = await request.json();

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await redis.hSet('emc:users', 'BensonsIII', JSON.stringify({ passwordHash }));

    return NextResponse.json({
      success: true,
      message: 'Admin account created. You can now log in as BensonsIII.',
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 });
  }
}

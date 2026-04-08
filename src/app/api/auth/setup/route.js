import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getRedisClient } from '@/lib/redis';

// One-time setup route — only works if NO users exist yet
export async function POST(request) {
  try {
    const redis = await getRedisClient();

    const { password } = await request.json();

    if (!password || password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    const passwordHash = await bcrypt.hash(password, 10);
    await redis.hSet('emc:users', 'bakerman33', JSON.stringify({ passwordHash }));

    return NextResponse.json({
      success: true,
      message: 'Admin account created. You can now log in as bakerman33.',
    });
  } catch (error) {
    console.error('Setup error:', error);
    return NextResponse.json({ error: 'Setup failed' }, { status: 500 });
  }
}

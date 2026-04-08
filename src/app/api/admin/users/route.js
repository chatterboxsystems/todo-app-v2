import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getRedisClient } from '@/lib/redis';
import { verifyToken, COOKIE_NAME } from '@/lib/auth';
import { cookies } from 'next/headers';

const ADMIN_USER = 'BensonsIII';

async function getCurrentUser(request) {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  return token ? await verifyToken(token) : null;
}

// GET - list all users (admin only)
export async function GET(request) {
  const payload = await getCurrentUser(request);
  if (!payload || payload.username !== ADMIN_USER) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const redis = await getRedisClient();
  const all = await redis.hGetAll('emc:users');
  const users = Object.keys(all).map((username) => ({ username }));

  return NextResponse.json({ users });
}

// POST - create or update a user's password (admin only)
export async function POST(request) {
  const payload = await getCurrentUser(request);
  if (!payload || payload.username !== ADMIN_USER) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { username, password } = await request.json();

  if (!username || !password) {
    return NextResponse.json({ error: 'Username and password required' }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const redis = await getRedisClient();
  await redis.hSet('emc:users', username, JSON.stringify({ passwordHash }));

  return NextResponse.json({ success: true, username });
}

// DELETE - remove a user (admin only)
export async function DELETE(request) {
  const payload = await getCurrentUser(request);
  if (!payload || payload.username !== ADMIN_USER) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
  }

  const { username } = await request.json();

  if (username === ADMIN_USER) {
    return NextResponse.json({ error: 'Cannot delete admin' }, { status: 400 });
  }

  const redis = await getRedisClient();
  await redis.hDel('emc:users', username);

  return NextResponse.json({ success: true });
}

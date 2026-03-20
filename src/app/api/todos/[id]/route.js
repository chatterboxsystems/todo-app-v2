import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';

const TODOS_INDEX = 'todos:index';

// Helper to get app-specific index key
function getAppIndexKey(app) {
  return `todos:index:${app}`;
}

export async function GET(request, { params }) {
  try {
    const redis = await getRedisClient();
    const { id } = await params;

    const todo = await redis.hGetAll(`todo:${id}`);

    if (!todo || !todo.id) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ todo });
  } catch (error) {
    console.error('Error fetching todo:', error);
    return NextResponse.json(
      { error: 'Failed to fetch todo' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const redis = await getRedisClient();
    const { id } = await params;

    const existingTodo = await redis.hGetAll(`todo:${id}`);

    if (!existingTodo || !existingTodo.id) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }

    const body = await request.json();
    const { title, description, completed, priority, category, dueDate } = body;

    const updatedTodo = {
      ...existingTodo,
      updatedAt: new Date().toISOString(),
    };

    if (title !== undefined) {
      updatedTodo.title = title.trim();
    }
    if (description !== undefined) {
      updatedTodo.description = description.trim();
    }
    if (completed !== undefined) {
      updatedTodo.completed = completed ? 'true' : 'false';
    }
    if (priority !== undefined) {
      updatedTodo.priority = priority;
    }
    if (category !== undefined) {
      updatedTodo.category = category;
    }
    if (dueDate !== undefined) {
      updatedTodo.dueDate = dueDate;
    }

    await redis.hSet(`todo:${id}`, updatedTodo);

    return NextResponse.json({ todo: updatedTodo });
  } catch (error) {
    console.error('Error updating todo:', error);
    return NextResponse.json(
      { error: 'Failed to update todo' },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const redis = await getRedisClient();
    const { id } = await params;

    const existingTodo = await redis.hGetAll(`todo:${id}`);

    if (!existingTodo || !existingTodo.id) {
      return NextResponse.json(
        { error: 'Todo not found' },
        { status: 404 }
      );
    }

    // Delete the todo hash
    await redis.del(`todo:${id}`);

    // Extract app from ID and remove from correct sorted set
    const app = existingTodo.app || 'chatterbox';
    const appIndexKey = getAppIndexKey(app);
    await redis.zRem(appIndexKey, id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting todo:', error);
    return NextResponse.json(
      { error: 'Failed to delete todo' },
      { status: 500 }
    );
  }
}
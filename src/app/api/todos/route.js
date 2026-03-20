import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';

const TODOS_INDEX = 'todos:index';

export async function GET(request) {
  try {
    const redis = await getRedisClient();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search')?.toLowerCase() || '';
    const priority = searchParams.get('priority') || '';
    const category = searchParams.get('category') || '';
    const completed = searchParams.get('completed');

    // Get all todo IDs from the sorted set
    const todoIds = await redis.zRange(TODOS_INDEX, 0, -1);

    if (!todoIds || todoIds.length === 0) {
      return NextResponse.json({ todos: [] });
    }

    // Get all todos
    const todos = await Promise.all(
      todoIds.map(async (id) => {
        const todo = await redis.hGetAll(`todo:${id}`);
        return todo;
      })
    );

    // Filter out empty results
    let filteredTodos = todos.filter((todo) => todo && todo.id);

    // Apply filters
    if (search) {
      filteredTodos = filteredTodos.filter(
        (todo) =>
          todo.title?.toLowerCase().includes(search) ||
          todo.description?.toLowerCase().includes(search)
      );
    }

    if (priority) {
      filteredTodos = filteredTodos.filter((todo) => todo.priority === priority);
    }

    if (category) {
      filteredTodos = filteredTodos.filter((todo) => todo.category === category);
    }

    if (completed !== null && completed !== '') {
      const isCompleted = completed === 'true';
      filteredTodos = filteredTodos.filter(
        (todo) => (todo.completed === 'true') === isCompleted
      );
    }

    // Sort by createdAt descending (most recent first)
    filteredTodos.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    return NextResponse.json({ todos: filteredTodos });
  } catch (error) {
    console.error('Error fetching todos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch todos' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const redis = await getRedisClient();
    const body = await request.json();

    const { title, description, priority, category, dueDate } = body;

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const id = `todo:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const todo = {
      id,
      title: title.trim(),
      description: description?.trim() || '',
      completed: 'false',
      priority: priority || 'medium',
      category: category || '',
      dueDate: dueDate || '',
      createdAt: now,
      updatedAt: now,
    };

    // Store the todo as a hash
    await redis.hSet(`todo:${id}`, todo);

    // Add to sorted set with timestamp as score
    await redis.zAdd(TODOS_INDEX, { score: Date.now(), value: id });

    return NextResponse.json({ todo }, { status: 201 });
  } catch (error) {
    console.error('Error creating todo:', error);
    return NextResponse.json(
      { error: 'Failed to create todo' },
      { status: 500 }
    );
  }
}
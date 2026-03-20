import { NextResponse } from 'next/server';
import { getRedisClient } from '@/lib/redis';

const TODOS_INDEX = 'todos:index';

// Helper to get app-specific index key
function getAppIndexKey(app) {
  return `todos:index:${app}`;
}

export async function GET(request) {
  try {
    const redis = await getRedisClient();
    const { searchParams } = new URL(request.url);

    const search = searchParams.get('search')?.toLowerCase() || '';
    const priority = searchParams.get('priority') || '';
    const category = searchParams.get('category') || '';
    const completed = searchParams.get('completed');
    const getCategories = searchParams.get('categories') === 'true';
    const app = searchParams.get('app') || 'chatterbox';

    // Get app-specific todo IDs from the sorted set
    const appIndexKey = getAppIndexKey(app);
    const todoIds = await redis.zRange(appIndexKey, 0, -1);

    if (!todoIds || todoIds.length === 0) {
      if (getCategories) {
        return NextResponse.json({ categories: [] });
      }
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

    // If requesting categories, extract unique ones
    if (getCategories) {
      const categories = [...new Set(todos.map(t => t.category).filter(Boolean))].sort();
      return NextResponse.json({ categories });
    }

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

    const { title, description, priority, category, dueDate, app } = body;
    const currentApp = app || 'chatterbox';

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    const id = `todo:${currentApp}:${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const now = new Date().toISOString();

    const todo = {
      id,
      app: currentApp,
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

    // Add to app-specific sorted set with timestamp as score
    const appIndexKey = getAppIndexKey(currentApp);
    await redis.zAdd(appIndexKey, { score: Date.now(), value: id });

    return NextResponse.json({ todo }, { status: 201 });
  } catch (error) {
    console.error('Error creating todo:', error);
    return NextResponse.json(
      { error: 'Failed to create todo' },
      { status: 500 }
    );
  }
}
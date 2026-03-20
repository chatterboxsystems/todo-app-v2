'use client';

import { useState, useEffect, useCallback } from 'react';
import TodoForm from '@/components/TodoForm';
import TodoList from '@/components/TodoList';
import Filters from '@/components/Filters';

export default function Home() {
  const [todos, setTodos] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingTodo, setEditingTodo] = useState(null);
  const [darkMode, setDarkMode] = useState(false);

  // Initialize dark mode from localStorage or system preference
  useEffect(() => {
    const stored = localStorage.getItem('darkMode');
    if (stored !== null) {
      setDarkMode(stored === 'true');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);

  // Apply dark mode class to document
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('darkMode', darkMode);
  }, [darkMode]);

  // Filter states
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');
  const [completed, setCompleted] = useState('');

  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (priority) params.set('priority', priority);
      if (category) params.set('category', category);
      if (completed) params.set('completed', completed);

      const res = await fetch(`/api/todos?${params.toString()}`);
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to fetch todos');
      }

      setTodos(data.todos || []);
      setError(null);
    } catch (err) {
      console.error('Error fetching todos:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [search, priority, category, completed]);

  useEffect(() => {
    fetchTodos();
  }, [fetchTodos]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await fetch('/api/todos?categories=true');
      const data = await res.json();
      if (res.ok) {
        setCategories(data.categories || []);
      }
    } catch (err) {
      console.error('Error fetching categories:', err);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleCreateTodo = async (todoData) => {
    const res = await fetch('/api/todos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(todoData),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to create todo');
    }

    await fetchTodos();
    await fetchCategories();
  };

  const handleUpdateTodo = async (id, updates) => {
    const res = await fetch(`/api/todos/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to update todo');
    }

    setEditingTodo(null);
    await fetchTodos();
    await fetchCategories();
  };

  const handleToggle = async (todo) => {
    await handleUpdateTodo(todo.id, {
      completed: todo.completed !== 'true',
    });
  };

  const handleEdit = (todo) => {
    setEditingTodo(todo);
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this todo?')) return;

    const res = await fetch(`/api/todos/${id}`, {
      method: 'DELETE',
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Failed to delete todo');
    }

    await fetchTodos();
  };

  const handleEditSubmit = async (todoData) => {
    if (!editingTodo) return;
    await handleUpdateTodo(editingTodo.id, todoData);
  };

  const handleCancelEdit = () => {
    setEditingTodo(null);
  };

  return (
    <div className="container">
      <header className="header">
        <div className="header-content">
          <h1>Todo App</h1>
          <p className="subtitle">Manage your tasks with Redis</p>
        </div>
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="theme-toggle"
          aria-label="Toggle dark mode"
        >
          {darkMode ? '☀️' : '🌙'}
        </button>
      </header>

      {error && <div className="error-message">{error}</div>}

      <section className="form-section">
        <TodoForm
          onSubmit={editingTodo ? handleEditSubmit : handleCreateTodo}
          editingTodo={editingTodo}
          onCancel={handleCancelEdit}
          categories={categories}
        />
      </section>

      <section className="filters-section">
        <Filters
          search={search}
          onSearchChange={setSearch}
          priority={priority}
          onPriorityChange={setPriority}
          category={category}
          onCategoryChange={setCategory}
          completed={completed}
          onCompletedChange={setCompleted}
        />
      </section>

      <section className="list-section">
        <TodoList
          todos={todos}
          onToggle={handleToggle}
          onEdit={handleEdit}
          onDelete={handleDelete}
          loading={loading}
        />
      </section>
    </div>
  );
}
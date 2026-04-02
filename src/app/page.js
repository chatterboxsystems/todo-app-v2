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
  const [currentApp, setCurrentApp] = useState('chatterbox');
  const [sendingSms, setSendingSms] = useState(false);
  const [smsStatus, setSmsStatus] = useState(null);

  const APPS = [
    { id: 'chatterbox', name: 'Chatterbox Systems' },
    { id: 'happyhearts', name: 'Happy Hearts Today' },
    { id: 'tba', name: 'ThriveBayArea' },
  ];

  // Initialize dark mode and app from localStorage
  useEffect(() => {
    const storedDarkMode = localStorage.getItem('darkMode');
    const storedApp = localStorage.getItem('currentApp');

    if (storedDarkMode !== null) {
      setDarkMode(storedDarkMode === 'true');
    } else if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }

    if (storedApp) {
      setCurrentApp(storedApp);
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

  // Save app selection
  useEffect(() => {
    localStorage.setItem('currentApp', currentApp);
  }, [currentApp]);

  // Filter states
  const [search, setSearch] = useState('');
  const [priority, setPriority] = useState('');
  const [category, setCategory] = useState('');
  const [completed, setCompleted] = useState('');

  const fetchTodos = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.set('app', currentApp);
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
  }, [search, priority, category, completed, currentApp]);

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
      body: JSON.stringify({ ...todoData, app: currentApp }),
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

  const sendDailySummary = async () => {
    setSendingSms(true);
    setSmsStatus(null);
    try {
      const res = await fetch('/api/sms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'daily-summary' }),
      });
      const data = await res.json();
      if (res.ok) {
        setSmsStatus(data.sent ? 'SMS sent successfully!' : 'No active todos to send');
      } else {
        const details = data.details ? JSON.stringify(data.details) : '';
        setSmsStatus('Error: ' + (data.error || 'Failed to send SMS') + ' ' + details);
      }
    } catch (err) {
      setSmsStatus('Error: Failed to send SMS');
    } finally {
      setSendingSms(false);
    }
  };

  return (
    <div className="container">
      <header className="header">
        <div className="header-content">
          <div className="logo-title">
            <img src="/logo.png" alt="Todo App Logo" className="app-logo" />
            <h1>Todo App</h1>
          </div>
          <div className="app-switcher">
            <select
              value={currentApp}
              onChange={(e) => {
                setCurrentApp(e.target.value);
              }}
              className="app-select"
            >
              {APPS.map((app) => (
                <option key={app.id} value={app.id}>{app.name}</option>
              ))}
            </select>
          </div>
          <p className="subtitle">Manage your tasks with Redis</p>
        </div>
        <div className="header-actions">
          <button
            onClick={sendDailySummary}
            className="btn btn-small"
            disabled={sendingSms}
          >
            {sendingSms ? 'Sending...' : '📱 Test SMS'}
          </button>
          <button
            onClick={() => setDarkMode(!darkMode)}
            className="theme-toggle"
            aria-label="Toggle dark mode"
          >
            {darkMode ? '☀️' : '🌙'}
          </button>
        </div>
      </header>

      {smsStatus && <div className="sms-status">{smsStatus}</div>}
      {error && <div className="error-message">{error}</div>}

      <div className="main-layout">
        <section className="form-section">
          <TodoForm
            onSubmit={editingTodo ? handleEditSubmit : handleCreateTodo}
            editingTodo={editingTodo}
            onCancel={handleCancelEdit}
            categories={categories}
          />
        </section>

        <section className="list-section">
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

          <TodoList
            todos={todos}
            onToggle={handleToggle}
            onEdit={handleEdit}
            onDelete={handleDelete}
            loading={loading}
          />
        </section>
      </div>
    </div>
  );
}

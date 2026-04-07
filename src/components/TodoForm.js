'use client';

import { useState, useEffect } from 'react';

const DEFAULT_CATEGORIES = ['Personal', 'Shopping', 'Health', 'Learning', 'Home', 'Finance', 'Other'];
const OWNERS = ['BensonsIII', 'Jeffery', 'Flo', 'CEO', 'CIO'];
const STATUSES = ['Open', 'In Progress', 'Closed', 'Reopen'];
const PIPELINES = ['🧠 Backlog', '⚡ In Progress', '👀 Review', '✅ Completed'];

export default function TodoForm({ onSubmit, editingTodo, onCancel, categories = [] }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('medium');
  const [category, setCategory] = useState('');
  const [newCategory, setNewCategory] = useState('');
  const [showNewCategory, setShowNewCategory] = useState(false);
  const [dueDate, setDueDate] = useState('');
  const [owner, setOwner] = useState('');
  const [status, setStatus] = useState('Open');
  const [pipeline, setPipeline] = useState('🧠 Backlog');
  const [loading, setLoading] = useState(false);

  // Combine default categories with custom ones from database
  const allCategories = [...new Set([...DEFAULT_CATEGORIES, ...categories])].sort();

  useEffect(() => {
    if (editingTodo) {
      setTitle(editingTodo.title || '');
      setDescription(editingTodo.description || '');
      setPriority(editingTodo.priority || 'medium');
      setCategory(editingTodo.category || '');
      setDueDate(editingTodo.dueDate ? editingTodo.dueDate.split('T')[0] : '');
      setOwner(editingTodo.owner || '');
      setStatus(editingTodo.status || 'Open');
      setPipeline(editingTodo.pipeline || '🧠 Backlog');
    } else {
      resetForm();
    }
  }, [editingTodo]);

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setPriority('medium');
    setCategory('');
    setNewCategory('');
    setShowNewCategory(false);
    setDueDate('');
    setOwner('');
    setStatus('Open');
    setPipeline('🧠 Backlog');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    setLoading(true);
    try {
      const finalCategory = showNewCategory ? newCategory.trim() : category;
      await onSubmit({
        title,
        description,
        priority,
        category: finalCategory,
        dueDate,
        owner,
        status,
        pipeline,
      });
      resetForm();
    } catch (error) {
      console.error('Error submitting assignment:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddNewCategory = () => {
    if (newCategory.trim()) {
      setCategory(newCategory.trim());
      setShowNewCategory(false);
      setNewCategory('');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="todo-form">
      <div className="form-group">
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="What needs to be done?"
          className="form-input title-input"
          required
        />
      </div>

      <div className="form-group">
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a description..."
          className="form-input"
          rows={2}
        />
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Owner</label>
          <select
            value={owner}
            onChange={(e) => setOwner(e.target.value)}
            className="form-select"
          >
            <option value="">Select owner...</option>
            {OWNERS.map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="form-select"
          >
            {STATUSES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Pipeline</label>
          <select
            value={pipeline}
            onChange={(e) => setPipeline(e.target.value)}
            className="form-select"
          >
            {PIPELINES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="form-select"
          >
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
      </div>

      <div className="form-row">
        <div className="form-group">
          <label>Category</label>
          {!showNewCategory ? (
            <div className="category-select-wrapper">
              <select
                value={category}
                onChange={(e) => {
                  if (e.target.value === '__new__') {
                    setShowNewCategory(true);
                  } else {
                    setCategory(e.target.value);
                  }
                }}
                className="form-select"
              >
                <option value="">Select category...</option>
                {allCategories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
                <option value="__new__">+ Add new category</option>
              </select>
            </div>
          ) : (
            <div className="new-category-input">
              <input
                type="text"
                value={newCategory}
                onChange={(e) => setNewCategory(e.target.value)}
                placeholder="New category name"
                className="form-input"
                autoFocus
              />
              <button
                type="button"
                onClick={handleAddNewCategory}
                className="btn btn-small btn-primary"
              >
                Add
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowNewCategory(false);
                  setNewCategory('');
                }}
                className="btn btn-small btn-secondary"
              >
                Cancel
              </button>
            </div>
          )}
        </div>

        <div className="form-group">
          <label>Due Date</label>
          <input
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            className="form-input"
          />
        </div>
      </div>

      <div className="form-actions">
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Saving...' : editingTodo ? 'Update Assignment' : 'Add Assignment'}
        </button>
        {editingTodo && (
          <button
            type="button"
            onClick={onCancel}
            className="btn btn-secondary"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
}

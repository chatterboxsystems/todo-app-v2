'use client';

import { useState } from 'react';

const PIPELINES = ['🧠 Backlog', '⚡ In Progress', '👀 Review', '✅ Completed'];

export default function TodoItem({ todo, onToggle, onEdit, onDelete, onUpdate }) {
  const isCompleted = todo.completed === 'true';
  const [newComment, setNewComment] = useState('');
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState('');
  const [showComments, setShowComments] = useState(false);

  const comments = (() => {
    try {
      return JSON.parse(todo.comments || '[]');
    } catch {
      return [];
    }
  })();

  const saveComments = (updated) => {
    onUpdate(todo.id, { comments: JSON.stringify(updated) });
  };

  const handleAddComment = () => {
    if (!newComment.trim()) return;
    const updated = [...comments, { text: newComment.trim(), createdAt: new Date().toISOString() }];
    saveComments(updated);
    setNewComment('');
  };

  const handleDeleteComment = (index) => {
    const updated = comments.filter((_, i) => i !== index);
    saveComments(updated);
  };

  const handleSaveEdit = (index) => {
    if (!editingText.trim()) return;
    const updated = comments.map((c, i) => i === index ? { ...c, text: editingText.trim() } : c);
    saveComments(updated);
    setEditingIndex(null);
    setEditingText('');
  };

  const priorityClass = {
    low: 'priority-low',
    medium: 'priority-medium',
    high: 'priority-high',
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const formatDateTime = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) +
      ' ' + date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  const isOverdue = () => {
    if (!todo.dueDate || isCompleted) return false;
    const due = new Date(todo.dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return due < today;
  };

  return (
    <div className={`todo-item ${isCompleted ? 'completed' : ''}`}>
      <div className="todo-checkbox">
        <input
          type="checkbox"
          checked={isCompleted}
          onChange={() => onToggle(todo)}
        />
      </div>

      <div className="todo-content">
        <div className="todo-header">
          <span className={`todo-title ${isCompleted ? 'completed' : ''}`}>
            {todo.title}
          </span>
          <span className={`priority-badge ${priorityClass[todo.priority] || 'priority-medium'}`}>
            {todo.priority}
          </span>
        </div>

        <div className="pipeline-row">
          <select
            value={todo.pipeline || '🧠 Backlog'}
            onChange={(e) => onUpdate(todo.id, { pipeline: e.target.value })}
            className="pipeline-select"
          >
            {PIPELINES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {todo.description && (
          <p className="todo-description">{todo.description}</p>
        )}

        <div className="todo-meta">
          {todo.owner && (
            <span className="todo-category">Owner: {todo.owner}</span>
          )}
          {todo.status && (
            <span className="todo-category">Status: {todo.status}</span>
          )}
          {todo.category && (
            <span className="todo-category">{todo.category}</span>
          )}
          {todo.dueDate && (
            <span className={`todo-due-date ${isOverdue() ? 'overdue' : ''}`}>
              Due: {formatDate(todo.dueDate)}
            </span>
          )}
          <span className="todo-date">
            Created: {formatDate(todo.createdAt)}
          </span>
        </div>

        {/* Comment Section */}
        <div className="comment-section">
          <button
            className="comment-toggle"
            onClick={() => setShowComments(!showComments)}
          >
            💬 Comments ({comments.length}) {showComments ? '▲' : '▼'}
          </button>

          {showComments && (
            <div className="comment-body">
              {comments.length > 0 && (
                <div className="comment-list">
                  {comments.map((c, i) => (
                    <div key={i} className="comment-item">
                      {editingIndex === i ? (
                        <div className="comment-edit-row">
                          <textarea
                            value={editingText}
                            onChange={(e) => setEditingText(e.target.value)}
                            className="comment-input"
                            rows={2}
                            autoFocus
                          />
                          <div className="comment-edit-actions">
                            <button className="btn btn-small btn-primary" onClick={() => handleSaveEdit(i)}>Save</button>
                            <button className="btn btn-small btn-secondary" onClick={() => setEditingIndex(null)}>Cancel</button>
                          </div>
                        </div>
                      ) : (
                        <div className="comment-view-row">
                          <p className="comment-text">{c.text}</p>
                          <span className="comment-date">{formatDateTime(c.createdAt)}</span>
                          <div className="comment-actions">
                            <button className="comment-action-btn" onClick={() => { setEditingIndex(i); setEditingText(c.text); }}>Edit</button>
                            <button className="comment-action-btn comment-delete-btn" onClick={() => handleDeleteComment(i)}>Delete</button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              <div className="comment-add-row">
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="Add a comment..."
                  className="comment-input"
                  rows={2}
                  onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleAddComment(); } }}
                />
                <button className="btn btn-small btn-primary" onClick={handleAddComment}>Add</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="todo-actions">
        <button
          onClick={() => onEdit(todo)}
          className="btn btn-small"
          disabled={isCompleted}
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(todo.id)}
          className="btn btn-small btn-danger"
        >
          Delete
        </button>
      </div>
    </div>
  );
}

'use client';

const PIPELINES = ['🧠 Backlog', '⚡ In Progress', '👀 Review', '✅ Completed'];

export default function TodoItem({ todo, onToggle, onEdit, onDelete, onUpdate }) {
  const isCompleted = todo.completed === 'true';

  const priorityClass = {
    medium: 'priority-medium',
    priority: 'priority-medium',
    high: 'priority-high',
  };

  const formatDate = (dateString) => {
    if (!dateString) return null;
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
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

        {todo.description && (
          <p className="todo-description">{todo.description}</p>
        )}

        <div className="todo-meta">
          <select
            value={todo.pipeline || '🧠 Backlog'}
            onChange={(e) => onUpdate(todo.id, { pipeline: e.target.value })}
            className="pipeline-select"
          >
            {PIPELINES.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
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

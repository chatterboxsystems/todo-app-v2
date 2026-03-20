'use client';

import TodoItem from './TodoItem';

export default function TodoList({ todos, onToggle, onEdit, onDelete, loading }) {
  if (loading) {
    return <div className="todo-loading">Loading todos...</div>;
  }

  if (!todos || todos.length === 0) {
    return (
      <div className="todo-empty">
        <p>No todos found. Add a new todo to get started!</p>
      </div>
    );
  }

  const completedCount = todos.filter((t) => t.completed === 'true').length;
  const activeCount = todos.length - completedCount;

  return (
    <div className="todo-list">
      <div className="todo-stats">
        <span>Total: {todos.length}</span>
        <span>Active: {activeCount}</span>
        <span>Completed: {completedCount}</span>
      </div>

      <div className="todos">
        {todos.map((todo) => (
          <TodoItem
            key={todo.id}
            todo={todo}
            onToggle={onToggle}
            onEdit={onEdit}
            onDelete={onDelete}
          />
        ))}
      </div>
    </div>
  );
}
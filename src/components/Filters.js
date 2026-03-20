'use client';

export default function Filters({
  search,
  onSearchChange,
  priority,
  onPriorityChange,
  category,
  onCategoryChange,
  completed,
  onCompletedChange,
}) {
  return (
    <div className="filters">
      <div className="filter-group">
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search todos..."
          className="filter-input"
        />
      </div>

      <div className="filter-group">
        <select
          value={priority}
          onChange={(e) => onPriorityChange(e.target.value)}
          className="filter-select"
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </div>

      <div className="filter-group">
        <input
          type="text"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
          placeholder="Filter by category..."
          className="filter-input"
        />
      </div>

      <div className="filter-group">
        <select
          value={completed}
          onChange={(e) => onCompletedChange(e.target.value)}
          className="filter-select"
        >
          <option value="">All Status</option>
          <option value="true">Completed</option>
          <option value="false">Active</option>
        </select>
      </div>

      {(search || priority || category || completed) && (
        <button
          onClick={() => {
            onSearchChange('');
            onPriorityChange('');
            onCategoryChange('');
            onCompletedChange('');
          }}
          className="btn btn-small btn-secondary"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}
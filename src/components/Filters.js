'use client';

const OWNERS = ['BensonsIII', 'Jeffery', 'Flo', 'CEO', 'CIO'];
const STATUSES = ['Open', 'In Progress', 'Closed', 'Reopen'];
const PIPELINES = ['🧠 Backlog', '⚡ In Progress', '👀 Review', '✅ Completed'];

export default function Filters({
  search,
  onSearchChange,
  priority,
  onPriorityChange,
  category,
  onCategoryChange,
  completed,
  onCompletedChange,
  owner,
  onOwnerChange,
  status,
  onStatusChange,
  pipeline,
  onPipelineChange,
}) {
  return (
    <div className="filters">
      <div className="filter-group">
        <input
          type="text"
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Search assignments..."
          className="filter-input"
        />
      </div>

      <div className="filter-group">
        <select
          value={pipeline}
          onChange={(e) => onPipelineChange(e.target.value)}
          className="filter-select"
        >
          <option value="">All Pipelines</option>
          {PIPELINES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <select
          value={owner}
          onChange={(e) => onOwnerChange(e.target.value)}
          className="filter-select"
        >
          <option value="">All Owners</option>
          {OWNERS.map((o) => (
            <option key={o} value={o}>{o}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <select
          value={status}
          onChange={(e) => onStatusChange(e.target.value)}
          className="filter-select"
        >
          <option value="">All Statuses</option>
          {STATUSES.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <select
          value={priority}
          onChange={(e) => onPriorityChange(e.target.value)}
          className="filter-select"
        >
          <option value="">All Priorities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
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

      {(search || priority || category || completed || owner || status || pipeline) && (
        <button
          onClick={() => {
            onSearchChange('');
            onPriorityChange('');
            onCategoryChange('');
            onCompletedChange('');
            onOwnerChange('');
            onStatusChange('');
            onPipelineChange('');
          }}
          className="btn btn-small btn-secondary"
        >
          Clear Filters
        </button>
      )}
    </div>
  );
}

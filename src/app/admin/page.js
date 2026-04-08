'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

const ALL_USERS = ['BensonsIII', 'Jeffery', 'Flo', 'CEO', 'CIO'];

export default function AdminPage() {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/me')
      .then((r) => r.json())
      .then((d) => {
        if (!d.user || d.user.username !== 'BensonsIII') {
          router.push('/');
        } else {
          setCurrentUser(d.user.username);
          fetchUsers();
        }
      });
  }, []);

  const fetchUsers = async () => {
    const res = await fetch('/api/admin/users');
    if (res.ok) {
      const data = await res.json();
      setUsers(data.users.map((u) => u.username));
    }
  };

  const handleSetPassword = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/admin/users', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: selectedUser, password: newPassword }),
      });

      const data = await res.json();
      if (res.ok) {
        setMessage(`Password set for ${selectedUser}`);
        setNewPassword('');
        fetchUsers();
      } else {
        setError(data.error);
      }
    } catch {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (username) => {
    if (!confirm(`Remove ${username}?`)) return;
    await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username }),
    });
    fetchUsers();
  };

  if (!currentUser) return <div className="login-page"><p>Checking access...</p></div>;

  return (
    <div className="admin-page">
      <div className="admin-card">
        <div className="admin-header">
          <h1>User Management</h1>
          <p>Admin: {currentUser}</p>
          <button className="btn btn-small btn-secondary" onClick={() => router.push('/')}>
            ← Back to App
          </button>
        </div>

        <div className="admin-section">
          <h2>Set / Update Password</h2>
          <form onSubmit={handleSetPassword} className="admin-form">
            {message && <div className="login-success">{message}</div>}
            {error && <div className="login-error">{error}</div>}

            <div className="form-group">
              <label>User</label>
              <select
                value={selectedUser}
                onChange={(e) => setSelectedUser(e.target.value)}
                className="form-select"
                required
              >
                <option value="">Select user...</option>
                {ALL_USERS.map((u) => (
                  <option key={u} value={u}>{u}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>New Password</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="form-input"
                placeholder="Enter password"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Set Password'}
            </button>
          </form>
        </div>

        <div className="admin-section">
          <h2>Active Users</h2>
          {users.length === 0 ? (
            <p style={{ color: 'var(--completed)', fontSize: '0.875rem' }}>No users set up yet.</p>
          ) : (
            <ul className="user-list">
              {users.map((u) => (
                <li key={u} className="user-list-item">
                  <span>{u}</span>
                  {u !== 'BensonsIII' && (
                    <button
                      className="btn btn-small btn-danger"
                      onClick={() => handleDelete(u)}
                    >
                      Remove
                    </button>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}

'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SetupPage() {
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const router = useRouter();

  const handleSetup = async (e) => {
    e.preventDefault();
    setError('');
    setMessage('');

    if (password !== confirm) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch('/api/auth/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
      } else {
        setMessage(data.message);
        setDone(true);
      }
    } catch {
      setError('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <img src="/favicon.png" alt="Logo" className="login-logo" />
          <h1>First-Time Setup</h1>
          <p>Create the admin (bakerman33) password</p>
        </div>

        {done ? (
          <div style={{ textAlign: 'center' }}>
            <div className="login-success" style={{ marginBottom: '1rem' }}>{message}</div>
            <button className="btn btn-primary" style={{ width: '100%' }} onClick={() => router.push('/login')}>
              Go to Login
            </button>
          </div>
        ) : (
          <form onSubmit={handleSetup} className="login-form">
            {error && <div className="login-error">{error}</div>}

            <div className="form-group">
              <label>Admin Password for bakerman33</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="form-input"
                placeholder="Min. 6 characters"
                required
                minLength={6}
              />
            </div>

            <div className="form-group">
              <label>Confirm Password</label>
              <input
                type="password"
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="form-input"
                placeholder="Repeat password"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={loading}>
              {loading ? 'Setting up...' : 'Create Admin Account'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

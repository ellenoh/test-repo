import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

export default function Register() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('parent');
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const data = await api.register({ name, email, password, role });
      login(data.token, data.user);
      navigate('/');
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">
        <h1>Bank of Mom &amp; Dad</h1>
        <p className="subtitle">Create your account</p>

        {error && <div className="error-msg">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>I am a...</label>
            <div className="role-selector">
              <div
                className={`role-option ${role === 'parent' ? 'selected' : ''}`}
                onClick={() => setRole('parent')}
              >
                <div className="role-icon">&#x1F9D1;</div>
                <div className="role-label">Parent</div>
              </div>
              <div
                className={`role-option ${role === 'child' ? 'selected' : ''}`}
                onClick={() => setRole('child')}
              >
                <div className="role-icon">&#x1F9D2;</div>
                <div className="role-label">Kid</div>
              </div>
            </div>
          </div>
          <div className="form-group">
            <label>Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              required
            />
          </div>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Choose a password"
              required
              minLength={6}
            />
          </div>
          <button type="submit" className="btn btn-primary btn-full">
            Create Account
          </button>
        </form>

        <p className="toggle">
          Already have an account? <Link to="/login">Sign in</Link>
        </p>
      </div>
    </div>
  );
}

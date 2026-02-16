import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api';

const COLORS = ['#4f46e5', '#0891b2', '#059669', '#d97706', '#dc2626', '#7c3aed', '#db2777', '#0d9488'];

export default function Profile() {
  const { user, token, updateUser } = useAuth();
  const [name, setName] = useState(user.name);
  const [avatarColor, setAvatarColor] = useState(user.avatar_color);
  const [saved, setSaved] = useState(false);

  async function handleSave(e) {
    e.preventDefault();
    const updated = await api.updateProfile(token, { name, avatar_color: avatarColor });
    updateUser(updated);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  return (
    <div className="page">
      <div className="page-header">
        <h1>My Profile</h1>
      </div>

      <div className="card">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.5rem' }}>
          <div className="avatar large" style={{ background: avatarColor }}>
            {name.charAt(0).toUpperCase()}
          </div>
          <div>
            <h2 style={{ margin: 0 }}>{name}</h2>
            <span style={{ color: '#64748b', fontSize: '0.85rem', textTransform: 'capitalize' }}>
              {user.role} account
            </span>
          </div>
        </div>

        {saved && <div className="success-msg">Profile updated!</div>}

        <form onSubmit={handleSave}>
          <div className="form-group">
            <label>Display Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="form-group">
            <label>Avatar Color</label>
            <div className="color-options">
              {COLORS.map((c) => (
                <div
                  key={c}
                  className={`color-swatch ${avatarColor === c ? 'selected' : ''}`}
                  style={{ background: c }}
                  onClick={() => setAvatarColor(c)}
                />
              ))}
            </div>
          </div>

          <button type="submit" className="btn btn-primary">
            Save Changes
          </button>
        </form>
      </div>

      <div className="card">
        <h2>Account Details</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#64748b', fontSize: '0.9rem' }}>
          <div><strong>Email:</strong> {user.email}</div>
          <div><strong>Role:</strong> <span style={{ textTransform: 'capitalize' }}>{user.role}</span></div>
          <div><strong>Member since:</strong> {new Date(user.created_at).toLocaleDateString()}</div>
        </div>
      </div>
    </div>
  );
}

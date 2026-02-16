import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="navbar">
      <div className="logo">
        <span>&#x1F3E6;</span> BOMAD
      </div>
      <div className="nav-right">
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Dashboard
        </NavLink>
        <NavLink to="/profile" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
          Profile
        </NavLink>
        <div className="avatar" style={{ background: user.avatar_color, width: 30, height: 30, fontSize: '0.75rem' }}>
          {user.name.charAt(0).toUpperCase()}
        </div>
        <button onClick={logout}>Sign Out</button>
      </div>
    </nav>
  );
}

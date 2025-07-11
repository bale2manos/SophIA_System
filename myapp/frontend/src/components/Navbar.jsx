import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  // Hide navbar on login page
  if (location.pathname === '/login') return null;

  const parts = location.pathname.split('/').filter(Boolean);
  const crumbs = [{ text: 'Dashboard', to: '/dashboard' }];

  if (parts[0] === 'subjects' && parts[1]) {
    const subjectCode = parts[1];
    const subjectTitle = localStorage.getItem(`subj_title_${subjectCode}`) || subjectCode;
    crumbs.push({ text: subjectTitle, to: `/subjects/${subjectCode}` });

    if (parts[2]) {
      const resId = parts[2] === 'practices' ? parts[3] : parts[2];
      const resTitle = localStorage.getItem(`res_title_${resId}`) || 'Resource';
      crumbs.push({ text: resTitle, to: `/resources/${resId}` });
      if (parts[2] === 'practices') {
        crumbs.push({ text: 'Chat' });
      }
    }
  } else if (parts[0] === 'resources' && parts[1]) {
    const resId = parts[1];
    const subjectCode = localStorage.getItem(`res_subject_${resId}`);
    if (subjectCode) {
      const subjectTitle = localStorage.getItem(`subj_title_${subjectCode}`) || subjectCode;
      crumbs.push({ text: subjectTitle, to: `/subjects/${subjectCode}` });
    }
    const resTitle = localStorage.getItem(`res_title_${resId}`) || 'Resource';
    crumbs.push({ text: resTitle, to: `/resources/${resId}` });
    if (parts[2] === 'review') {
      crumbs.push({ text: 'Review' });
    }
  }

  const handleLogout = () => {
    localStorage.clear();
    navigate('/login', { replace: true });
    setMenuOpen(false);
  };

  return (
    <header
      className="relative flex items-center justify-between px-4 py-2 shadow-md sticky top-0 z-50"
      style={{ backgroundColor: '#f5f5dc' }}
    >
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {i === crumbs.length - 1 || !c.to ? (
              <span className="text-gray-600">{c.text}</span>
            ) : (
              <Link to={c.to} className="text-blue-600 hover:underline">
                {c.text}
              </Link>
            )}
            {i < crumbs.length - 1 && <span className="text-gray-400">›</span>}
          </React.Fragment>
        ))}
      </nav>

      {/* Logo */}
      <div className="relative mr-4">
        <button onClick={() => setMenuOpen((v) => !v)} className="font-bold text-xl text-blue-600">
          Sophia
        </button>
        {menuOpen && (
          <div className="absolute right-0 mt-2 w-40 bg-white border rounded shadow-md z-50">
            <button
              onClick={() => {
                setMenuOpen(false);
                navigate('/dashboard');
              }}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Dashboard
            </button>
            <button
              onClick={handleLogout}
              className="block w-full text-left px-4 py-2 hover:bg-gray-100"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}

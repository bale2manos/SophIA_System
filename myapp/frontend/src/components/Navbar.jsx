import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();

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
      crumbs.push({ text: resTitle });
    }
  }

  return (
    <header className="flex items-center justify-between px-4 py-2 shadow-md bg-white sticky top-0 z-50">
      {/* Breadcrumb */}
      <nav className="flex items-center space-x-2 text-sm">
        {crumbs.map((c, i) => (
          <React.Fragment key={i}>
            {c.to ? (
              <Link to={c.to} className="text-blue-600 hover:underline">
                {c.text}
              </Link>
            ) : (
              <span className="text-gray-600">{c.text}</span>
            )}
            {i < crumbs.length - 1 && <span className="text-gray-400">›</span>}
          </React.Fragment>
        ))}
      </nav>

      {/* Logo */}
      <button onClick={() => navigate('/dashboard')} className="font-bold text-xl text-blue-600">
        Sophia
      </button>
    </header>
  );
}

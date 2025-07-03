// src/pages/Dashboard.jsx

import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import api from '../api';

export default function Dashboard() {
  const [subjects, setSubjects] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();

  const logout = () => {
    localStorage.clear();
    // use replace so this route doesn’t stay in history
    navigate('/login', { replace: true });
  };

  useEffect(() => {
    let isMounted = true;
    api.get('/subjects').then((res) => {
      if (isMounted) setSubjects(res.data);
    });
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div>
      <h2>Dashboard2</h2>
      <button onClick={logout}>Logout</button>
      <div>
        {subjects.length === 0 ? (
          <h2>No hay asignaturas asociadas al usuario</h2>
        ) : (
          subjects.map((s) => (
            <div
              key={s.id}
              style={{ border: '1px solid #ccc', padding: '8px', margin: '8px' }}
            >
              <h3>
                {s.code} - {s.title}
              </h3>
              <p>{s.description}</p>
              <Link to={`/subjects/${s.code}`}>View Details</Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

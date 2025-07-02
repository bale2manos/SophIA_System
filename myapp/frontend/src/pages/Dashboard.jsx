import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../api';

export default function Dashboard() {
  const [subjects, setSubjects] = useState([]);
  const navigate = useNavigate();

  const logout = () => {
    localStorage.clear();
    navigate('/login');
  };

  useEffect(() => {
    api.get('/subjects').then((res) => setSubjects(res.data));
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <button onClick={logout}>Logout</button>
      <div>
        {subjects.map((s) => (
          <div key={s.code} style={{ border: '1px solid #ccc', padding: '8px', margin: '8px' }}>
            <h3>{s.code} - {s.title}</h3>
            <p>{s.description}</p>
            <Link to={`/subjects/${s.code}`}>View Details</Link>
          </div>
        ))}
      </div>
    </div>
  );
}

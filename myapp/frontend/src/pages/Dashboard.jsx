import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const [subjects, setSubjects] = useState([]);

  useEffect(() => {
    fetch('/api/subjects')
      .then((res) => res.json())
      .then(setSubjects);
  }, []);

  return (
    <div>
      <h2>Dashboard</h2>
      <div>
        {subjects.length === 0 ? (
          <h2>No hay asignaturas asociadas al usuario</h2>
        ) : (
          subjects.map((s) => (
            <div key={s._id} style={{ border: '1px solid #ccc', padding: '8px', margin: '8px' }}>
              <h3>{s.code} - {s.title}</h3>
              <p>{s.description}</p>
              <Link to={`/subjects/${s._id}`}>View Details</Link>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

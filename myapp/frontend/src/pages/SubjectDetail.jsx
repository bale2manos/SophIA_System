import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../api';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

export default function SubjectDetail() {
  const { code } = useParams();
  const [subject, setSubject] = useState(null);
  const [resources, setResources] = useState([]);
  
  useEffect(() => {
    fetch(`/api/subjects/${code}`)
      .then((res) => res.json())
      .then(setSubject);
    api.get(`/subjects/${code}/resources`).then((res) => setResources(res.data));
  }, [code]);

  const role = localStorage.getItem('role');

  if (!subject) return <div>Loading...</div>;

  return (
    <div>
      <h2>{subject.code} - {subject.title}</h2>
      <p>{subject.description}</p>
      <div style={{ width: 80 }}>
        <CircularProgressbar value={resources.length} maxValue={resources.length || 1} text={`${resources.length}`} />
      </div>
      <h3>Resources</h3>
      <ul>
        {resources.map((r) => (
          <li key={r.id} style={{ marginBottom: '8px' }}>
            {r.title} ({r.type})
            {role === 'student' && r.type === 'practice' && (
              <button onClick={() => alert('TODO')} style={{ marginLeft: '8px' }}>
                Submit
              </button>
            )}
          </li>
        ))}
      </ul>
      {role === 'professor' && (
        <Link
          to={`/subjects/${subject.code}/resources/new`}
          style={{ position: 'fixed', bottom: 20, right: 20, fontSize: '24px' }}
        >
          ➕
        </Link>
      )}
    </div>
  );
}

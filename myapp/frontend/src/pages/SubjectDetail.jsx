// src/pages/SubjectDetail.jsx

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';


export default function SubjectDetail() {
  const { code } = useParams();
  const [subject, setSubject] = useState(null);
  const [resources, setResources] = useState([]);
  const navigate = useNavigate();

  // Bucle que trae recursos + sus entregas del alumno
  const fetchResources = async () => {
    try {
      // 1) Trae la lista de recursos
      const { data: rawResources } = await api.get(`/subjects/${code}/resources`);

      // 2) Para cada recurso, intenta traer solo MI submission
      const resourcesWithSubs = await Promise.all(
        rawResources.map(async (r) => {
          let submissions = [];
          try {
            // Llama al endpoint que devuelve solo mi entrega
            const res = await api.get(`/resources/${r.id}/submission`);
            if (res.data) {
              // Lo metemos en array para compatibilizar con la UI
              submissions = [res.data];
            }
          } catch (e) {
            console.warn(`No se pudieron cargar las submissions de resource ${r.id}:`, e);
            // submissions sigue siendo []
          }
          console.log(`Submissions for resource ${r.id}:`, submissions);
          return { ...r, submissions };
        })
      );

      // 3) Actualiza el estado con recursos enriquecidos
      setResources(resourcesWithSubs);
    } catch (err) {
      console.error('Error trayendo recursos:', err);
    }
  };

  useEffect(() => {
    let isMounted = true;

    api
      .get(`/subjects/${code}`)
      .then(({ data }) => {
        if (isMounted) setSubject(data);
      })
      .catch(console.error);

    if (isMounted) {
      fetchResources();
    }

    return () => {
      isMounted = false;
    };
  }, [code]);

  const role = localStorage.getItem('role');

  if (!subject) return <div>Loading...</div>;

  return (
    <div>
      {/* Back button */}
      <button
        onClick={() => navigate('/dashboard', { replace: true })}
        style={{ marginBottom: '16px' }}
      >
        ← Back to Dashboard
      </button>

      <h2>
        {subject.code} - {subject.title}
      </h2>
      <p>{subject.description}</p>

      <div style={{ width: 80, marginBottom: '24px' }}>
        <CircularProgressbar
          value={resources.length}
          maxValue={resources.length || 1}
          text={`${resources.length}`}
        />
      </div>

      <h3>Resources</h3>
      <ul>
        {resources.map((r) => {
          const showDue = r.due_date
            ? ` (Due: ${new Date(r.due_date).toLocaleString()})`
            : '';
          return (
            <li key={r.id} style={{ marginBottom: '8px' }}>
              <Link to={`/resources/${r.id}`}>{r.title} ({r.type})</Link>
              {showDue}
            </li>
          );
        })}
      </ul>

      {role === 'professor' && (
        <Link
          to={`/subjects/${subject.code}/resources/new`}
          style={{
            position: 'fixed',
            bottom: 20,
            right: 20,
            fontSize: '24px',
          }}
        >
          ➕
        </Link>
      )}
    </div>
  );
}

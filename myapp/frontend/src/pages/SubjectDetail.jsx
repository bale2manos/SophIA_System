// src/pages/SubjectDetail.jsx

import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import CalendarAgenda from '../components/CalendarAgenda';


export default function SubjectDetail() {
  const { code } = useParams();
  const [subject, setSubject] = useState(null);
  const [resources, setResources] = useState([]);
  const [avgGrade, setAvgGrade] = useState(null);
  const navigate = useNavigate();

  // Bucle que trae recursos + sus entregas del alumno
  const fetchResources = async () => {
    try {
      // 1) Trae la lista de recursos
      const { data: rawResources } = await api.get(`/subjects/${code}/resources`);

      const role = localStorage.getItem('role');

      // 2) Para cada recurso, si soy alumno, intenta traer solo MI submission
      const resourcesWithSubs = await Promise.all(
        rawResources.map(async (r) => {
          let submissions = [];
          if (role === 'student') {
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
          }
          return { ...r, submissions };
        })
      );

      // 3) Actualiza el estado con recursos enriquecidos
      setResources(resourcesWithSubs);

      // — Calcular nota media —
      let average = null;
      const exercises = resourcesWithSubs.filter((r) => r.type === 'exercise');

      if (role === 'professor') {
        const allSubsArrays = await Promise.all(
          exercises.map((r) =>
            api.get(`/resources/${r.id}/submissions`).then((res) => res.data)
          )
        );
        const allSubs = allSubsArrays.flat();
        const graded = allSubs.filter((s) => s.grade != null);
        if (graded.length > 0) {
          const sum = graded.reduce((a, s) => a + Number(s.grade), 0);
          average = sum / graded.length;
        }
      } else {
        const myGraded = exercises
          .flatMap((r) => r.submissions || [])
          .filter((s) => s && s.grade != null);
        if (myGraded.length > 0) {
          const sum = myGraded.reduce((a, s) => a + Number(s.grade), 0);
          average = sum / myGraded.length;
        }
      }

      setAvgGrade(average);
      // — Fin cálculo —
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

      <h3 className="text-xl mb-2">Nota media</h3>
      {avgGrade != null ? (
        <div style={{ width: 80, marginBottom: '16px' }}>
          <CircularProgressbar
            value={avgGrade}
            maxValue={10}
            text={avgGrade.toFixed(1)}
          />
        </div>
      ) : (
        <p className="text-gray-500">Sin entregas calificadas</p>
      )}
      <h3>Calendar</h3>
      <CalendarAgenda resources={resources} />
      <h3>Resources</h3>
      <ul>
        {resources.map((r) => {
          const showDue = r.due_date
            ? ` (Due: ${new Date(r.due_date).toLocaleString()})`
            : '';
          const duePassed = r.due_date && new Date() > new Date(r.due_date);
          const showCounts =
            role === 'professor' && r.type === 'exercise' && r.submissions_count != null;
          const showPendingSubmission =
            role === 'student' &&
            r.type === 'exercise' &&
            !duePassed &&
            (!r.submissions || r.submissions.length === 0);
          const isPractice = r.type === 'practice';
          return (
            <li key={r.id} style={{ marginBottom: '8px' }}>
              <Link
                to={`/resources/${r.id}`}
                state={{ subjectTitle: subject.title }}
              >
                {r.title} ({r.type})
              </Link>
              {showDue}
              {showPendingSubmission && (
                <span className="text-red-600 ml-1">⚠️ submission pending</span>
              )}
              {showCounts && (
                <>
                  {' '}- {r.submissions_count} submissions
                  {r.has_ungraded && (
                    <>
                      <span className="text-red-600 ml-1">⚠️ entregas sin corregir</span>
                      <button
                        onClick={() =>
                          navigate(`/resources/${r.id}/review`, {
                            state: { code, title: r.title },
                          })
                        }
                        className="ml-2 px-2 py-1 bg-blue-500 text-white rounded"
                      >
                        Revisar
                      </button>
                    </>
                  )}
                </>
              )}
              {role === 'student' && isPractice && (
                <button
                  onClick={() => navigate(`/subjects/${code}/practices/${r.id}`)}
                  className="ml-2 px-2 py-1 bg-green-500 text-white rounded"
                >
                  Start
                </button>
              )}
              {role === 'professor' && isPractice && (
                <button
                  onClick={async () => {
                    const url = prompt('Implementation URL');
                    if (url) {
                      await api.put(`/resources/${r.id}/implementation_link`, {
                        practice_external_url: url,
                      });
                    }
                  }}
                  className="ml-2 px-2 py-1 bg-blue-500 text-white rounded"
                >
                  Implement
                </button>
              )}
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

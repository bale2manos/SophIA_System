// src/pages/SubjectDetail.jsx

import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import PdfIcon from '../icons/PdfIcon';
import ImageIcon from '../icons/ImageIcon';
import WordIcon from '../icons/WordIcon';
import DefaultFileIcon from '../icons/DefaultFileIcon';

function UploadButton({ resourceId, label = 'Submit', disabled = false, onUploaded }) {
  const inputRef = useRef();
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    api
      .post(`/resources/${resourceId}/submit`, fd)
      .then(() => {
        alert('Submitted successfully');
        if (onUploaded) onUploaded();
      })
      .catch(() => alert('Error submitting'));
  };
  return (
    <>
      <button
        disabled={disabled}
        onClick={() => !disabled && inputRef.current && inputRef.current.click()}
        style={{ marginLeft: '8px' }}
      >
        {label}
      </button>
      <input type="file" ref={inputRef} onChange={handleUpload} style={{ display: 'none' }} />
    </>
  );
}

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
            ? ` (Due: ${new Date(r.due_date).toLocaleDateString()})`
            : '';
          const duePassed = r.due_date && new Date() > new Date(r.due_date);
          const currentSubmission = r.submissions && r.submissions[0];

          // Caso: estudiante y recurso de tipo exercise
if (role === 'student' && r.type === 'exercise') {
  return (
    <li key={r.id} style={{ marginBottom: '16px' }}>
      {/* Línea 1: título + botones */}
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '4px',
        }}
      >
        <span>
          {r.title} (exercise){showDue}
        </span>

        {currentSubmission ? (
          !duePassed && (
            <>
              <UploadButton
                resourceId={r.id}
                label="Edit Delivery"
                onUploaded={fetchResources}
              />
              <button
                onClick={async () => {
                  await api.delete(`/submissions/${currentSubmission.id}`);
                  fetchResources();
                }}
                className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
              >
                Remove Submission
              </button>
            </>
          )
        ) : (
          <UploadButton
            resourceId={r.id}
            label="Submit"
            disabled={duePassed}
            onUploaded={fetchResources}
          />
        )}
      </div>

      {/* Línea 2: icono + nombre + nota */}
      {currentSubmission && (
        <div
          style={{
            marginLeft: '24px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          {/* Icono según extensión */}
          {(() => {
            const ext = currentSubmission.file_url
              .split('.')
              .pop()
              .toLowerCase();
            switch (ext) {
              case 'pdf':
                return <PdfIcon />;
              case 'png':
              case 'jpg':
              case 'jpeg':
                return <ImageIcon />;
              case 'doc':
              case 'docx':
                return <WordIcon />;
              default:
                return <DefaultFileIcon />;
            }
          })()}

          {/* Nombre limpio */}
          <span>
            {currentSubmission.file_url.split(/[/\\]/).pop()}
          </span>

          {/* Nota */}
          {currentSubmission.grade != null && (
            <span className="text-sm text-gray-600">
              Grade: {currentSubmission.grade}
            </span>
          )}
        </div>
      )}

      {/* Past due date si aplica */}
      {duePassed && (
        <div className="mt-1 text-red-600">Past due date</div>
      )}
    </li>
  );
}


          // Otros casos (profesor, práctica, lecture...)
          return (
            <li key={r.id} style={{ marginBottom: '8px' }}>
              {r.title} ({r.type})
              {showDue}
              {role === 'professor' && r.type === 'practice' && (
                <button
                  onClick={() => alert('TODO')}
                  style={{ marginLeft: '8px' }}
                >
                  Edit
                </button>
              )}
              {role === 'student' && r.type === 'practice' && (
                <>
                  <button
                    disabled={duePassed}
                    onClick={() => alert('TODO')}
                    style={{ marginLeft: '8px' }}
                  >
                    Start
                  </button>
                  {duePassed && (
                    <span style={{ marginLeft: '8px' }}>
                      Past due date
                    </span>
                  )}
                </>
              )}
              {role === 'professor' && r.type === 'exercise' && (
                <button
                  onClick={() =>
                    navigate(`/resources/${r.id}/review`, {
                      state: { code: subject.code, title: subject.title },
                    })
                  }
                  style={{ marginLeft: '8px' }}
                >
                  Revisar
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

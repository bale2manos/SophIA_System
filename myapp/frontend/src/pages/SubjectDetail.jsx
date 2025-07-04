import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../api';
import { CircularProgressbar } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';

function UploadButton({ resourceId, label = 'Submit', disabled = false }) {
  const inputRef = useRef();
  const handleUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('file', file);
    api
      .post(`/resources/${resourceId}/submit`, fd)
      .then(() => alert('Submitted successfully'))
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
  
  useEffect(() => {
    let isMounted = true;

    fetch(`/api/subjects/${code}`)
      .then((res) => res.json())
      .then((data) => isMounted && setSubject(data))
      .catch(() => {});

    api
      .get(`/subjects/${code}/resources`)
      .then((res) => isMounted && setResources(res.data))
      .catch(() => {});

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
      <h2>{subject.code} - {subject.title}</h2>
      <p>{subject.description}</p>
      <div style={{ width: 80 }}>
        <CircularProgressbar value={resources.length} maxValue={resources.length || 1} text={`${resources.length}`} />
      </div>
      <h3>Resources</h3>
      <ul>
        {resources.map((r) => {
          const showDue = r.due_date ? ` (Due: ${new Date(r.due_date).toLocaleDateString()})` : '';
          const duePassed = r.due_date && new Date() > new Date(r.due_date);
          const submission = r.submissions && r.submissions[0];
          return (
            <li key={r.id} style={{ marginBottom: '8px' }}>
              {r.title} ({r.type}){showDue}
              {role === 'professor' && r.type === 'practice' && (
                <button onClick={() => alert('TODO')} style={{ marginLeft: '8px' }}>
                  Edit
                </button>
              )}
              {role === 'student' && r.type === 'exercise' && (
                <>
                  {submission && (
                    <div>
                      📎 {submission.file_path.split(/[/\\]/).pop()}
                      {submission.grade != null && <span> - {submission.grade}</span>}
                    </div>
                  )}
                  <UploadButton
                    resourceId={r.id}
                    label={submission ? 'Edit delivery' : 'Submit'}
                    disabled={duePassed}
                  />
                  {duePassed && <span style={{ marginLeft: '8px' }}>Past due date</span>}
                </>
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
                  {duePassed && <span style={{ marginLeft: '8px' }}>Past due date</span>}
                </>
              )}
              {role === 'professor' && r.type === 'exercise' && (
                <button
                  onClick={() =>
                    navigate(
                      `/resources/${r.id}/review`,
                      { state: { code: subject.code, title: subject.title } }
                    )
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
          style={{ position: 'fixed', bottom: 20, right: 20, fontSize: '24px' }}
        >
          ➕
        </Link>
      )}
    </div>
  );
}

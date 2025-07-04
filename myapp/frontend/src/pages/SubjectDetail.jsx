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

  const fetchResources = () => {
    api
      .get(`/subjects/${code}/resources`)
      .then((res) => setResources(res.data))
      .catch(() => {});
  };
  
  useEffect(() => {
    let isMounted = true;

    fetch(`/api/subjects/${code}`)
      .then((res) => res.json())
      .then((data) => isMounted && setSubject(data))
      .catch(() => {});

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
          const currentSubmission = r.submissions && r.submissions[0];
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
                  {currentSubmission ? (
                    <div className="mt-2 p-2 border rounded flex items-center space-x-4">
                      {(() => {
                        const ext = currentSubmission.file_path.split('.').pop().toLowerCase();
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
                      <div>
                        <div className="font-medium">
                          {currentSubmission.file_path.split(/[/\\]/).pop()}
                        </div>
                        {currentSubmission.grade != null && (
                          <div className="text-sm text-gray-600">Grade: {currentSubmission.grade}</div>
                        )}
                      </div>
                      <div className="ml-auto space-x-2">
                        <UploadButton
                          resourceId={r.id}
                          label="Edit Delivery"
                          disabled={duePassed}
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
                      </div>
                    </div>
                  ) : (
                    <UploadButton
                      resourceId={r.id}
                      label="Submit"
                      disabled={duePassed}
                      onUploaded={fetchResources}
                    />
                  )}
                  {duePassed && <span className="ml-2 text-red-600">Past due date</span>}
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

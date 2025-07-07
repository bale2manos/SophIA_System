import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
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

export default function ResourceDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [resource, setResource] = useState(null);
  const [submission, setSubmission] = useState(null);

  const fetchSubmission = async () => {
    try {
      const res = await api.get(`/resources/${id}/submission`);
      setSubmission(res.data);
    } catch (e) {
      setSubmission(null);
    }
  };

  useEffect(() => {
    api.get(`/resources/${id}`)
      .then((res) => setResource(res.data))
      .catch(console.error);
    fetchSubmission();
  }, [id]);

  if (!resource) return <div>Loading...</div>;

  const role = localStorage.getItem('role');
  const duePassed = resource.due_date && new Date() > new Date(resource.due_date);

  return (
    <div>
      <button
        onClick={() => navigate(`/subjects/${resource.subject_code}`)}
        style={{ marginBottom: '16px' }}
      >
        ← Back to Subject
      </button>

      <h2>{resource.title}</h2>
      <p>{resource.description}</p>
      {resource.due_date && (
        <p>Due: {new Date(resource.due_date).toLocaleString()}</p>
      )}
      {submission && submission.grade != null && (
        <p>Grade: {submission.grade}</p>
      )}

      {/* Student actions */}
      {role === 'student' && resource.type === 'exercise' && (
        <div style={{ marginTop: '8px' }}>
          {submission ? (
            !duePassed && (
              <>
                <UploadButton
                  resourceId={id}
                  label="Edit Delivery"
                  onUploaded={fetchSubmission}
                />
                <button
                  onClick={async () => {
                    await api.delete(`/submissions/${submission.id}`);
                    fetchSubmission();
                  }}
                  className="px-2 py-1 bg-red-500 text-white rounded hover:bg-red-600"
                >
                  Remove Submission
                </button>
              </>
            )
          ) : (
            <UploadButton
              resourceId={id}
              label="Submit"
              disabled={duePassed}
              onUploaded={fetchSubmission}
            />
          )}
        </div>
      )}

      {role === 'student' && resource.type === 'practice' && (
        <button disabled={duePassed} onClick={() => alert('TODO')} style={{ marginTop: '8px' }}>
          Start
        </button>
      )}

      {/* File info */}
      {submission && (
        <div
          style={{
            marginTop: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
          }}
        >
          {(() => {
            const ext = submission.file_url.split('.').pop().toLowerCase();
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
          <span>{submission.file_url.split(/[/\\]/).pop()}</span>
        </div>
      )}

      {duePassed && !submission && (
        <div className="mt-1 text-red-600">Past due date</div>
      )}

      {/* Professor review button */}
      {role === 'professor' && resource.type === 'exercise' && (
        <button
          onClick={() =>
            navigate(`/resources/${id}/review`, {
              state: { code: resource.subject_code, title: resource.title },
            })
          }
          style={{ marginTop: '8px' }}
        >
          Revisar
        </button>
      )}
    </div>
  );
}

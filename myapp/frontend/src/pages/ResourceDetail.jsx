import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api, { BACKEND_URL } from '../api';
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
  const location = useLocation();
  const [resource, setResource] = useState(null);
  const [submission, setSubmission] = useState(null);
  const [subjectTitle, setSubjectTitle] = useState(location.state?.subjectTitle || '');
  const [attachments, setAttachments] = useState([]);

  const fetchSubmission = async () => {
    try {
      const res = await api.get(`/resources/${id}/submission`);
      setSubmission(res.data);
    } catch (e) {
      setSubmission(null);
    }
  };

  useEffect(() => {
    api
      .get(`/resources/${id}`)
      .then((res) => {
        setResource(res.data);
        setAttachments(res.data.attachments || []);
        if (!subjectTitle) {
          api
            .get(`/subjects/${res.data.subject_code}`)
            .then((s) => setSubjectTitle(s.data.title))
            .catch(console.error);
        }
      })
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
        ← Back to {subjectTitle || 'Subject'}
      </button>

      <h2>{resource.title}</h2>
      <p>{resource.description}</p>
      {resource.due_date && (
        <p>Due: {new Date(resource.due_date).toLocaleString()}</p>
      )}
      {submission && submission.grade != null && (
        <p>Grade: {submission.grade}</p>
      )}

      {resource.type === 'lecture' && (
        <div style={{ marginTop: '16px' }}>
          {role === 'professor' && (
            <input
              type="file"
              multiple
              onChange={async (e) => {
                const files = Array.from(e.target.files);
                if (!files.length) return;
                const fd = new FormData();
                files.forEach((f) => fd.append('files', f));
                const res = await api.post(`/resources/${id}/attachments`, fd);
                setAttachments((prev) => [...prev, ...(res.data || [])]);
                e.target.value = '';
              }}
              disabled={attachments.length >= 10}
            />
          )}
          <ul>
            {attachments.map((a) => (
              <li key={a.filename} style={{ marginTop: '4px' }}>
                <a
                  href={`${BACKEND_URL}${a.file_url}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {a.filename}
                </a>
                {role === 'professor' && (
                  <button
                    onClick={async () => {
                      await api.delete(`/resources/${id}/attachments/${a.filename}`);
                      setAttachments((prev) => prev.filter((x) => x.filename !== a.filename));
                    }}
                    style={{ marginLeft: '4px' }}
                  >
                    X
                  </button>
                )}
              </li>
            ))}
          </ul>
        </div>
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
        <button
          disabled={duePassed}
          onClick={() => navigate(`/subjects/${resource.subject_code}/practices/${id}`)}
          style={{ marginTop: '8px' }}
        >
          Start
        </button>
      )}

      {role === 'professor' && resource.type === 'practice' && (
        <button
          onClick={async () => {
            const url = prompt('Implementation URL');
            if (url) {
              await api.put(`/resources/${id}/implementation_link`, {
                practice_external_url: url,
              });
            }
          }}
          className="ml-2 px-2 py-1 bg-blue-500 text-white rounded"
          style={{ marginTop: '8px' }}
        >
          Implement
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

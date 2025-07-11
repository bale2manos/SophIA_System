import React, { useState } from 'react';
import api from '../api';
import { useNavigate, useParams } from 'react-router-dom';

export default function ResourceForm({ type }) {
  const { code } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [files, setFiles] = useState([]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const iso = dueDate ? new Date(dueDate).toISOString().replace(/Z$/, '+00:00') : null;

    const { data } = await api.post(`/subjects/${code}/resources`, {
      title,
      type,
      description,
      due_date: iso,
    });
    const resourceId = data.id;

    if (type === 'lecture' && files.length > 0) {
      const fd = new FormData();
      [...files].forEach((f) => fd.append('files', f));
      await api.post(`/resources/${resourceId}/attachments`, fd);
    }
    navigate(-1);
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-md p-4 space-y-4">
      <h2 className="text-xl font-semibold capitalize">New {type}</h2>

      <input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Title" required className="w-full border p-2 rounded" />

      <textarea value={description} onChange={e=>setDescription(e.target.value)} placeholder="Description" className="w-full border p-2 rounded" />

      {type !== 'lecture' && (
        <input type="datetime-local" value={dueDate} onChange={e=>setDueDate(e.target.value)} className="w-full border p-2 rounded" />
      )}

      {type === 'practice' && (
        <button type="button" onClick={()=>alert('TODO: configurar práctica')} className="px-3 py-1 bg-yellow-200 rounded">Configurar práctica</button>
      )}

      {type === 'lecture' && (
        <input type="file" multiple onChange={e=>setFiles(e.target.files)} className="w-full border p-2 rounded" />
      )}

      <button type="submit" className="px-4 py-2 bg-blue-600 text-white rounded">Create</button>
    </form>
  );
}

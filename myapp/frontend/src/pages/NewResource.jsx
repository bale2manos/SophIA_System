import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function NewResource() {
  const { code } = useParams();
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [type, setType] = useState('practice');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');

const handleSubmit = async (e) => {
  e.preventDefault();
  // Convertir la fecha a ISO o enviar null
  const payload = {
    title,
    type,
    description,
    due_date: dueDate ? new Date(dueDate).toISOString() : null,
  };
  await api.post(`/subjects/${code}/resources`, payload);
  navigate(-1);
};

  return (
    <form onSubmit={handleSubmit}>
      <h2>New Resource</h2>
      <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title" />
      <select value={type} onChange={(e) => setType(e.target.value)}>
        <option value="practice">practice</option>
        <option value="lecture">lecture</option>
        <option value="exercise">exercise</option>
      </select>
      <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Description" />
      <input
        type="date"
        value={dueDate}
        onChange={(e) => setDueDate(e.target.value)}
        className="w-full border p-2 rounded"
      />
      <button type="submit">Create</button>
    </form>
  );
}

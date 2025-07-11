import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';

export default function NewResourceSelector() {
  const { code } = useParams();
  const navigate = useNavigate();

  const cards = [
    { type: 'lecture',  title: 'Lecture',  desc: 'Presentación o material teórico' },
    { type: 'practice', title: 'Practice', desc: 'Actividad práctica' },
    { type: 'exercise', title: 'Exercise', desc: 'Entrega evaluable' },
  ];

  return (
    <div className="p-6 flex gap-6">
      {cards.map((c) => (
        <div
          key={c.type}
          onClick={() => navigate(`/subjects/${code}/resources/new/${c.type}`)}
          className="cursor-pointer flex flex-col items-center justify-center w-40 h-40 border rounded-lg shadow hover:shadow-lg"
        >
          <h3 className="font-semibold">{c.title}</h3>
          <p className="text-sm text-gray-500 text-center px-2">{c.desc}</p>
        </div>
      ))}
    </div>
  );
}

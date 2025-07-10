import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatPractice from '../components/ChatPractice';

export default function PracticeChat() {
  const { code, id } = useParams();
  const navigate = useNavigate();
  return (
    <div className="h-full flex flex-col p-4">
      <button
        onClick={() => navigate(`/subjects/${code}`)}
        className="mb-4 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
      >
        ← Back
      </button>
      <ChatPractice practiceId={id} />
    </div>
  );
}

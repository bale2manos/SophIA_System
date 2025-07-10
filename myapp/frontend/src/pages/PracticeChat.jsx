import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatPractice from '../components/ChatPractice';

export default function PracticeChat() {
  const { code, id } = useParams();
  const navigate = useNavigate();
  return (
    <div className="h-screen flex flex-col p-4">
      <button
        onClick={() => navigate(`/subjects/${code}`)}
        className="mb-4 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300 flex-shrink-0"
      >
        ← Back
      </button>
      <div className="flex-1 min-h-0">
        <ChatPractice practiceId={id} />
      </div>
    </div>
  );
}

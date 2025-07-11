import React, { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import ChatPractice from '../components/ChatPractice';
import api from '../api';

export default function PracticeChat() {
  const { code, id } = useParams();

  useEffect(() => {
    api
      .get(`/resources/${id}`)
      .then((res) => {
        localStorage.setItem(`res_title_${res.data.id}`, res.data.title);
        localStorage.setItem(`res_subject_${res.data.id}`, res.data.subject_code);
        return api.get(`/subjects/${res.data.subject_code}`);
      })
      .then((s) => {
        localStorage.setItem(`subj_title_${s.data.code}`, s.data.title);
      })
      .catch(() => {});
  }, [id]);
  return (
    <div className="h-screen flex flex-col p-4">
      <div className="flex-1 min-h-0">
        <ChatPractice practiceId={id} />
      </div>
    </div>
  );
}

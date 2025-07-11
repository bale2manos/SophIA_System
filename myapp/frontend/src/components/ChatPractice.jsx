import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

export default function ChatPractice({ practiceId, subjectCode }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const [showScrollBtn, setShowScrollBtn] = useState(false);
  const pendingRef = useRef([]);
  const timerRef = useRef(null);
  const scrollRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const res = await api.post(`/practices/${practiceId}/start`);
        if (isMounted) setMessages(res.data.messages || []);
      } catch (e) {
        console.error(e);
      }
    };
    load();
    return () => {
      isMounted = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [practiceId]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setShowScrollBtn(el.scrollHeight - el.scrollTop - el.clientHeight > 100);
  };

  const flushMessages = () => {
    const batch = pendingRef.current;
    if (!batch.length) return;
    pendingRef.current = [];
    api.post(`/practices/${practiceId}/messages`, { messages: batch }).catch(() => {});
  };

  const handleSend = (e) => {
    if (e) e.preventDefault();
    if (!draft.trim()) return;
    const msg = { text: draft, ts: new Date().toISOString() };
    setMessages((prev) => [...prev, { ...msg, sender: 'student' }]);
    pendingRef.current.push(msg);
    setDraft('');

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(flushMessages, 1000);
  };

  const resetChat = async () => {
    if (!window.confirm('¿Reiniciar práctica?')) return;
    await api.post(`/practices/${practiceId}/reset`);
    const { data } = await api.get(`/practices/${practiceId}/start`);
    setMessages(data.messages);
  };

  const Avatar = ({ icon }) => (
    <div className="w-6 h-6 rounded-full bg-gray-400 flex items-center justify-center text-xs text-white font-bold mx-1">
      {icon}
    </div>
  );

  return (
    <div className="h-screen flex flex-col">
      {/* CABECERA INTERNA */}
      <div className="flex justify-between items-center px-4 py-2 border-b">
        <button onClick={resetChat} className="bg-green-500 text-white px-3 py-1 rounded">RESET</button>
        <button onClick={() => navigate(`/subjects/${subjectCode}`)} className="bg-red-500 text-white px-3 py-1 rounded">EXIT</button>
      </div>

      {/* MENSAJES */}
      <div ref={scrollRef} onScroll={handleScroll} className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
        {messages.map((m, i) => {
          const mine = m.sender === 'student';
          const bubble = mine ? 'bg-blue-600 text-white' : 'bg-yellow-100 text-black';
          const corner = mine ? 'rounded-tr-none' : 'rounded-tl-none';
          const avatar = mine ? 'U' : 'S';
          return (
            <div key={i} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              {!mine && <Avatar icon={avatar} />}
              <div className={`${bubble} ${corner} px-4 py-2 rounded-xl max-w-[70%]`}>{m.text}</div>
              {mine && <Avatar icon={avatar} />}
            </div>
          );
        })}
      </div>

      {/* BOTÓN FLOTANTE */}
      {showScrollBtn && (
        <button
          onClick={() => scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' })}
          className="fixed bottom-24 right-6 bg-gray-300 p-2 rounded-full shadow"
        >
          ↧
        </button>
      )}

      {/* INPUT */}
      <form onSubmit={handleSend} className="flex items-center border-t px-2 py-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type…"
          className="flex-grow p-2 outline-none"
        />
        <button type="submit" className="text-blue-600 p-2">▶️</button>
      </form>
    </div>
  );
}

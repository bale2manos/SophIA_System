import React, { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import api from '../api';

export default function ChatPractice({ practiceId }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const pendingRef = useRef([]);
  const timerRef = useRef(null);
  const scrollRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      try {
        const res = await api.post(`/practices/${practiceId}/start`);
        let msgs = res.data.messages || [];
        if (!msgs.length) {
          try {
            const { data: resource } = await api.get(`/resources/${practiceId}`);
            const { data: subject } = await api.get(`/subjects/${resource.subject_code}`);
            const name = localStorage.getItem('name') || '';
            msgs = [
              {
                text: `Hola ${name}, bienvenido a ${resource.title} de ${subject.title}. Tu primera tarea será saludar`,
                ts: new Date().toISOString(),
                sender: 'sophia',
              },
            ];
          } catch (e) {
            console.error(e);
          }
        }
        if (isMounted) setMessages(msgs);
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

  const flushMessages = () => {
    const batch = pendingRef.current;
    if (!batch.length) return;
    pendingRef.current = [];
    api.post(`/practices/${practiceId}/messages`, { messages: batch }).catch(() => {});
  };

  const handleSend = () => {
    if (!draft.trim()) return;
    const msg = { text: draft, ts: new Date().toISOString() };
    setMessages((prev) => [...prev, { ...msg, sender: 'student' }]);
    pendingRef.current.push(msg);
    setDraft('');

    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(flushMessages, 1000);
  };

  return (
    <div className="flex flex-col h-full border rounded">
      <div className="flex flex-col gap-3 overflow-y-auto grow px-4 py-2" ref={scrollRef}>
        {messages.map((m, i) => {
          const mine = m.sender === 'student';
          return (
            <div key={i} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
              <div>
                {/* avatar */}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${mine ? 'bg-purple-500 text-white' : 'bg-blue-500 text-white'}`}>{mine ? 'Y' : 'S'}</div>
              </div>
              <div className={`ml-2 flex flex-col items-${mine ? 'end' : 'start'}`}>
                <div className={`${mine ? 'bg-blue-600 text-white' : 'bg-gray-100'} rounded-xl ${mine ? 'rounded-tr-none' : 'rounded-tl-none'} px-4 py-2 max-w-[70%]`}>
                  {m.text}
                </div>
                <span className="text-xs text-gray-400 mt-1">{dayjs(m.ts).format('HH:mm')}</span>
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={handleSend} className="flex items-center border-t px-2 py-1">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          className="flex-grow p-2 outline-none"
          placeholder="Type a message"
        />
        <button type="submit" className="p-2 text-blue-600">▶️</button>
      </form>
    </div>
  );
}

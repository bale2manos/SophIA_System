import React, { useEffect, useRef, useState } from 'react';
import api from '../api';
import ChatMessageBubble from './ChatMessageBubble';

export default function ChatPractice({ practiceId }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const pendingRef = useRef([]);
  const timerRef = useRef(null);

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
    const el = document.getElementById('chat-scroll');
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages]);

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


  return (
    <div className="flex flex-col h-full">
      <div id="chat-scroll" className="flex-1 overflow-y-auto px-4 py-2">
        {messages.map((m, i) => (
          <ChatMessageBubble key={i} message={m} />
        ))}
      </div>
      <form
        onSubmit={handleSend}
        className="flex-none flex items-center gap-2 border-t px-4 py-2 bg-white"
      >
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          placeholder="Type a message"
          className="flex-1 border rounded px-2 py-1"
        />
        <button
          type="submit"
          disabled={!draft.trim()}
          className="px-3 py-1 bg-blue-600 text-white rounded disabled:opacity-50"
        >
          ➤
        </button>
      </form>
    </div>
  );
}

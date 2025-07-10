import React, { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import api from '../api';

export default function ChatPractice({ practiceId }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');
  const pendingRef = useRef([]);
  const timerRef = useRef(null);
  const scrollRef = useRef(null);
  const textareaRef = useRef(null);

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

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (draft.trim()) {
        handleSend();
      }
    }
  };

  const handleInput = (e) => {
    setDraft(e.target.value);

    // Auto-resize textarea
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = Math.min(textarea.scrollHeight, 120) + 'px';
    }
  };

  return (
    <div className="flex flex-col h-full border rounded">
      <div className="flex flex-col gap-3 overflow-y-auto grow px-4 py-2" ref={scrollRef}>
        {messages.map((m, i) => {
          const mine = m.sender === 'student';
          return (
            <div key={i} className={`flex ${mine ? 'justify-end' : 'justify-start'} w-full`}>
              <div className={`flex ${mine ? 'flex-row-reverse' : 'flex-row'} items-start max-w-[80%]`}>
                {/* avatar */}
                <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${mine ? 'bg-purple-500 text-white ml-2' : 'bg-blue-500 text-white mr-2'}`}>
                  {mine ? 'Y' : 'S'}
                </div>
                <div className={`flex flex-col ${mine ? 'items-end' : 'items-start'} min-w-0 flex-1`}>
                  <div className={`${mine ? 'bg-blue-600 text-white' : 'bg-gray-100'} rounded-xl ${mine ? 'rounded-tr-none' : 'rounded-tl-none'} px-4 py-2 break-words`}>
                    {m.text}
                  </div>
                  <span className="text-xs text-gray-400 mt-1">{dayjs(m.ts).format('HH:mm')}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="flex items-end border-t px-2 py-1">
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          className="flex-grow p-2 outline-none resize-none overflow-hidden"
          placeholder="Type a message"
          rows="1"
        />
        <button
          type="button"
          onClick={handleSend}
          className="p-2 text-blue-600 ml-2"
        >
          ▶️
        </button>
      </div>
    </div>
  );
}

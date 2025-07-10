import React, { useEffect, useRef, useState } from 'react';
import dayjs from 'dayjs';
import api from '../api';
import sophiaImg from '../icons/sophia.png';

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
    <div className="flex flex-col h-full border rounded relative">
      <div className="flex flex-col gap-3 overflow-y-auto flex-1 min-h-0 px-4 py-2" ref={scrollRef} style={{ marginBottom: '56px' }}>
        {messages.map((m, i) => {
          const mine = m.sender === 'student';
          return (
            <div key={i} className={`flex ${mine ? 'justify-end' : 'justify-start'} w-full`}>
              <div className={`flex ${mine ? 'flex-row-reverse' : 'flex-row'} items-start max-w-[80%]`}>
                {/* avatar solo para sophia */}
                {!mine && (
                  <img
                    src={sophiaImg}
                    alt="SophIA avatar"
                    className="w-3 h-3 rounded-full flex-shrink-0 mr-1"
                    style={{ width: '5vh', height: '5vh' }}
                  />
                )}
                <div className={`flex flex-col items-${mine ? 'end' : 'start'}`}>
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

      <div className="flex items-end border-t px-2 py-1 flex-shrink-0 w-full bg-white absolute left-0" style={{ bottom: 0, height: '56px' }}>
        <textarea
          ref={textareaRef}
          value={draft}
          onChange={handleInput}
          onKeyDown={handleKeyDown}
          className="flex-grow p-2 outline-none resize-none overflow-hidden"
          placeholder="Type a message"
          rows="1"
          style={{ maxHeight: '40px' }}
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

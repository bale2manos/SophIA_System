import React, { useEffect, useRef, useState } from 'react';
import api from '../api';
import ChatMessages from './ChatMessages';
import ChatInput from './ChatInput';

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
      <ChatMessages messages={messages} scrollRef={scrollRef} />
      <ChatInput
        draft={draft}
        textareaRef={textareaRef}
        handleInput={handleInput}
        handleKeyDown={handleKeyDown}
        handleSend={handleSend}
      />
    </div>
  );
}

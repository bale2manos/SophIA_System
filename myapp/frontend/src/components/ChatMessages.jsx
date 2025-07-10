import React from 'react';
import ChatMessageBubble from './ChatMessageBubble';

export default function ChatMessages({ messages, scrollRef }) {
  return (
    <div className="flex flex-col gap-3 overflow-y-auto flex-1 min-h-0 px-4 py-2" ref={scrollRef} style={{ marginBottom: '56px' }}>
      {messages.map((m, i) => (
        <ChatMessageBubble key={i} message={m} />
      ))}
    </div>
  );
}

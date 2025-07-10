import React from 'react';
import ChatMessageBubble from './ChatMessageBubble';

export default function ChatMessages({ messages, scrollRef, bottomRef }) {
  return (
    <div
      className="flex flex-col gap-3 overflow-y-auto flex-1 min-h-0 px-4 py-2 pb-[56px]"
      ref={scrollRef}
    >
      {messages.map((m, i) => (
        <ChatMessageBubble key={i} message={m} />
      ))}
      <div ref={bottomRef} />
    </div>
  );
}

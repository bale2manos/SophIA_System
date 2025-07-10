import React from 'react';

export default function ChatInput({ draft, textareaRef, handleInput, handleKeyDown, handleSend }) {
  return (
    <div
      className="flex items-end border-t px-2 py-1 flex-shrink-0 w-full bg-white fixed left-0 right-0 z-10"
      style={{ bottom: 0, height: '56px' }}
    >
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
  );
}

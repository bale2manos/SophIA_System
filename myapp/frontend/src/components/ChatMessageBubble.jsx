import React from 'react';
import sophiaImg from '../icons/sophia.png';
import userImg from '../icons/user_generic.png';

export default function ChatMessageBubble({ message }) {
  const mine = message.sender === 'student';
  const avatarImg = mine ? userImg : sophiaImg;
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'} w-full`}>
      <div className={`flex ${mine ? 'flex-row-reverse' : 'flex-row'} items-start max-w-[45%]`}>
        {/* avatar */}
        <img
          src={avatarImg}
          alt={mine ? 'User avatar' : 'SophIA avatar'}
          className={`w-3 h-3 rounded-full flex-shrink-0 ${mine ? 'ml-1' : 'mr-1'}`}
          style={{ width: '5vh', height: '5vh' }}
        />
        <div className={`flex flex-col max-w-[100%] items-${mine ? 'end' : 'start'}`}>
          <div
            className={`${mine ? 'bg-blue-600 text-white' : 'bg-gray-100'} max-w-[100%] rounded-xl ${mine ? 'rounded-tr-none' : 'rounded-tl-none'} px-4 py-2 break-words`}
            style={{ whiteSpace: 'pre-wrap' }}
          >
            {message.text}
          </div>
        </div>
      </div>
    </div>
  );
}

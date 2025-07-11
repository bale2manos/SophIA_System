import React from 'react';
import dayjs from 'dayjs';
import sophiaImg from '../icons/sophia.png';
import userImg from '../icons/user_generic.png';

export default function ChatMessageBubble({ message }) {
  const mine = message.sender === 'student';
  const avatarImg = mine ? userImg : sophiaImg;
  return (
    <div className={`flex ${mine ? 'justify-end' : 'justify-start'} w-full`}>
      <div className={`flex ${mine ? 'flex-row-reverse' : 'flex-row'} items-start max-w-[80%]`}>
        {/* avatar */}
        <img
          src={avatarImg}
          alt={mine ? 'User avatar' : 'SophIA avatar'}
          className={`w-3 h-3 rounded-full flex-shrink-0 ${mine ? 'ml-1' : 'mr-1'}`}
          style={{ width: '5vh', height: '5vh' }}
        />
        <div className={`flex flex-col items-${mine ? 'end' : 'start'}`}>
          <div className={`${mine ? 'bg-blue-600 text-white' : 'bg-gray-100'} rounded-xl ${mine ? 'rounded-tr-none' : 'rounded-tl-none'} px-4 py-2 break-words`}>
            {message.text}
          </div>
          <span className="text-xs text-gray-400 mt-1">{dayjs(message.ts).format('HH:mm')}</span>
        </div>
      </div>
    </div>
  );
}

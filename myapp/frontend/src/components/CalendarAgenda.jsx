import React from 'react';

function CalendarAgenda({ resources }) {
  const events = resources
    .filter((r) => r.due_date)
    .map((r) => ({ date: new Date(r.due_date), title: r.title }))
    .sort((a, b) => a.date - b.date);

  return (
    <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
      <ul>
        {events.map((event, idx) => (
          <li key={idx} style={{ marginBottom: '4px' }}>
            {event.date.toLocaleDateString()} {event.date.toLocaleTimeString()} - {event.title}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CalendarAgenda;

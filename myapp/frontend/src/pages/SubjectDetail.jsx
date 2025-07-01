import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';

export default function SubjectDetail() {
  const { id } = useParams();
  const [subject, setSubject] = useState(null);

  useEffect(() => {
    fetch(`/api/subjects/${id}`)
      .then((res) => res.json())
      .then(setSubject);
  }, [id]);

  if (!subject) return <div>Loading...</div>;

  return (
    <div>
      <h2>{subject.code} - {subject.title}</h2>
      <p>{subject.description}</p>
      <h3>Resources</h3>
      <ul>
        <li>Resource 1 (placeholder)</li>
        <li>Resource 2 (placeholder)</li>
      </ul>
    </div>
  );
}

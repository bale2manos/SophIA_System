import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import api from '../api';

export default function ReviewSubmissions() {
  const { id } = useParams();
  const [subs, setSubs] = useState([]);

  useEffect(() => {
    api.get(`/resources/${id}/submissions`).then((res) => setSubs(res.data));
  }, [id]);

  const updateGrade = async (sid, grade) => {
    await api.patch(`/submissions/${sid}`, { grade });
  };

  return (
    <div>
      <h2>Submissions</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>File</th>
            <th>Grade</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {subs.map((s, i) => (
            <tr key={s.id}>
              <td>{s.name}</td>
              <td>
                <a href={s.file_url} target="_blank" rel="noopener noreferrer">
                  Download
                </a>
              </td>
              <td>
                <input
                  type="number"
                  value={s.grade ?? ''}
                  onChange={(e) => {
                    const val = e.target.value;
                    setSubs((prev) => {
                      const copy = [...prev];
                      copy[i] = { ...copy[i], grade: val };
                      return copy;
                    });
                  }}
                />
              </td>
              <td>
                <button onClick={() => updateGrade(s.id, s.grade)}>✅</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

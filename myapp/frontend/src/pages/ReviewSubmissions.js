import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function ReviewSubmissions() {
  const { id, code } = useParams();
  const navigate = useNavigate();
  const [subs, setSubs] = useState([]);

  useEffect(() => {
    api
      .get(`/resources/${id}/submissions`)
      .then((res) =>
        setSubs(res.data.map((s) => ({ ...s, originalGrade: s.grade })))
      );
  }, [id]);

  const updateGrade = async (sid, grade, index) => {
    await api.patch(`/submissions/${sid}`, { grade });
    setSubs((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], originalGrade: grade };
      return copy;
    });
  };

  return (
    <div>
      <button onClick={() => navigate(`/subjects/${code}`)} style={{ marginBottom: '16px' }}>
        ← Volver a Asignatura
      </button>
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
          {subs.map((s, i) => {
            const modified = s.grade !== s.originalGrade;
            return (
              <tr key={s.id}>
                <td>{s.name}</td>
                <td>
                  {s.file_url.split('/').pop()}{' '}
                  <a href={s.file_url} download style={{ marginLeft: '4px' }}>
                    ⬇️
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
                  <button
                    className={modified ? 'text-green-600' : 'text-gray-400'}
                    disabled={!modified}
                    onClick={() => updateGrade(s.id, s.grade, i)}
                  >
                    ✔️
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

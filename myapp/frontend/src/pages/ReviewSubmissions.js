// src/pages/ReviewSubmissions.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import api, { BACKEND_URL } from '../api';


export default function ReviewSubmissions() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Si vienen por estado, úsalos; si no, haz fallback con params o fetch
  const code = location.state?.code;
  const titleFromState = location.state?.title;

  const [subjectTitle, setSubjectTitle] = useState(titleFromState || '');

  const [subs, setSubs] = useState([]);

  useEffect(() => {
    if (!titleFromState && code) {
      api.get(`/subjects/${code}`).then((res) => {
        setSubjectTitle(res.data.title);
      });
    }
  }, [code, titleFromState]);

  // Fetch submissions and remember original grades
  useEffect(() => {
    api
      .get(`/resources/${id}/submissions`)
      .then((res) =>
        setSubs(res.data.map((s) => ({ ...s, originalGrade: s.grade })))
      );
  }, [id]);

  // Save a new grade and reset the “modified” flag
  const updateGrade = async (sid, grade, index) => {
    await api.patch(`/submissions/${sid}`, { grade });
    setSubs((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], originalGrade: grade };
      return copy;
    });
  };

  return (
    <div className="p-4">
      {/* 1) Back to subject */}
      <button
        onClick={() => navigate(`/subjects/${code}`)}
        className="mb-4 px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
      >
        ← Volver a {subjectTitle}
      </button>

      <h2 className="text-2xl mb-2">Revisar Entregas</h2>

      <table className="w-full table-auto border-collapse">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-2 py-1">Name</th>
            <th className="border px-2 py-1">File</th>
            <th className="border px-2 py-1">Grade</th>
            <th className="border px-2 py-1"></th>
          </tr>
        </thead>
        <tbody>
          {subs.map((s, i) => {
            const modified = s.grade !== s.originalGrade;
            const fileName = s.file_url.split('/').pop();
            return (
              <tr key={s.id}>
                {/* 2) Name column */}
                <td className="border px-2 py-1">{s.name}</td>

                {/* 3) File column with download */}
                <td className="border px-2 py-1">
                  {fileName}{' '}
                  <a
                    href={`${BACKEND_URL}${s.file_url}`}
                    download
                    className="text-blue-600 hover:underline ml-1"
                  >
                    ⬇️
                  </a>
                </td>

                {/* 4) Grade input */}
                <td className="border px-2 py-1">
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
                    className="w-16 border p-1 rounded"
                  />
                </td>

                {/* 5) Save button */}
                <td className="border px-2 py-1 text-center">
                  <button
                    onClick={() => updateGrade(s.id, s.grade, i)}
                    disabled={!modified}
                    className={`px-2 py-1 rounded ${
                      modified
                        ? 'bg-green-500 text-white hover:bg-green-600'
                        : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                    }`}
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

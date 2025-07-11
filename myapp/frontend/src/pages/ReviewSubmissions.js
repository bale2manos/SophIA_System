// src/pages/ReviewSubmissions.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useLocation } from 'react-router-dom';
import api, { BACKEND_URL } from '../api';


export default function ReviewSubmissions() {
  const { id } = useParams();
  const location = useLocation();

  // Si vienen por estado, úsalos; si no, haz fallback con params o fetch
  const code = location.state?.code;
  const titleFromState = location.state?.title;

  const [subjectCode, setSubjectCode] = useState(code || '');
  const [subjectTitle, setSubjectTitle] = useState(titleFromState || '');

  const [subs, setSubs] = useState([]);

  useEffect(() => {
    api
      .get(`/resources/${id}`)
      .then((res) => {
        localStorage.setItem(`res_title_${res.data.id}`, res.data.title);
        localStorage.setItem(`res_subject_${res.data.id}`, res.data.subject_code);
        if (!subjectCode) setSubjectCode(res.data.subject_code);
        if (!subjectTitle) {
          api
            .get(`/subjects/${res.data.subject_code}`)
            .then((s) => {
              setSubjectTitle(s.data.title);
              localStorage.setItem(`subj_title_${res.data.subject_code}`, s.data.title);
            })
            .catch(() => {});
        }
      })
      .catch(() => {});
  }, [id]);

  useEffect(() => {
    if (subjectCode && !subjectTitle) {
      api.get(`/subjects/${subjectCode}`).then((res) => {
        setSubjectTitle(res.data.title);
        localStorage.setItem(`subj_title_${subjectCode}`, res.data.title);
      });
    }
  }, [subjectCode, subjectTitle]);

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
            // Solo consideramos inválido si hay algo escrito Y está fuera de [0,10]
            const isInvalid =
              s.grade !== '' && (s.grade < 0 || s.grade > 10);
            const fileName = s.file_url.split(/[/\\]/).pop();

            return (
              <tr key={s.id} className={isInvalid ? 'bg-red-100' : ''}>
                {/* Name */}
                <td className="border px-2 py-1">{s.name}</td>

                {/* File */}
                <td className="border px-2 py-1">
                  {fileName}{' '}
                  <a
                    href={`${BACKEND_URL}${s.file_url}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline ml-1"
                  >
                    ⬇️
                  </a>
                </td>

                {/* Grade con validación */}
                <td className="border px-2 py-1">
                  <input
                    type="number"
                    min="0"
                    max="10"
                    step="0.1"
                    value={s.grade ?? ''}
                    onChange={(e) => {
                      let val = parseFloat(e.target.value);
                      if (isNaN(val)) val = '';
                      else if (val < 0) val = 0;
                      else if (val > 10) val = 10;
                      setSubs((prev) => {
                        const copy = [...prev];
                        copy[i] = { ...copy[i], grade: val };
                        return copy;
                      });
                    }}
                    className="w-16 border p-1 rounded"
                  />
                  {isInvalid && (
                    <div className="text-red-600 text-sm mt-1">
                      La nota debe estar entre 0 y 10
                    </div>
                  )}
                </td>

                {/* Botón Guardar */}
                <td className="border px-2 py-1 text-center">
                  <button
                    onClick={() => updateGrade(s.id, s.grade, i)}
                    disabled={!modified || isInvalid}
                    className={`px-2 py-1 rounded ${
                      modified && !isInvalid
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

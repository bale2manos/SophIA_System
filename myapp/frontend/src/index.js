// src/index.js

import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// ——— CSS Imports ———
import './index.css';                                      // Tailwind base/styles
import 'react-circular-progressbar/dist/styles.css';       // CircularProgressbar styles

// ——— App Imports ———
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import SubjectDetail from './pages/SubjectDetail';
import NewResourceSelector from './pages/NewResourceSelector';
import NewLecture from './pages/NewLecture';
import NewPractice from './pages/NewPractice';
import NewExercise from './pages/NewExercise';
import PrivateRoute from './PrivateRoute';
import ReviewSubmissions from './pages/ReviewSubmissions';
import ResourceDetail from './pages/ResourceDetail';
import PracticeChat from './pages/PracticeChat';
import AppLayout from './layouts/AppLayout';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route element={<PrivateRoute><AppLayout /></PrivateRoute>}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/subjects/:code" element={<SubjectDetail />} />
          <Route path="/subjects/:code/resources/new" element={<NewResourceSelector />} />
          <Route path="/subjects/:code/resources/new/lecture" element={<NewLecture />} />
          <Route path="/subjects/:code/resources/new/practice" element={<NewPractice />} />
          <Route path="/subjects/:code/resources/new/exercise" element={<NewExercise />} />
          <Route path="/resources/:id" element={<ResourceDetail />} />
          <Route path="/subjects/:code/practices/:id" element={<PracticeChat />} />
          <Route path="/resources/:id/review" element={<ReviewSubmissions />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);

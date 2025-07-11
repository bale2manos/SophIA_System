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
import NewResource from './pages/NewResource';
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
          <Route path="/subjects/:code/resources/new" element={<NewResource />} />
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

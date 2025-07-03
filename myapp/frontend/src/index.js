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

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={
            <PrivateRoute>
              <Dashboard />
            </PrivateRoute>
          }
        />

        <Route
          path="/subjects/:code"
          element={
            <PrivateRoute>
              <SubjectDetail />
            </PrivateRoute>
          }
        />

        <Route
          path="/subjects/:code/resources/new"
          element={
            <PrivateRoute>
              <NewResource />
            </PrivateRoute>
          }
        />

        <Route
          path="/resources/:id/review"
          element={
            <PrivateRoute>
              <ReviewSubmissions />
            </PrivateRoute>
          }
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

const root = createRoot(document.getElementById('root'));
root.render(<App />);

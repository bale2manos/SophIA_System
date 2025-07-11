import React from 'react';
import Navbar from '../components/Navbar';
import { Outlet } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <div className="flex-grow">
        <Outlet />
      </div>
    </div>
  );
}

import React from 'react';
import Navbar from '../components/Navbar';
import { Outlet } from 'react-router-dom';

export default function AppLayout() {
  return (
    <div className="h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}

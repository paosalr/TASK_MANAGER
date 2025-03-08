import React from 'react';
import { Outlet, Link } from 'react-router-dom';

const MainLayout = () => {
  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#F5EDE6', padding: '20px' }}>
      <header style={{ backgroundColor: '#4F2A42', padding: '10px', marginBottom: '20px', borderRadius: '5px' }}>
        <h1 style={{ color: '#F5EDE6', textAlign: 'center' }}>Task Manager</h1>
        <nav style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
          <Link to="/" style={{ color: '#F5EDE6', textDecoration: 'none' }}>Home</Link>
          <Link to="/dashboard" style={{ color: '#F5EDE6', textDecoration: 'none' }}>Dashboard</Link>
        </nav>
      </header>
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default MainLayout;
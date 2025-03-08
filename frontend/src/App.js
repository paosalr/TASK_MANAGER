import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import LandingPage from './pages/LandingPage/LandingPage.jsx';
import LoginPage from './pages/LoginPage/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage/RegisterPage.jsx';
import DashboardPage from './pages/Dashboard/DashboardPage.jsx';
import ManageRoles from './pages/ManageRole/ManageRoles.jsx';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/manage-roles" element={<ManageRoles />} />
      </Routes>
    </Router>
  );
}

export default App;
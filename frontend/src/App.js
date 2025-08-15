// src/App.js

import React, { useState } from 'react';
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom';
import Login from './components/Login';
import Register from './components/Register';
import Home from './components/Home';
import UserDashboard from './pages/UserDashboard';
import AdminDashboard from './pages/AdminDashboard';
import Profile from './pages/Profile';
import TicketDetails from './pages/TicketDetails';
import MyReservations from './pages/MyReservations';
import AllReports from './pages/AllReports';
import AdminReports from './pages/AdminReports';
import AdminTickets from './pages/AdminTickets';
import UserTicketsViewer from './pages/UserTicketsViewer';
import './App.css';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(!!localStorage.getItem('accessToken'));

  // --- login handler ---
  const handleLogin = (token, role) => {
    localStorage.setItem('accessToken', token);
    localStorage.setItem('userRole', role);
    setIsAuthenticated(true);
  };

  // --- logout handler ---
  const handleLogout = () => {
    localStorage.clear();
    setIsAuthenticated(false);
    window.location.href = '/login';
  };

  // --- PublicRoute ---
  const PublicRoute = ({ children }) => {
    const isAuthenticated = !!localStorage.getItem('accessToken');
    const userRole = localStorage.getItem('userRole');

    if (isAuthenticated) {
      if (userRole === 'ADMIN') return <Navigate to="/admin/dashboard" replace />;
      return <Navigate to="/dashboard" replace />;
    }

    return children;
  };

  // --- PrivateRoute ---
  const PrivateRoute = ({ children, roleRequired }) => {
    const isAuthenticated = !!localStorage.getItem('accessToken');
    const userRole = localStorage.getItem('userRole');

    if (!isAuthenticated) return <Navigate to="/login" replace />;
    // if (roleRequired && userRole !== roleRequired) return <Navigate to="/unauthorized" replace />;

    return children;
  };

  return (
    <Routes>
      {/* --- Public Routes --- */}
      <Route path="/" element={<Home />} />
      <Route
        path="/login"
        element={
          <PublicRoute>
            <Login onLogin={handleLogin} />
          </PublicRoute>
        }
      />
      <Route
        path="/register"
        element={
          <PublicRoute>
            <Register />
          </PublicRoute>
        }
      />

      {/* --- User Private Routes --- */}
      <Route
        path="/dashboard"
        element={
          <PrivateRoute roleRequired="USER">
            <UserDashboard onLogout={handleLogout} />
          </PrivateRoute>
        }
      />
      <Route
        path="/profile"
        element={
          <PrivateRoute roleRequired="USER">
            <Profile />
          </PrivateRoute>
        }
      />
      <Route
        path="/tickets/:ticketId"
        element={
          <PrivateRoute roleRequired="USER">
            <TicketDetails />
          </PrivateRoute>
        }
      />
      <Route
        path="/reservations"
        element={
          <PrivateRoute roleRequired="USER">
            <MyReservations />
          </PrivateRoute>
        }
      />
      <Route
        path="/reports"
        element={
          <PrivateRoute roleRequired="USER">
            <AllReports />
          </PrivateRoute>
        }
      />

      {/* --- Admin Private Routes --- */}
      <Route
        path="/admin/dashboard"
        element={
          <PrivateRoute roleRequired="ADMIN">
            <AdminDashboard onLogout={handleLogout} />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/reports"
        element={
          <PrivateRoute roleRequired="ADMIN">
            <AdminReports />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/tickets"
        element={
          <PrivateRoute roleRequired="ADMIN">
            <AdminTickets />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/user-tickets"
        element={
          <PrivateRoute roleRequired="ADMIN">
            <UserTicketsViewer />
          </PrivateRoute>
        }
      />

      {/* --- Unauthorized Page --- */}
      <Route
        path="/unauthorized"
        element={
          <div style={{ padding: '40px', textAlign: 'center' }}>
            <h2>🚫 Access Denied</h2>
            <p>You do not have permission to view this page.</p>
            <button onClick={() => window.history.back()} className="btn">
              Go Back
            </button>
          </div>
        }
      />

      {/* --- Fallback --- */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

// --- Wrapper ---
const AppWrapper = () => (
  <BrowserRouter>
    <App />
  </BrowserRouter>
);

export default AppWrapper;

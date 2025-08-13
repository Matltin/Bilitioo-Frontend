import React from 'react';
import { Link } from 'react-router-dom';
import './AdminDashboard.css';

const AdminDashboard = ({ onLogout }) => {
  return (
    <div className="admin-dashboard">
      <header className="dashboard-header">
          <h2>Admin Dashboard</h2>
          <button onClick={onLogout} className="btn btn-logout">Logout</button>
      </header>
      <div className="admin-menu">
        <Link to="/admin/reports" className="admin-menu-item">
          <h3>Manage Reports</h3>
          <p>View and respond to user reports.</p>
        </Link>
        <Link to="/admin/tickets" className="admin-menu-item">
          <h3>View All Tickets</h3>
          <p>Browse all tickets available in the system.</p>
        </Link>
        {/* NEW: Add a link to the user ticket viewer */}
        <Link to="/admin/user-tickets" className="admin-menu-item">
          <h3>View User Tickets</h3>
          <p>Look up a user's completed and pending tickets.</p>
        </Link>
      </div>
    </div>
  );
};

export default AdminDashboard;
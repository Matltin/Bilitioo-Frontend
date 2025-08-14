import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:3000/admin';

const AdminTickets = () => {
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchTickets = async () => {
            const token = localStorage.getItem('accessToken');
            try {
                const response = await axios.get(`${API_URL}/tickets`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTickets(response.data || []);
            } catch (err) {
                console.error("Failed to fetch tickets", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchTickets();
    }, []);

    if (isLoading) return <div className="container">Loading tickets...</div>;

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h2>All System Tickets</h2>
                <Link to="/admin/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
            </header>
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Ticket ID</th>
                            <th>Route ID</th>
                            <th>Vehicle ID</th>
                            <th>Amount</th>
                            <th>Departure Time</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {tickets.map(ticket => (
                            <tr key={ticket.id}>
                                <td>{ticket.id}</td>
                                <td>{ticket.route_id}</td>
                                <td>{ticket.vehicle_id}</td>
                                <td>{ticket.amount}</td>
                                <td>{new Date(ticket.departure_time).toLocaleString()}</td>
                                <td><span className={`status-${ticket.status.toLowerCase()}`}>{ticket.status}</span></td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default AdminTickets;
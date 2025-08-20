import React, { useState } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

// The admin-specific routes are under the /admin path
const API_URL = 'http://localhost:3000/admin'; 

const UserTicketsViewer = () => {
    const [userId, setUserId] = useState('');
    const [tickets, setTickets] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [viewType, setViewType] = useState('');

    const fetchTickets = async (type) => {
        if (!userId) {
            setError('Please enter a User ID.');
            return;
        }

        setIsLoading(true);
        setError('');
        setTickets([]);
        setViewType(type);

        const endpoint = type === 'completed' 
            ? `/users/${userId}/completed-tickets` 
            : `/users/${userId}/notcompleted-tickets`;
        
        const token = localStorage.getItem('accessToken');
        try {
            const response = await axios.get(`${API_URL}${endpoint}`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data && response.data.length > 0) {
                 setTickets(response.data);
            } else {
                setError('No tickets found for this user.');
            }
        } catch (err) {
            setError(`Could not fetch ${type} tickets. Please check the User ID.`);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };


    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h2>User Ticket Viewer</h2>
                <Link to="/admin/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
            </header>

            <div className="ticket-search-container">
                <h3>Find User Tickets</h3>
                <div className="form-group">
                    <label>Enter User ID</label>
                    <input 
                        type="number" 
                        value={userId} 
                        onChange={(e) => setUserId(e.target.value)} 
                        placeholder="e.g., 7"
                    />
                </div>
                <div className="ticket-actions">
                    <button onClick={() => fetchTickets('completed')} className="btn">Fetch Completed Tickets</button>
                    <button onClick={() => fetchTickets('not-completed')} className="btn btn-secondary">Fetch Pending Tickets</button>
                </div>
            </div>

            {isLoading && <p>Loading...</p>}
            {error && <p className="error">{error}</p>}

            {tickets.length > 0 && (
                <div className="admin-table-container">
                    <h3>{viewType === 'completed' ? 'Completed Tickets' : 'Pending Tickets'} for User ID: {userId}</h3>
                    <table className="admin-table">
                        <thead>
                            <tr>
                                <th>Ticket ID</th>
                                <th>Route</th>
                                <th>Reservation Status</th>
                                <th>Payment Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {tickets.map(ticket => (
                                <tr key={ticket.id}>
                                    <td>{ticket.id}</td>
                                    <td>{ticket.province} to {ticket.province_2}</td>
                                    <td><span className={`status-${ticket.status.toLowerCase()}`}>{ticket.status}</span></td>
                                    {/* Make sure your sqlc struct has `payment_status` */}
                                    <td><span className={`status-${(ticket.payment_status || '').toLowerCase()}`}>{ticket.payment_status}</span></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
};

export default UserTicketsViewer;
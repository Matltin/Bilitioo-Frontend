import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';

const API_URL = 'http://localhost:3000';

const TicketDetails = () => {
    const [ticket, setTicket] = useState(null);
    const [error, setError] = useState('');
    const { ticketId } = useParams();
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTicketDetails = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const response = await axios.get(`${API_URL}/ticket-detail/${ticketId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setTicket(response.data);
            } catch (err) {
                setError('Could not fetch ticket details.');
            }
        };
        fetchTicketDetails();
    }, [ticketId]);

    if (error) {
        return <div className="container error">{error}</div>;
    }

    if (!ticket) {
        return <div className="container">Loading...</div>;
    }

    const handleBuy = async () => {
        try {
            const token = localStorage.getItem('accessToken');
            await axios.post(`${API_URL}/reservation`, { tickets: [ticket.id] }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            alert('Ticket reserved successfully!');
            navigate('/dashboard');
        } catch (err) {
            alert('Failed to reserve ticket.');
        }
    };

    return (
        <div className="ticket-details-container">
            <h2>Ticket Details</h2>
            <div className="ticket-details-card">
                <p><strong>From:</strong> {ticket.origin}</p>
                <p><strong>To:</strong> {ticket.destination}</p>
                <p><strong>Departure:</strong> {new Date(ticket.departureTime).toLocaleString()}</p>
                <p><strong>Arrival:</strong> {new Date(ticket.arrivalTime).toLocaleString()}</p>
                <p><strong>Price:</strong> {ticket.amount}</p>
                <p><strong>Vehicle:</strong> {ticket.vehicle_type}</p>
                <p><strong>Status:</strong> {ticket.status}</p>
                <div className="ticket-actions">
                    <button onClick={handleBuy} className="btn">Buy Now</button>
                    <button onClick={() => navigate(-1)} className="btn btn-secondary">Go Back</button>
                </div>
            </div>
        </div>
    );
};

export default TicketDetails;
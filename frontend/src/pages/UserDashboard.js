import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import SupportWidget from '../components/SupportWidget'; // 1. Import the SupportWidget component

// Define the base URL for your backend API
const API_URL = 'http://localhost:3000';

const UserDashboard = ({ onLogout }) => {
    const [tickets, setTickets] = useState([]);
    const [cities, setCities] = useState([]);
    const [searchParams, setSearchParams] = useState({
        origin_city_id: '',
        destination_city_id: '',
        departure_date: '',
        vehicle_type: 'BUS'
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        // This function fetches the list of cities for the search dropdowns
        const fetchCities = async () => {
            try {
                const token = localStorage.getItem('accessToken');
                const response = await axios.get(`${API_URL}/city`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setCities(response.data);
            } catch (err) {
                setError('Could not fetch cities.');
            }
        };
        fetchCities();
    }, []);

    const handleSearch = async (e) => {
        e.preventDefault();
        setError('');
        try {
            const token = localStorage.getItem('accessToken');
            const response = await axios.post(`${API_URL}/search-tickets`, searchParams, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setTickets(response.data);
        } catch (err) {
            setError('No tickets found for the selected route.');
            setTickets([]);
        }
    };

    // This function updates the state when a user types in the search form
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setSearchParams(prevState => ({
            ...prevState,
            [name]: (name === 'origin_city_id' || name === 'destination_city_id') ? Number(value) : value
        }));
    };

    // This function handles buying a single ticket
    const handleBuyTicket = async (ticketId) => {
        const token = localStorage.getItem('accessToken');
        try {
            // Call the POST /reservation endpoint
            await axios.post(`${API_URL}/reservation`,
                { tickets: [ticketId] }, // The API expects an array of ticket IDs
                { headers: { Authorization: `Bearer ${token}` } }
            );

            // On success, navigate to the new reservations page
            navigate('/reservations');

        } catch (err) {
            console.error("Failed to reserve ticket:", err);
            alert("Could not reserve the ticket. It may have already been booked.");
        }
    };


    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h2>User Dashboard</h2>
                <div>
                    {/* Navigation links */}
                    <Link to="/reports" className="nav-link">All Reports</Link>
                    <Link to="/reservations" className="nav-link">My Reservations</Link>
                    <Link to="/profile" className="profile-icon" title="My Profile">👤</Link>
                    <button onClick={onLogout} className="btn btn-logout">Logout</button>
                </div>
            </header>

            <div className="ticket-search-container">
                <h3>Find Your Ticket</h3>
                <form onSubmit={handleSearch} className="search-form">
                    <div className="form-row">
                        <select name="origin_city_id" value={searchParams.origin_city_id} onChange={handleInputChange} required>
                            <option value="">From</option>
                            {cities.map((city, index) => <option key={`origin-${index}`} value={index + 1}>{city.province}</option>)}
                        </select>
                        <select name="destination_city_id" value={searchParams.destination_city_id} onChange={handleInputChange} required>
                            <option value="">To</option>
                            {cities.map((city, index) => <option key={`dest-${index}`} value={index + 1}>{city.province}</option>)}
                        </select>
                        <input type="date" name="departure_date" value={searchParams.departure_date} onChange={handleInputChange} required />
                        <select name="vehicle_type" value={searchParams.vehicle_type} onChange={handleInputChange}>
                            <option value="BUS">Bus</option>
                            <option value="TRAIN">Train</option>
                            <option value="AIRPLANE">Airplane</option>
                        </select>
                    </div>
                    <button type="submit" className="btn">Search</button>
                </form>
            </div>

            {error && <p className="error">{error}</p>}

            <div className="ticket-results-container">
                {tickets.length > 0 && (
                    <div className="ticket-list">
                        {tickets.map(ticket => (
                            <div key={ticket.id} className="ticket-card">
                                <p><strong>From:</strong> {ticket.origin_province} <strong>To:</strong> {ticket.destination_province}</p>
                                <p><strong>Departure:</strong> {new Date(ticket.departure_time).toLocaleString()}</p>
                                <p><strong>Price:</strong> {ticket.amount}</p>
                                <div className="ticket-actions">
                                    <Link to={`/tickets/${ticket.id}`} className="btn btn-secondary">Details</Link>
                                    <button onClick={() => handleBuyTicket(ticket.id)} className="btn">Buy Ticket</button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            
            {/* 2. This line adds the floating support button and its modal to the page */}
            <SupportWidget />
        </div>
    );
};

export default UserDashboard;
import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
    return (
        <div className="home-container">
            <h1>Welcome to Bilitioo</h1>
            <p>Your one-stop solution for ticket reservations.</p>
            <div className="home-links">
                <Link to="/login" className="btn">Login</Link>
                <Link to="/register" className="btn btn-secondary">Register</Link>
            </div>
        </div>
    );
};

export default Home;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';

const API_URL = 'http://localhost:3000';

const AllReports = () => {
    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchReports = async () => {
            const token = localStorage.getItem('accessToken');
            try {
                const response = await axios.get(`${API_URL}/reports`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                setReports(response.data || []);
            } catch (error) {
                console.error("Failed to fetch reports", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchReports();
    }, []);

    if (isLoading) {
        return <div className="container">Loading reports...</div>;
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h2>All Support Reports</h2>
                <Link to="/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
            </header>
            <div className="reports-list">
                {reports.length > 0 ? (
                    reports.map(report => (
                        <div key={report.id} className="ticket-card">
                            <p><strong>Report ID:</strong> {report.id}</p>
                            <p><strong>Reservation ID:</strong> {report.reservation_id}</p>
                            <p><strong>Your Request:</strong> {report.request_text}</p>
                            <div className="report-response">
                                <strong>Admin Response:</strong>
                                <p>{report.response_text || 'Waiting for response...'}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <p>You have not submitted any reports.</p>
                )}
            </div>
        </div>
    );
};

export default AllReports;
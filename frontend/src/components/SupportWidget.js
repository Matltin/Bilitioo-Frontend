import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './SupportWidget.css';

const API_URL = 'http://localhost:3000';

const SupportWidget = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [latestReport, setLatestReport] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [showForm, setShowForm] = useState(false);

    // Form state
    const [reservationId, setReservationId] = useState('');
    const [requestType, setRequestType] = useState('ETC.');
    const [requestText, setRequestText] = useState('');
    const [message, setMessage] = useState('');

    const fetchLatestReport = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('accessToken');
        try {
            const response = await axios.get(`${API_URL}/reports`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (response.data && response.data.length > 0) {
                setLatestReport(response.data[0]);
                setShowForm(false); // Make sure to show the report first
            } else {
                setLatestReport(null);
                setShowForm(true); // If no reports exist, go directly to the form
            }
        } catch (error) {
            console.error("Failed to fetch reports", error);
            setShowForm(true); // If there's an error, still show the form
        } finally {
            setIsLoading(false);
        }
    };

    const handleSubmitReport = async (e) => {
        e.preventDefault();
        setMessage('');
        const token = localStorage.getItem('accessToken');
        try {
            await axios.post(`${API_URL}/report`, {
                reservation_id: Number(reservationId),
                request_type: requestType,
                request_text: requestText
            }, { headers: { Authorization: `Bearer ${token}` } });
            
            setMessage('Your report has been submitted successfully.');
            // After submitting, refresh the view to show the new "latest" report
            fetchLatestReport();

        } catch (error) {
            setMessage('Failed to submit report. Please check the Reservation ID.');
        }
    };
    
    const toggleWidget = () => {
        const nextIsOpen = !isOpen;
        setIsOpen(nextIsOpen);
        
        if (nextIsOpen) {
            fetchLatestReport(); // Fetch data only when opening
        } else {
            // Reset all states when closing
            setShowForm(false);
            setLatestReport(null);
            setMessage('');
        }
    };

    const renderContent = () => {
        if (isLoading) {
            return <p>Loading...</p>;
        }

        // Render the form if `showForm` is true
        if (showForm) {
            return (
                <form onSubmit={handleSubmitReport}>
                    <h4>Submit a New Report</h4>
                    {message && <p className={message.includes('successfully') ? 'success' : 'error'}>{message}</p>}
                    <div className="form-group">
                        <label>Reservation ID</label>
                        <input type="number" value={reservationId} onChange={e => setReservationId(e.target.value)} required />
                    </div>
                    <div className="form-group">
                        <label>Report Type</label>
                        <select value={requestType} onChange={e => setRequestType(e.target.value)}>
                            <option value="PAYMENT-ISSUE">Payment Issue</option>
                            <option value="TRAVEL-DELAY">Travel Delay</option>
                            <option value="UNEXPECTED-RESERVED">Unexpected Reservation</option>
                            <option value="ETC.">Other</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Details</label>
                        <textarea value={requestText} onChange={e => setRequestText(e.target.value)} required></textarea>
                    </div>
                    <button type="submit" className="btn">Submit</button>
                    {/* Allow going back only if there is a previous report to view */}
                    {latestReport && <button type="button" className="btn btn-secondary" style={{marginTop: "10px"}} onClick={() => setShowForm(false)}>Back</button>}
                </form>
            );
        }
        
        // Render the latest report if it exists
        if (latestReport) {
            return (
                <div className="report-view">
                    <h4>Your Latest Report</h4>
                    <p><strong>Your Request:</strong> {latestReport.request_text}</p>
                    <div className="report-response">
                        <strong>Admin Response:</strong>
                        <p>{latestReport.response_text || 'Waiting for response...'}</p>
                    </div>
                    <button className="btn" onClick={() => setShowForm(true)}>Create a New Report</button>
                </div>
            );
        }

        // Fallback content if something goes wrong
        return <p>Could not load support content.</p>;
    };

    return (
        <>
            <button className="support-fab" onClick={toggleWidget} title="Support">
                ?
            </button>

            {isOpen && (
                <div className="support-modal">
                    <div className="support-header">
                        <h3>Support Center</h3>
                        <button onClick={toggleWidget} className="close-btn">&times;</button>
                    </div>
                    <div className="support-content">
                        {renderContent()}
                    </div>
                </div>
            )}
        </>
    );
};

export default SupportWidget;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import AnswerReportModal from '../components/AnswerReportModal';
import ManageTicketModal from '../components/ManageTicketModal'; // 1. Import the new modal

const API_URL = 'http://localhost:3000/admin';

const AdminReports = () => {
    const [reports, setReports] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // State for the "Answer" modal
    const [isAnswerModalOpen, setIsAnswerModalOpen] = useState(false);
    // State for the "Manage Ticket" modal
    const [isManageModalOpen, setIsManageModalOpen] = useState(false);

    const [selectedReport, setSelectedReport] = useState(null);

    const fetchReports = async () => {
        setIsLoading(true);
        const token = localStorage.getItem('accessToken');
        try {
            const response = await axios.get(`${API_URL}/reports`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setReports(response.data || []);
        } catch (err) {
            setError('Could not fetch reports.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchReports();
    }, []);

    // --- Answer Modal Logic ---
    const handleOpenAnswerModal = (report) => {
        setSelectedReport(report);
        setIsAnswerModalOpen(true);
    };
    const handleCloseAnswerModal = () => {
        setSelectedReport(null);
        setIsAnswerModalOpen(false);
    };
    const handleAnswerSubmit = async (responseText) => {
        if (!selectedReport) return;
        const token = localStorage.getItem('accessToken');
        try {
            await axios.put(`${API_URL}/reports/answer`,
                { id: selectedReport.id, response_text: responseText },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            handleCloseAnswerModal();
            fetchReports();
        } catch (err) {
            alert('Failed to submit answer.');
        }
    };

    // --- Manage Ticket Modal Logic (NEW) ---
    const handleOpenManageModal = (report) => {
        setSelectedReport(report);
        setIsManageModalOpen(true);
    };
    const handleCloseManageModal = () => {
        setSelectedReport(null);
        setIsManageModalOpen(false);
    };
    const handleManageSubmit = async (reservationId, newStatus) => {
        const token = localStorage.getItem('accessToken');
        try {
            // This API call matches your `updateTicketByReport` function
            await axios.put(`${API_URL}/reports/manage`,
                { reserevation_id: reservationId, to_status_reservation: newStatus },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            handleCloseManageModal();
            fetchReports(); // Refresh data after update
        } catch (err) {
            alert('Failed to update ticket status.');
        }
    };

    if (isLoading) return <div className="container">Loading reports...</div>;
    if (error) return <div className="container error">{error}</div>;

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h2>Manage User Reports</h2>
                <Link to="/admin/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
            </header>
            <div className="admin-table-container">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>Report ID</th>
                            <th>User ID</th>
                            <th>Reservation ID</th>
                            <th>Request</th>
                            <th>Response</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {reports.map(report => (
                            <tr key={report.id}>
                                <td>{report.id}</td>
                                <td>{report.user_id}</td>
                                <td>{report.reservation_id}</td>
                                <td style={{ maxWidth: '300px' }}>{report.request_text}</td>
                                <td style={{ maxWidth: '300px' }}>{report.response_text || 'Not answered yet'}</td>
                                <td className="actions-cell">
                                    <button onClick={() => handleOpenAnswerModal(report)} className="btn btn-small">
                                        Answer
                                    </button>
                                    {/* 2. Add the "Manage Ticket" button */}
                                    <button onClick={() => handleOpenManageModal(report)} className="btn btn-small btn-secondary">
                                        Manage Ticket
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Render the Answer Modal */}
            {isAnswerModalOpen && (
                <AnswerReportModal
                    report={selectedReport}
                    onClose={handleCloseAnswerModal}
                    onSubmit={handleAnswerSubmit}
                />
            )}

            {/* 3. Render the new Manage Ticket Modal */}
            {isManageModalOpen && (
                <ManageTicketModal
                    report={selectedReport}
                    onClose={handleCloseManageModal}
                    onSubmit={handleManageSubmit}
                />
            )}
        </div>
    );
};

export default AdminReports;
import React, { useState } from 'react';
// We can reuse the same CSS as the AnswerReportModal for a consistent look
import './AnswerReportModal.css';

const ManageTicketModal = ({ report, onClose, onSubmit }) => {
    // The possible statuses an admin can set
    const [newStatus, setNewStatus] = useState('RESERVED');

    const handleSubmit = () => {
        // We pass the reservation ID and the selected new status to the parent component
        onSubmit(report.reservation_id, newStatus);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Manage Reservation #{report.reservation_id}</h2>
                <div className="report-details">
                    <p><strong>Current Status:</strong> [You'll need to add this to your API response]</p>
                    <p><strong>User's Request:</strong></p>
                    <p className="user-request">{report.request_text}</p>
                </div>
                <div className="form-group">
                    <label>Set New Reservation Status:</label>
                    <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)}>
                        <option value="RESERVED">RESERVED</option>
                        <option value="RESERVING">RESERVING</option>
                        <option value="CANCELED">CANCELED</option>
                        <option value="CANCELED-BY-TIME">CANCELED-BY-TIME</option>
                    </select>
                </div>
                <div className="modal-actions">
                    <button onClick={onClose} className="btn btn-secondary">Cancel</button>
                    <button onClick={handleSubmit} className="btn">Confirm Status Change</button>
                </div>
            </div>
        </div>
    );
};

export default ManageTicketModal;
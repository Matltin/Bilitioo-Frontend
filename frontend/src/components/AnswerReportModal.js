import React, { useState } from 'react';
import './AnswerReportModal.css';

const AnswerReportModal = ({ report, onClose, onSubmit }) => {
    const [responseText, setResponseText] = useState('');

    const handleSubmit = () => {
        if (responseText.trim()) {
            onSubmit(responseText);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Respond to Report #{report.id}</h2>
                <div className="report-details">
                    <p><strong>User's Request:</strong></p>
                    <p className="user-request">{report.request_text}</p>
                </div>
                <div className="form-group">
                    <label>Your Response:</label>
                    <textarea
                        rows="4"
                        value={responseText}
                        onChange={(e) => setResponseText(e.target.value)}
                        placeholder="Type your response here..."
                    ></textarea>
                </div>
                <div className="modal-actions">
                    <button onClick={onClose} className="btn btn-secondary">Cancel</button>
                    <button onClick={handleSubmit} className="btn">Submit Answer</button>
                </div>
            </div>
        </div>
    );
};

export default AnswerReportModal;
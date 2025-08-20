import React from 'react';
import './CancelModal.css'; // We will create this CSS file next

const CancelModal = ({ penaltyInfo, onClose, onConfirm }) => {
    if (!penaltyInfo) {
        return null;
    }

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Confirm Cancellation</h2>
                
                <div className="penalty-details">
                    <p>You are about to cancel this reservation. Please review the penalty details below:</p>
                    {/* The penalty_text from your backend will be displayed here */}
                    <p className="penalty-text"><strong>Policy:</strong> {penaltyInfo.penalty_text}</p>
                    <ul>
                        <li>Cancellation before 1 hour of departure: <strong>{penaltyInfo.befor_day}% penalty</strong></li>
                        <li>Cancellation within 1 hour of departure: <strong>{penaltyInfo.after_day}% penalty</strong></li>
                    </ul>
                </div>

                <p className="confirmation-message">Are you sure you want to proceed?</p>

                <div className="modal-actions">
                    <button onClick={onClose} className="btn btn-secondary">Go Back</button>
                    <button onClick={onConfirm} className="btn btn-logout">Yes, Cancel</button>
                </div>
            </div>
        </div>
    );
};

export default CancelModal;
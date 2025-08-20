import React, { useState } from 'react';
import './PaymentModal.css'; // We will create this CSS file next

const PaymentModal = ({ reservation, walletBalance, onClose, onConfirm }) => {
    // State to keep track of the selected payment method
    const [paymentType, setPaymentType] = useState('WALLET');

    if (!reservation) {
        return null;
    }

    const handleConfirm = () => {
        onConfirm(paymentType);
    };

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Complete Your Payment</h2>

                <div className="payment-details">
                    <p><strong>Reservation ID:</strong> {reservation.id}</p>
                    <p><strong>Total Amount:</strong> {reservation.amount}</p>
                    <p><strong>Your Wallet Balance:</strong> {walletBalance}</p>
                </div>

                <div className="payment-options">
                    <label>Select Payment Method:</label>
                    <select value={paymentType} onChange={(e) => setPaymentType(e.target.value)}>
                        <option value="WALLET">WALLET</option>
                        <option value="CREDIT_CARD">CREDIT_CARD</option>
                        <option value="BANK_TRANSFER">BANK_TRANSFER</option>
                        <option value="CRYPTO">CRYPTO</option>
                        <option value="CASH">CASH</option>
                    </select>
                </div>

                {paymentType === 'WALLET' && walletBalance < reservation.amount && (
                    <p className="error">Your wallet balance is not sufficient.</p>
                )}

                <div className="modal-actions">
                    <button onClick={onClose} className="btn btn-secondary">Cancel</button>
                    <button
                        onClick={handleConfirm}
                        className="btn"
                        // Disable button if wallet balance is insufficient
                        disabled={paymentType === 'WALLET' && walletBalance < reservation.amount}
                    >
                        Confirm Payment
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
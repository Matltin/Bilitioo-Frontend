import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import PaymentModal from '../components/PaymentModal';
import CancelModal from '../components/CancelModal'; // Import the new cancel modal

const API_URL = 'http://localhost:3000';

const MyReservations = () => {
    const [reservations, setReservations] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');

    // State for Payment Modal
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [walletBalance, setWalletBalance] = useState(0);

    // State for Cancellation Modal
    const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
    const [penaltyInfo, setPenaltyInfo] = useState(null);

    // This function fetches all necessary data from the backend
    const fetchData = async () => {
        const token = localStorage.getItem('accessToken');
        setIsLoading(true);
        try {
            const [resResponse, profileResponse] = await Promise.all([
                axios.get(`${API_URL}/allReservation`, { headers: { Authorization: `Bearer ${token}` } }),
                axios.get(`${API_URL}/profile`, { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setReservations(resResponse.data || []);
            setWalletBalance(profileResponse.data.wallet);
        } catch (err) {
            setError('Could not fetch data.');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // --- Payment Modal Logic ---
    const handleOpenPaymentModal = (reservation) => {
        setSelectedReservation(reservation);
        setIsPaymentModalOpen(true);
    };
    const handleClosePaymentModal = () => {
        setIsPaymentModalOpen(false);
        setSelectedReservation(null);
    };
    const handleConfirmPayment = async (paymentType) => {
        if (!selectedReservation) return;
        const token = localStorage.getItem('accessToken');
        try {
            await axios.post(`${API_URL}/payment`, {
                payment_id: selectedReservation.payment_id,
                type: paymentType,
                payment_status: "COMPLETED",
                reservation_status: "RESERVED"
            }, { headers: { Authorization: `Bearer ${token}` } });
            handleClosePaymentModal();
            fetchData();
        } catch (err) {
            alert("Payment failed. Please try again.");
        }
    };

    // --- Cancellation Modal Logic ---
    const handleOpenCancelModal = async (reservation) => {
        const token = localStorage.getItem('accessToken');
        try {
            // Note: Your backend route for penalties uses the ticket_id
            const response = await axios.get(`${API_URL}/ticket-penalties/${reservation.ticket_id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setPenaltyInfo(response.data);
            setSelectedReservation(reservation);
            setIsCancelModalOpen(true);
        } catch (err) {
            alert("Could not fetch penalty information.");
        }
    };
    const handleCloseCancelModal = () => {
        setIsCancelModalOpen(false);
        setSelectedReservation(null);
        setPenaltyInfo(null);
    };
    const handleConfirmCancel = async () => {
        if (!selectedReservation) return;
        const token = localStorage.getItem('accessToken');
        try {
            // Your backend route for cancelling is PUT /penalty/:ticket_id
            await axios.put(`${API_URL}/penalty/${selectedReservation.ticket_id}`, {}, {
                headers: { Authorization: `Bearer ${token}` }
            });
            handleCloseCancelModal();
            fetchData(); // Refresh data to show updated status
        } catch (err) {
            alert("Failed to cancel reservation.");
        }
    };

    if (isLoading) return <div className="container">Loading...</div>;
    if (error) return <div className="container error">{error}</div>;

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h2>My Reservations</h2>
                <Link to="/dashboard" className="btn btn-secondary">Back to Dashboard</Link>
            </header>

            <div className="reservations-list">
                {reservations.length > 0 ? (
                    reservations.map(res => (
                        <div key={res.id} className="ticket-card">
                            <p><strong>Reservation ID:</strong> {res.id}</p>
                            <p><strong>Amount:</strong> {res.amount}</p>
                            <p><strong>Status:</strong> <span className={`status-${res.status.toLowerCase()}`}>{res.status}</span></p>

                            <div className="ticket-actions">
                                {res.status === 'RESERVING' && (
                                    <button onClick={() => handleOpenPaymentModal(res)} className="btn">
                                        Pay Now
                                    </button>
                                )}
                                {res.status === 'RESERVED' && (
                                    <button onClick={() => handleOpenCancelModal(res)} className="btn btn-logout">
                                        Cancel Reservation
                                    </button>
                                )}
                            </div>
                        </div>
                    ))
                ) : (
                    <p>You have no reservations.</p>
                )}
            </div>

            {isPaymentModalOpen && (
                <PaymentModal
                    reservation={selectedReservation}
                    walletBalance={walletBalance}
                    onClose={handleClosePaymentModal}
                    onConfirm={handleConfirmPayment}
                />
            )}

            {isCancelModalOpen && (
                <CancelModal
                    penaltyInfo={penaltyInfo}
                    onClose={handleCloseCancelModal}
                    onConfirm={handleConfirmCancel}
                />
            )}
        </div>
    );
};

export default MyReservations;
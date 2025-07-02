import React, { useState } from 'react';

const RedeemLoyaltyPoints = ({ setMessage, refreshDashboard, message }) => {
    // State for redemption form
    const [redemptionForm, setRedemptionForm] = useState({
        customerId: null,
        redemptionAmount: null,
    });

    // Handle redeem loyalty points
    const handleRedeemLoyaltyPoints = async (e) => {
        e.preventDefault();
        try {
            const response = await fetch('/api/loyaltypoints/redeem', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(redemptionForm),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'An error occurred while redeeming loyalty points.');
            }

            setMessage(data.message || 'Redemption successful.');
            refreshDashboard(); // Refresh dashboard metrics
        } catch (error) {
            console.error('Error redeeming loyalty points:', error);
            setMessage(error.message || 'An error occurred while redeeming loyalty points.');
        }
    };

    return (
        <div>
            <h4>Redeem Loyalty Points</h4>
            {message && <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-danger'} mb-3`}>{message}</div>}
            <form onSubmit={handleRedeemLoyaltyPoints}>
                {/* Customer ID Field */}
                <div className="mb-3">
                    <label htmlFor="customerId" className="form-label">
                        Customer ID
                    </label>
                    <input
                        type="number"
                        className="form-control"
                        id="customerId"
                        name="customerId"
                        value={redemptionForm.customerId || ''}
                        onChange={(e) =>
                            setRedemptionForm({
                                ...redemptionForm,
                                customerId: e.target.value ? parseInt(e.target.value, 10) : null,
                            })
                        }
                        required
                    />
                </div>
                {/* Redemption Amount Field */}
                <div className="mb-3">
                    <label htmlFor="redemptionAmount" className="form-label">
                        Redemption Amount
                    </label>
                    <input
                        type="number"
                        className="form-control"
                        id="redemptionAmount"
                        name="redemptionAmount"
                        value={redemptionForm.redemptionAmount || ''}
                        onChange={(e) =>
                            setRedemptionForm({
                                ...redemptionForm,
                                redemptionAmount: e.target.value ? parseInt(e.target.value, 10) : null,
                            })
                        }
                        required
                    />
                </div>
                {/* Buttons */}
                <button type="submit" className="btn btn-primary me-2">
                    Redeem Points
                </button>
                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                        setRedemptionForm({ customerId: null, redemptionAmount: null });
                        setMessage('');
                    }}
                >
                    Clear
                </button>
            </form>
        </div>
    );
};

export default RedeemLoyaltyPoints;
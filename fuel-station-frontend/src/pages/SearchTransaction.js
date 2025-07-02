import React, { useState } from 'react';
import { getTransactionById, deleteTransaction } from '../services/api';
import { convertUtcToIst } from './utils';
import CustomModal from '../components/CustomModal';

const SearchTransaction = ({ refreshDashboard }) => {
    const [transactionId, setTransactionId] = useState(''); // Tracks the transaction ID entered by the user
    const [transactionDetails, setTransactionDetails] = useState(null); // Stores the fetched transaction details
    const [message, setMessage] = useState(''); // Stores any messages for the user

    // State for deleting a transaction
    const [deleteModalData, setDeleteModalData] = useState({
        show: false,
        transactionId: null,
    });

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault(); // Prevent form submission

        try {
            setMessage(''); // Clear any previous messages
            const response = await getTransactionById(transactionId); // Fetch transaction details

            if (response) {
                setTransactionDetails(response); // Update the state with the fetched transaction details
            }
        } catch (error) {
            console.error('Error fetching transaction:', error);

            if (error.response && error.response.status === 404) {
                setMessage('Transaction not found.');
            } else {
                setMessage('An unexpected error occurred while fetching the transaction.');
            }
        }
    };

    // Handle transaction deletion
    const handleDeleteTransaction = async () => {
        const { transactionId } = deleteModalData;

        try {
            setMessage(''); // Clear any previous messages
            await deleteTransaction(transactionId); 

            setMessage('Transaction deleted successfully.');
            setTransactionDetails(null); // Clear transaction details
            setTransactionId(''); // Clear the transaction ID field

            // Refresh the dashboard data
            await refreshDashboard();
        } catch (error) {
            console.error('Error deleting transaction:', error);

            if (error.response && error.response.status === 404) {
                setMessage('Transaction not found.');
            } else {
                setMessage('An unexpected error occurred while deleting the transaction.');
            }
        } finally {
            // Hide the modal after deletion
            setDeleteModalData({ show: false, transactionId: null });
        }
    };

    return (
        <div>
            <h4>Search Transaction</h4>
            {message && <div className="alert alert-info mb-3">{message}</div>}
            <form onSubmit={handleSubmit}>
                {/* Transaction ID Field */}
                <div className="mb-3">
                    <label htmlFor="transactionId" className="form-label">
                        Transaction ID
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        id="transactionId"
                        name="transactionId"
                        value={transactionId}
                        onChange={(e) => setTransactionId(e.target.value)}
                        required
                    />
                </div>
                {/* Submit Button */}
                <button type="submit" className="btn btn-primary me-2">
                    Search
                </button>
                {/* Clear Button */}
                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                        setTransactionId('');
                        setTransactionDetails(null);
                        setMessage('');
                    }}
                >
                    Clear
                </button>
            </form>
            {/* Display Transaction Details */}
            {transactionDetails && (
                <div className="mt-4">
                    <h5>Transaction Details</h5>
                    <table className="table table-bordered">
                        <tbody>
                            <tr>
                                <th>ID</th>
                                <td>{transactionDetails.id}</td>
                            </tr>
                            <tr>
                                <th>Customer ID</th>
                                <td>{transactionDetails.customerId}</td>
                            </tr>
                            <tr>
                                <th>Amount</th>
                                <td>{transactionDetails.amount}</td>
                            </tr>
                            <tr>
                                <th>Loyalty Points Earned</th>
                                <td>{transactionDetails.loyaltyPointsEarned}</td>
                            </tr>
                            <tr>
                                <th>Date (DD/MM/YY)</th>
                                <td>{convertUtcToIst(transactionDetails.date)}</td>
                            </tr>
                        </tbody>
                    </table>
                    {/* Delete Transaction Button */}
                    <button
                        className="btn btn-danger btn-sm"
                        onClick={() =>
                            setDeleteModalData({
                                show: true,
                                transactionId: transactionDetails.id, // Use transactionDetails.id here
                            })
                        }
                    >
                        Delete This Transaction
                    </button>
                </div>
            )}
            {/* Custom Modal for Delete Confirmation */}
            <CustomModal
                show={deleteModalData.show}
                onClose={() => setDeleteModalData({ show: false, transactionId: null })}
                title="Confirm Deletion"
                message="Are you sure you want to delete this transaction? This action cannot be undone."
                variant="danger"
                onConfirm={handleDeleteTransaction}
            />
        </div>
    );
};

export default SearchTransaction;
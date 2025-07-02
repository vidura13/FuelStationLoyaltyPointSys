// ViewCustomerTransactions.js
import React, { useState } from 'react';
import { getTransactionsByCustomer, deleteTransaction } from '../services/api';
import { convertUtcToIst } from './utils';
import CustomModal from '../components/CustomModal';


const ViewCustomerTransactions = ({ setMessage, refreshDashboard, message }) => {
    // State for query parameters
    const [customerTransactionQuery, setCustomerTransactionQuery] = useState({
        customerId: null,
        startDate: null,
        endDate: null,
        sortField: null,
        sortOrder: 'asc',
    });

    // State for storing the fetched customer transactions
    const [customerTransactions, setCustomerTransactions] = useState([]);

    // State for deleting customer transactions
    const [deleteModalData, setDeleteModalData] = useState({
        show: false,
        transactionId: null,
    });

    // Function to handle form submission and fetch customer transactions
    const handleViewCustomerTransactions = async (e) => {
        e.preventDefault();

        if (!customerTransactionQuery.customerId) {
            setMessage('Please enter a valid Customer ID.');
            return;
        }

        try {
            const response = await getTransactionsByCustomer(customerTransactionQuery);

            const { data } = response.data;

            if (!Array.isArray(data)) {
                throw new Error('Invalid response from the server');
            }

            if (data.length === 0) {
                setMessage('No transactions found for this customer.');
                setCustomerTransactions([]);
                return;
            }

            setCustomerTransactions(data);
            setMessage(`Successfully found ${data.length} transaction(s) for the customer.`);
        } catch (error) {
            console.error('Error fetching customer transactions:', error);

            if (error.response) {
                const { status, data: responseData } = error.response;

                if (status === 404) {
                    if (responseData.message === 'Customer ID is invalid or does not exist.') {
                        setMessage('Invalid Customer ID. Please check your input and try again.');
                    } else if (responseData.message === 'No transactions found for this customer.') {
                        setMessage('No transactions found for this customer.');
                    } else {
                        setMessage('Failed to find data. Please check your inputs and try again.');
                    }
                } else {
                    setMessage('An unexpected error occurred. Please try again later.');
                }
            } else {
                setMessage('A network error occurred. Please try again.');
            }
        }
    };

    // Function to handle deleting a transaction
    const handleDeleteTransaction = async () => {
        const { transactionId } = deleteModalData;

        try {
            await deleteTransaction(transactionId);
            setMessage('Transaction deleted successfully.');

            // Remove the deleted transaction from the list
            setCustomerTransactions((prevTransactions) =>
                prevTransactions.filter((transaction) => transaction.id !== transactionId)
            );

            // Refresh the dashboard data
            await refreshDashboard();
        } catch (error) {
            console.error('Error deleting transaction:', error);

            if (error.response) {
                console.error('Backend Response Data:', error.response.data);
                console.error('Backend Status Code:', error.response.status);
            } else {
                console.error('Network or other error:', error.message);
            }

            setMessage('An error occurred while deleting the transaction.');
        } finally {
            // Hide the modal after deletion
            setDeleteModalData({ show: false, transactionId: null });
        }
    };

    return (
        <div>
            <h4>View Customer Transactions</h4>
            {message && <div className="alert alert-info mb-3">{message}</div>}
            <form onSubmit={handleViewCustomerTransactions}>
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
                        value={customerTransactionQuery.customerId || ''}
                        onChange={(e) =>
                            setCustomerTransactionQuery({
                                ...customerTransactionQuery,
                                customerId: e.target.value ? parseInt(e.target.value, 10) : null,
                            })
                        }
                        required
                    />
                </div>
                {/* Optional Date Filters */}
                <div className="row mb-3">
                    <div className="col-md-6">
                        <label htmlFor="startDate" className="form-label">
                            Start Date (Optional)
                        </label>
                        <input
                            type="date"
                            className="form-control"
                            id="startDate"
                            name="startDate"
                            value={customerTransactionQuery.startDate || ''}
                            onChange={(e) =>
                                setCustomerTransactionQuery({
                                    ...customerTransactionQuery,
                                    startDate: e.target.value || null,
                                })
                            }
                        />
                    </div>
                    <div className="col-md-6">
                        <label htmlFor="endDate" className="form-label">
                            End Date (Optional)
                        </label>
                        <input
                            type="date"
                            className="form-control"
                            id="endDate"
                            name="endDate"
                            value={customerTransactionQuery.endDate || ''}
                            onChange={(e) =>
                                setCustomerTransactionQuery({
                                    ...customerTransactionQuery,
                                    endDate: e.target.value || null,
                                })
                            }
                        />
                    </div>
                </div>
                {/* Sorting Options */}
                <div className="mb-3">
                    <label htmlFor="sortField" className="form-label">
                        Sort By (Optional)
                    </label>
                    <select
                        className="form-select"
                        id="sortField"
                        name="sortField"
                        value={customerTransactionQuery.sortField || ''}
                        onChange={(e) =>
                            setCustomerTransactionQuery({
                                ...customerTransactionQuery,
                                sortField: e.target.value || null,
                            })
                        }
                    >
                        <option value="">None</option>
                        <option value="date">Date</option>
                        <option value="amount">Amount</option>
                    </select>
                </div>
                <div className="mb-3">
                    <label htmlFor="sortOrder" className="form-label">
                        Sort Order (Optional)
                    </label>
                    <select
                        className="form-select"
                        id="sortOrder"
                        name="sortOrder"
                        value={customerTransactionQuery.sortOrder || 'asc'}
                        onChange={(e) =>
                            setCustomerTransactionQuery({
                                ...customerTransactionQuery,
                                sortOrder: e.target.value || 'asc',
                            })
                        }
                    >
                        <option value="asc">Ascending</option>
                        <option value="desc">Descending</option>
                    </select>
                </div>
                {/* Buttons */}
                <button type="submit" className="btn btn-primary me-2">
                    View Transactions / Refresh
                </button>
                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                        setCustomerTransactionQuery({
                            customerId: null,
                            startDate: null,
                            endDate: null,
                            sortField: null,
                            sortOrder: 'asc',
                        });
                        setCustomerTransactions([]);
                        setMessage(''); // Clear any previous messages
                    }}
                >
                    Clear
                </button>
            </form>
            {/* Display Transactions in a Table */}
            {customerTransactions.length > 0 && (
                <div className="mt-4">
                    <h5>Customer Transactions</h5>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Transaction ID</th>
                                <th>Customer Name</th>
                                <th>Amount</th>
                                <th>Loyalty Points Earned</th>
                                <th>Date</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {customerTransactions.map((transaction) => (
                                <tr key={transaction.id}>
                                    <td>{transaction.id}</td>
                                    <td>{transaction.customerName}</td>
                                    <td>{transaction.amount}</td>
                                    <td>{transaction.loyaltyPointsEarned}</td>
                                    <td>{convertUtcToIst(transaction.date)}</td>
                                    <td>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() =>
                                                setDeleteModalData({
                                                    show: true,
                                                    transactionId: transaction.id,
                                                })
                                            }
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
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

export default ViewCustomerTransactions;
import React, { useState } from 'react';
import { addTransaction } from '../services/api';

const AddTransaction = ({ setMessage, refreshDashboard }) => {
    // State for form inputs
    const [transactionForm, setTransactionForm] = useState({
        customerId: '',
        amount: '',
    });

    // Handle input changes
    const handleTransactionInputChange = (e) => {
        const { name, value } = e.target;
        setTransactionForm({ ...transactionForm, [name]: value });
    };

    // Handle form submission
    const handleTransactionSubmit = async (e) => {
        e.preventDefault();

        try {
            // Call the API to add a new transaction
            const response = await addTransaction(transactionForm);

            if (!response || !response.data || !response.data.id) {
                throw new Error('Invalid response from the server');
            }

            const transactionId = response.data.id;

            // Reset form fields
            setTransactionForm({ customerId: '', amount: '' });

            // Set success message
            setMessage(`Transaction added successfully! Transaction ID: ${transactionId}`);

            // Refresh dashboard data
            await refreshDashboard();
        } catch (error) {
            console.error('Error adding transaction:', error);

            if (error.response) {
                console.error('Backend Response Data:', error.response.data);
                console.error('Backend Status Code:', error.response.status);
            } else {
                console.error('Network or other error:', error.message);
            }

            setMessage('An error occurred while adding the transaction.');
        }
    };

    return (
        <div>d:
            <h4>Add Transaction</h4>
            <form onSubmit={handleTransactionSubmit}>
                <div className="mb-3">
                    <label htmlFor="customerId" className="form-label">
                        Customer ID
                    </label>
                    <input
                        type="number"
                        className="form-control"
                        id="customerId"
                        name="customerId"
                        value={transactionForm.customerId}
                        onChange={handleTransactionInputChange}
                        required
                    />
                </div>
                <div className="mb-3">
                    <label htmlFor="amount" className="form-label">
                        Transaction Amount
                    </label>
                    <input
                        type="number"
                        className="form-control"
                        id="amount"
                        name="amount"
                        value={transactionForm.amount}
                        onChange={handleTransactionInputChange}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary">
                    Submit
                </button>
            </form>
        </div>
    );
};

export default AddTransaction;
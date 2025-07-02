import React, { useState } from 'react';
import { createCustomer } from '../services/api';

const AddNewCustomer = ({ setMessage, refreshDashboard }) => {
    // State for form inputs
    const [customerForm, setCustomerForm] = useState({
        name: '',
        phoneNumber: '',
        email: '',
        nic: '',
    });

    // Handle input changes
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setCustomerForm({ ...customerForm, [name]: value });
    };

    // Handle form submission
    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate NIC length on the frontend
        if (customerForm.nic.length !== 12) {
            setMessage('NIC must be exactly 12 characters long.');
            return;
        }

        try {
            // Call the API to create a new customer
            const response = await createCustomer(customerForm);
            const customerId = response.data.id;

            // Reset form fields
            setCustomerForm({ name: '', phoneNumber: '', email: '', nic: '' });

            // Set success message
            setMessage(`Customer added successfully! Customer ID: ${customerId}`);

            // Refresh the dashboard data
            await refreshDashboard();
        } catch (error) {
            console.error('Error adding customer:', error);

            if (error.response) {
                console.error('Backend Response Data:', error.response.data);
                console.error('Backend Status Code:', error.response.status);
                setMessage(error.response.data); // Display backend validation errors
            } else {
                console.error('Network or other error:', error.message);
                setMessage('An error occurred while adding the customer.');
            }
        }
    };

    return (
        <div>
            <h4>Add Customer</h4>
            <form onSubmit={handleSubmit}>
                {/* Name Field */}
                <div className="mb-3">
                    <label htmlFor="name" className="form-label">
                        Name
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        id="name"
                        name="name"
                        value={customerForm.name}
                        onChange={handleInputChange}
                        required
                    />
                </div>

                {/* Phone Number Field */}
                <div className="mb-3">
                    <label htmlFor="phoneNumber" className="form-label">
                        Phone Number
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        id="phoneNumber"
                        name="phoneNumber"
                        value={customerForm.phoneNumber}
                        onChange={handleInputChange}
                    />
                </div>

                {/* Email Field */}
                <div className="mb-3">
                    <label htmlFor="email" className="form-label">
                        Email
                    </label>
                    <input
                        type="email"
                        className="form-control"
                        id="email"
                        name="email"
                        value={customerForm.email}
                        onChange={handleInputChange}
                    />
                </div>

                {/* NIC Field */}
                <div className="mb-3">
                    <label htmlFor="nic" className="form-label">
                        NIC (12 characters)
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        id="nic"
                        name="nic"
                        value={customerForm.nic}
                        onChange={handleInputChange}
                        maxLength={12} // Restrict input length
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

export default AddNewCustomer;
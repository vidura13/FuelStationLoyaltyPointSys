// SearchCustomer.js
import React, { useState } from 'react';
import { searchCustomers, deleteCustomer, updateCustomer } from '../services/api';
import CustomModal from '../components/CustomModal';

const SearchCustomer = ({ setMessage, refreshDashboard, message }) => {
    // State for search query and results
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);

    // State for deleting customer transactions
    const [deleteModalData, setDeleteModalData] = useState({
        show: false,
        customerId: null,
    });

    // State for editing a customer
    const [editingCustomer, setEditingCustomer] = useState(null);
    const [editForm, setEditForm] = useState({
        name: '',
        phone: '',
        email: '',
    });

    // Handle search customer
    const handleSearchCustomer = async (e) => {
        e.preventDefault();
        try {
            const response = await searchCustomers(searchQuery);
            console.log('Backend Response Data:', response.data); // Debugging log

            setSearchResults(response.data); // Use the backend response directly
            setMessage('Search completed successfully.');
        } catch (error) {
            console.error('Error searching customers:', error);
            if (error.response) {
                console.error('Backend Response Data:', error.response.data);
                console.error('Backend Status Code:', error.response.status);
            } else {
                console.error('Network or other error:', error.message);
            }
            setMessage('An error occurred while searching for customers.');
        }
    };

    // Handle delete customer
    const handleDeleteCustomer = async () => {
        const { customerId } = deleteModalData;

        try {
            await deleteCustomer(customerId); // Call the API to delete the customer
            setMessage('Customer deleted successfully.');

            // Remove the deleted customer from search results
            setSearchResults((prevResults) =>
                prevResults.filter((customer) => customer.id !== customerId)
            );

            // Refresh the dashboard data
            await refreshDashboard();
        } catch (error) {
            console.error('Error deleting customer:', error);

            if (error.response) {
                console.error('Backend Response Data:', error.response.data);
                console.error('Backend Status Code:', error.response.status);
            } else {
                console.error('Network or other error:', error.message);
            }

            setMessage('An error occurred while deleting the customer.');
        } finally {
            // Hide the modal after deletion
            setDeleteModalData({ show: false, customerId: null });
        }
    };

    // Handle edit customer
    const handleEditCustomer = (customer) => {
        setEditingCustomer(customer);
        setEditForm({
            name: customer.name,
            phone: customer.phone,
            email: customer.email,
        });
    };

    // Handle update customer
    const handleUpdateCustomer = async (e) => {
        e.preventDefault();

        try {
            // Call the API to update the customer
            await updateCustomer(editingCustomer.id, editForm);
            setMessage('Customer updated successfully.');

            // Update the customer in search results
            setSearchResults((prevResults) =>
                prevResults.map((customer) =>
                    customer.id === editingCustomer.id
                        ? { ...customer, name: editForm.name, phone: editForm.phone, email: editForm.email }
                        : customer
                )
            );

            // Close the edit form
            setEditingCustomer(null);
            setMessage('Customer updated successfully.');
        } catch (error) {
            console.error('Error updating customer:', error);
            setMessage('An error occurred while updating the customer.');
            if (error.response) {
                console.error('Backend Response Data:', error.response.data);
                console.error('Backend Status Code:', error.response.status);
                setMessage(error.response.data); // Display backend validation errors
            } else {
                console.error('Network or other error:', error.message);
                setMessage('An error occurred while updating the customer.');
            }
        }
    };


    return (
        <div>
            <h4>Search Customer</h4>
            <form onSubmit={handleSearchCustomer}>
                <div className="mb-3">
                    <label htmlFor="searchName" className="form-label">
                        Customer Name
                    </label>
                    <input
                        type="text"
                        className="form-control"
                        id="searchName"
                        name="searchName"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        required
                    />
                </div>
                <button type="submit" className="btn btn-primary me-2">
                    Search
                </button>
                <button
                    type="button"
                    className="btn btn-secondary"
                    onClick={() => {
                        setSearchQuery('');
                        setSearchResults([]);
                    }}
                >
                    Clear
                </button>
            </form>

            {/* Display Search Results */}
            {searchResults.length > 0 && (
                <div className="mt-4">
                    <h5>Search Results</h5>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Customer ID</th>
                                <th>Name</th>
                                <th>NIC</th>
                                <th>Phone</th>
                                <th>Email</th>
                                <th>Total Non Expired Points</th>
                                <th>Total Expired Points</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {searchResults.map((customer) => (
                                <tr key={customer.id}>
                                    <td>{customer.id}</td>
                                    <td>{customer.name}</td>
                                    <td>{customer.nic || 'N/A'}</td>
                                    <td>{customer.phone}</td>
                                    <td>{customer.email}</td>
                                    <td>{customer.totalNonExpiredPoints}</td>
                                    <td>{customer.totalExpiredPoints}</td>
                                    <td>
                                        <button
                                            className="btn btn-primary btn-sm me-2"
                                            onClick={() => handleEditCustomer(customer)}
                                        >
                                            Edit
                                        </button>
                                        <button
                                            className="btn btn-danger btn-sm"
                                            onClick={() =>
                                                setDeleteModalData({
                                                    show: true,
                                                    customerId: customer.id,
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

            {/* Edit Customer Form */}
            {editingCustomer && (
                <div className="mt-4">
                    <h4>Edit Customer</h4>
                    {message && <div className="alert alert-danger mb-3">{message}</div>}
                    <form onSubmit={handleUpdateCustomer}>
                        <div className="mb-3">
                            <label htmlFor="editName" className="form-label">
                                Name
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                id="editName"
                                name="name"
                                value={editForm.name}
                                onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                                required
                            />
                        </div>

                        <div className="mb-3">
                            <label htmlFor="editPhone" className="form-label">
                                Phone Number
                            </label>
                            <input
                                type="text"
                                className="form-control"
                                id="editPhone"
                                name="phone"
                                value={editForm.phone}
                                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                            />
                        </div>
                        <div className="mb-3">
                            <label htmlFor="editEmail" className="form-label">
                                Email
                            </label>
                            <input
                                type="email"
                                className="form-control"
                                id="editEmail"
                                name="email"
                                value={editForm.email}
                                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
                            />
                        </div>
                        <button type="submit" className="btn btn-primary me-2">
                            Save Changes
                        </button>
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={() => setEditingCustomer(null)}
                        >
                            Cancel
                        </button>
                    </form>
                </div>
            )}

            {/* Custom Modal for Delete Confirmation */}
            <CustomModal
                show={deleteModalData.show}
                onClose={() => setDeleteModalData({ show: false, customerId: null })}
                title="Confirm Deletion"
                message="Are you sure you want to delete this customer? This action cannot be undone."
                variant="danger"
                onConfirm={handleDeleteCustomer}
            />
        </div>
    );
};

export default SearchCustomer;
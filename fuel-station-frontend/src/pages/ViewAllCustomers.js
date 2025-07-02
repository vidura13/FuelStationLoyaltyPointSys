// ViewAllCustomers.js
import React, { useState, useEffect } from 'react';
import { getAllCustomers, deleteCustomer } from '../services/api';
import CustomModal from '../components/CustomModal';

const ViewAllCustomers = ({ setMessage, refreshDashboard, message }) => {
    // State to store all customers
    const [allCustomers, setAllCustomers] = useState([]);

    // State for sorting
    const [sortField, setSortField] = useState(''); // Default sort field
    const [sortOrder, setSortOrder] = useState('asc'); // Default sort order

    const [deleteModalData, setDeleteModalData] = useState({
        show: false,
        customerId: null,
    });

    // Function to fetch all customers
    const handleFetchAllCustomers = async () => {
        try {
            // Clear previous results
            setAllCustomers([]);

            // Use fallback defaults if sortField or sortOrder is missing
            const finalSortField = sortField || 'name'; // Fallback to 'name' if not set
            const finalSortOrder = sortOrder || 'asc'; // Fallback to 'asc' if not set

            // Call the API to fetch all customers with sorting parameters
            console.log('Fetching customers with sortField:', finalSortField, 'and sortOrder:', finalSortOrder);
            const response = await getAllCustomers(finalSortField, finalSortOrder); // Pass sorting parameters
            console.log('Backend Response:', response); // Log the full response

            // Validate the response structure
            if (!response.data || !response.data.data || !Array.isArray(response.data.data)) {
                throw new Error('No data returned from the server');
            }

            // Extract the customer data from the response
            const responseData = response.data.data;

            // Update the state with the fetched customers
            setAllCustomers(responseData);

            // Set a success message
            setMessage(`Successfully fetched ${responseData.length} customer(s).`);
        } catch (error) {
            console.error('Error fetching all customers:', error.message);

            // Log the full error response for debugging
            if (error.response) {
                console.error('Backend Response Data:', error.response.data);
                console.error('Backend Status Code:', error.response.status);
                if (error.response.status === 400) {
                    setMessage(`Invalid sorting parameters. Please try again.`);
                } else {
                    setMessage('An unexpected error occurred while fetching customers.');
                }
            } else {
                console.error('Network or other error:', error.message);
            }

            // Set an error message
            setMessage('An error occurred while fetching all customers.');
        }
    };

    // Function to handle deleting a customer
    const handleDeleteCustomer = async () => {
        const { customerId } = deleteModalData;

        try {
            await deleteCustomer(customerId);
            setMessage('Customer deleted successfully.');

            // Remove the deleted customer from the list
            setAllCustomers((prevCustomers) =>
                prevCustomers.filter((customer) => customer.id !== customerId)
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

    // Fetch customers when the component mounts
    useEffect(() => {
        handleFetchAllCustomers();
    }, []); // Trigger only once on mount

    return (
        <div>
            <h4>View All Customers</h4>
            {message && <div className="alert alert-info mb-3">{message}</div>}

            {/* Sorting Controls */}
            {allCustomers.length > 0 && (
                <div className="mb-3">
                    <label className="me-2">Sort By:</label>
                    <select
                        value={sortField || ''}
                        onChange={(e) => {
                            const newSortField = e.target.value.toLowerCase();
                            console.log('Selected sortField:', newSortField);
                            setSortField(newSortField);
                        }}
                        className="form-select d-inline-block w-auto me-2"
                    >
                        <option value="">-- Select Sort Field --</option>
                        <option value="name">Name</option>
                        <option value="totalnonexpiredpoints">Total Non-Expired Points</option>
                        <option value="totalexpiredpoints">Total Expired Points</option>
                    </select>
                    <button
                        className="btn btn-sm btn-secondary me-5"
                        onClick={() => {
                            const newSortOrder = sortOrder === 'asc' ? 'desc' : 'asc';
                            console.log('Toggled sortOrder:', newSortOrder);
                            setSortOrder(newSortOrder);
                        }}
                    >
                        {sortOrder === 'asc' ? '▲ Asc' : '▼ Desc'}
                    </button>

                    <div className="mt-3">
                        {/* Fetch Button */}
                        <button className="btn btn-primary mb-3" onClick={handleFetchAllCustomers}>
                            Update Data
                        </button>
                    </div>
                </div>
            )}

            {/* Display All Customers */}
            {allCustomers.length > 0 && (
                <div className="mt-4">
                    <h5>All Customers</h5>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>Customer ID</th>
                                <th>Name</th>
                                <th>NIC</th>
                                <th>Phone</th>
                                <th>Email</th>
                                <th>Total Non-Expired Points</th>
                                <th>Total Expired Points</th>
                                <th>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {allCustomers.map((customer) => (
                                <tr key={customer.id}>
                                    <td>{customer.id}</td>
                                    <td>{customer.name}</td>
                                    <td>{customer.nic}</td>
                                    <td>{customer.phone}</td>
                                    <td>{customer.email}</td>
                                    <td>{customer.totalNonExpiredPoints}</td>
                                    <td>{customer.totalExpiredPoints}</td>
                                    <td>
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

export default ViewAllCustomers;
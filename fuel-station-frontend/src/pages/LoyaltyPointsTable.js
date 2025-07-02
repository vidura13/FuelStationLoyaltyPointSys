import React, { useState, useEffect } from 'react';
import { getAllLoyaltyPoints } from '../services/api';
import { convertUtcToIst } from './utils';

const LoyaltyPointsTable = ({ setMessage, message, setTotalRecords, totalRecords }) => {
    const [loyaltyPoints, setLoyaltyPoints] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [sortField, setSortField] = useState('inputdate');
    const [sortOrder, setSortOrder] = useState('desc');
    const [statusFilter, setStatusFilter] = useState('');

    const handleFetchAllLoyaltyPoints = async (page = currentPage) => {
        try {
            setLoyaltyPoints([]);

            const finalSortField = sortField || 'inputdate';
            const finalSortOrder = sortOrder || 'asc';
            const finalStatusFilter = statusFilter || null;

            console.log('Fetching loyalty points with:', {
                sortField: finalSortField,
                sortOrder: finalSortOrder,
                statusFilter: finalStatusFilter,
                page,
            });

            const response = await getAllLoyaltyPoints(finalSortField, finalSortOrder, finalStatusFilter, page);
            console.log('API Response:', response);

            if (!response.data || !response.data.data || !Array.isArray(response.data.data)) {
                throw new Error('No data returned from the server');
            }

            const responseData = response.data;
            const paginatedResults = responseData.data;

            console.log('Loyalty Points Data:', paginatedResults);

            setLoyaltyPoints(paginatedResults);
            setCurrentPage(page);
            setTotalPages(Math.ceil(responseData.totalRecords / responseData.pageSize));
            setTotalRecords(responseData.totalRecords);
            setMessage(`Successfully fetched ${paginatedResults.length} loyalty point(s).`);
        } catch (error) {
            console.error('Error fetching loyalty points:', error.message);

            if (error.response) {
                console.error('Backend Response Data:', error.response.data);
                console.error('Backend Status Code:', error.response.status);

                if (error.response.status === 404) {
                    setMessage('The requested resource was not found. Please check the API endpoint.');
                } else {
                    setMessage('An unexpected error occurred while fetching loyalty points.');
                }
            } else {
                setMessage('A network error occurred. Please try again.');
            }
        }
    };

    useEffect(() => {
        handleFetchAllLoyaltyPoints();
    }, [sortField, sortOrder, statusFilter]);

    return (
        <div>
            <h4>View All Loyalty Points</h4>
            {message && <div className="alert alert-info mb-3">{message}</div>}
            <div className="mb-3">
                <strong>Total Number of Records = {totalRecords}</strong>
            </div>
            <div className="mb-3">
                <label className="me-2">Sort By:</label>
                <select
                    value={sortField || ''}
                    onChange={(e) => {
                        const newSortField = e.target.value.toLowerCase();
                        setSortField(newSortField);
                        setCurrentPage(1);
                    }}
                    className="form-select d-inline-block w-auto me-2"
                >
                    <option value="">-- Select Sort Field --</option>
                    <option value="points">Points</option>
                    <option value="expirationdate">Expiration Date</option>
                    <option value="inputdate">Input Date</option>
                </select>
                <button
                    className="btn btn-sm btn-secondary me-5"
                    onClick={() => {
                        setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
                        setCurrentPage(1);
                    }}
                >
                    {sortOrder === 'asc' ? '▲ Asc' : '▼ Desc'}
                </button>
                <label className="ms-3 me-2">Filter By Status:</label>
                <select
                    value={statusFilter || ''}
                    onChange={(e) => {
                        setStatusFilter(e.target.value);
                        setCurrentPage(1);
                    }}
                    className="form-select d-inline-block w-auto me-2"
                >
                    <option value="">All</option>
                    <option value="expired">Expired</option>
                    <option value="available">Available</option>
                </select>
            </div>
            {loyaltyPoints.length > 0 ? (
                <div className="mt-4">
                    <h5>All Loyalty Points</h5>
                    <table className="table table-striped">
                        <thead>
                            <tr>
                                <th>ID</th>
                                <th>Customer ID</th>
                                <th>Points</th>
                                <th>Expiration Date (DD/MM/YY)</th>
                                <th>Input Date (DD/MM/YY)</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {loyaltyPoints.map((lp) => {
                                console.log('Raw Expiration Date:', lp.expirationDate);
                                console.log('Raw Input Date:', lp.inputDate);

                                return (
                                    <tr key={`${lp.id}-${lp.customerId}`}>
                                        <td>{lp.id || 'N/A'}</td>
                                        <td>{lp.customerId || 'N/A'}</td>
                                        <td>{lp.points || 'N/A'}</td>
                                        <td>{convertUtcToIst(lp.expirationDate)}</td>
                                        <td>{convertUtcToIst(lp.inputDate)}</td>
                                        <td>{lp.status || 'N/A'}</td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                    <div className="mt-3">
                        <button
                            className="btn btn-secondary me-2"
                            onClick={() => handleFetchAllLoyaltyPoints(currentPage - 1)}
                            disabled={currentPage === 1}
                        >
                            Previous
                        </button>
                        <span className="me-2">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            className="btn btn-secondary"
                            onClick={() => handleFetchAllLoyaltyPoints(currentPage + 1)}
                            disabled={currentPage === totalPages}
                        >
                            Next
                        </button>
                    </div>
                </div>
            ) : (
                <p>No loyalty points found.</p>
            )}
        </div>
    );
};

export default LoyaltyPointsTable;
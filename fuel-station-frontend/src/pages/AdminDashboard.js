import React, { useEffect, useState } from 'react';
import { getAdminDashboard } from '../services/api';
import LoyaltyPointsTable from './LoyaltyPointsTable';
import AddNewCustomer from './AddNewCustomer';
import AddTransaction from './AddTransaction';
import SearchCustomer from './SearchCustomer';
import ViewCustomerTransactions from './ViewCustomerTransactions';
import ViewAllCustomers from './ViewAllCustomers';
import SearchTransaction from './SearchTransaction';
import DashboardHome from './DashboardHome';
import RedeemLoyaltyPoints from './RedeemLoyaltyPoints';
import 'bootstrap/dist/css/bootstrap.min.css';

const AdminDashboard = ({ onLogout }) => {
    // State to store dashboard data
    const [dashboardData, setDashboardData] = useState({
        totalNonExpiredPoints: 0,
        totalExpiredPoints: 0,
        totalCustomers: 0,
    });

    // State to track the selected section and action
    const [selectedSection, setSelectedSection] = useState('Home');
    const [selectedAction, setSelectedAction] = useState(null);

    // State for success/error messages
    const [message, setMessage] = useState('');

    // Initialize totalRecords state
    const [totalRecords, setTotalRecords] = useState(0);

    // Fetch dashboard data when the component mounts
    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await getAdminDashboard();
                setDashboardData(response.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };

        fetchData();
    }, []);

    // Function to refresh dashboard data
    const refreshDashboard = async () => {
        try {
            const response = await getAdminDashboard();
            setDashboardData(response.data);
            console.log('Dashboard Data Refreshed:', response.data);
        } catch (error) {
            console.error('Error refreshing dashboard data:', error);
        }
    };

    // useEffect to clear the message when switching actions
    useEffect(() => {
        setMessage('');
    }, [selectedAction]);

    return (
        <div className="container-fluid mt-4 px-4">
            <h2 className="mb-4 text-center">Admin Dashboard</h2>

            {/* Metrics Section */}
            <div className="row mb-4">
                <div className="col-md-4">
                    <div className="card text-center">
                        <div className="card-body">
                            <h5 className="card-title">Total Available Loyalty Points</h5>
                            <p className="card-text">{dashboardData.totalNonExpiredPoints}</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card text-center">
                        <div className="card-body">
                            <h5 className="card-title">Total Expired Loyalty Points</h5>
                            <p className="card-text">{dashboardData.totalExpiredPoints}</p>
                        </div>
                    </div>
                </div>
                <div className="col-md-4">
                    <div className="card text-center">
                        <div className="card-body">
                            <h5 className="card-title">Total Customers</h5>
                            <p className="card-text">{dashboardData.totalCustomers}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Sidebar and Main Content */}
            <div className="row">
                {/* Sidebar */}
                <div className="col-md-3">
                    <div className="list-group">
                        <button
                            className={`list-group-item list-group-item-action ${selectedSection === 'Home' ? 'active' : ''
                                }`}
                            onClick={() => {
                                setSelectedSection('Home');
                                setSelectedAction('dashboard-home');
                            }}
                        >
                            Home
                        </button>
                        <button
                            className={`list-group-item list-group-item-action ${selectedSection === 'Customers' ? 'active' : ''
                                }`}
                            onClick={() => setSelectedSection('Customers')}
                        >
                            Customers
                        </button>
                        <button
                            className={`list-group-item list-group-item-action ${selectedSection === 'Transactions' ? 'active' : ''
                                }`}
                            onClick={() => setSelectedSection('Transactions')}
                        >
                            Transactions
                        </button>
                        <button
                            className={`list-group-item list-group-item-action ${selectedSection === 'Loyalty Points' ? 'active' : ''
                                }`}
                            onClick={() => setSelectedSection('Loyalty Points')}
                        >
                            Loyalty Points
                        </button>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="col-md-9">
                    {selectedSection === 'Home' && (
                        <DashboardHome onLogout={onLogout} />
                    )}

                    {selectedSection === 'Customers' && (
                        <div>
                            <h4>Customers</h4>
                            <div className="mb-3">
                                <button
                                    className="btn btn-success me-2"
                                    onClick={() => setSelectedAction('add-customer')}
                                >
                                    Add Customer
                                </button>
                                <button
                                    className="btn btn-primary me-2"
                                    onClick={() => setSelectedAction('search-customer')}
                                >
                                    Search Customer
                                </button>
                                <button
                                    className="btn btn-warning me-2"
                                    onClick={() => setSelectedAction('view-all-customers')}
                                >
                                    View All Customers
                                </button>
                                <button
                                    className="btn btn-info me-2"
                                    onClick={() => setSelectedAction('view-customer-transactions')}
                                >
                                    View Customer Transactions
                                </button>
                            </div>
                            {selectedAction === 'add-customer' && (
                                <>
                                    {message && <div className="alert alert-info mb-3">{message}</div>}
                                    <AddNewCustomer
                                        setMessage={setMessage}
                                        refreshDashboard={refreshDashboard}
                                    />
                                </>
                            )}
                            {selectedAction === 'search-customer' && (
                                <SearchCustomer
                                    setMessage={setMessage}
                                    refreshDashboard={refreshDashboard}
                                    message={message}
                                />
                            )}
                            {selectedAction === 'view-all-customers' && (
                                <ViewAllCustomers
                                    setMessage={setMessage}
                                    refreshDashboard={refreshDashboard}
                                />
                            )}
                            {selectedAction === 'view-customer-transactions' && (
                                <ViewCustomerTransactions
                                    setMessage={setMessage}
                                    refreshDashboard={refreshDashboard}
                                />
                            )}
                        </div>
                    )}

                    {selectedSection === 'Transactions' && (
                        <div>
                            <h4>Transactions</h4>
                            <div className="mb-3">
                                <button
                                    className="btn btn-success me-2"
                                    onClick={() => setSelectedAction('add-transaction')}
                                >
                                    Add Transaction
                                </button>
                                <button
                                    className="btn btn-primary me-2"
                                    onClick={() => setSelectedAction('view-transactions')}
                                >
                                    Search Transaction
                                </button>
                            </div>
                            {selectedAction === 'add-transaction' && (
                                <>
                                    {message && <div className="alert alert-info mb-3">{message}</div>}
                                    <AddTransaction
                                        setMessage={setMessage}
                                        refreshDashboard={refreshDashboard}
                                    />
                                </>
                            )}
                            {selectedAction === 'view-transactions' && (
                                <SearchTransaction
                                    setMessage={setMessage}
                                    refreshDashboard={refreshDashboard}
                                />
                            )}
                        </div>
                    )}

                    {selectedSection === 'Loyalty Points' && (
                        <div>
                            <h4>Loyalty Points</h4>
                            <div className="mb-3">
                                <button
                                    className="btn btn-warning me-2"
                                    onClick={() => setSelectedAction('view-all-loyaltypoints')}
                                >
                                    View All Loyalty Points
                                </button>
                                <button
                                    className="btn btn-primary me-2"
                                    onClick={() => setSelectedAction('redeem-loyaltypoints')}
                                >
                                    Redeem Loyalty Points
                                </button>
                            </div>
                            {selectedAction === 'view-all-loyaltypoints' && (
                                <LoyaltyPointsTable
                                    setMessage={setMessage}
                                    message={message}
                                    totalRecords={totalRecords}
                                    setTotalRecords={setTotalRecords}
                                />
                            )}
                            {selectedAction === 'redeem-loyaltypoints' && (
                                <RedeemLoyaltyPoints
                                    setMessage={setMessage}
                                    message={message}
                                    refreshDashboard={refreshDashboard}
                                />
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
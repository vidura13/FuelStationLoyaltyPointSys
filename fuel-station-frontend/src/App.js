import React, { useState } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import AdminDashboard from './pages/AdminDashboard';
import 'bootstrap/dist/css/bootstrap.min.css';
import CustomModal from './components/CustomModal';

function App() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');

  // State for the custom modal
  const [modalData, setModalData] = useState({
    show: false,
    title: '',
    message: '',
    variant: 'success',
  });

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      // Send a POST request to the backend's login endpoint
      const response = await axios.post('http://localhost:5201/api/auth/login', {
        username,
        password,
      });

      // Extract the token from the response
      const { token } = response.data;

      // Store the token in localStorage
      localStorage.setItem('authToken', token);

      // Show success modal
      setModalData({
        show: true,
        title: 'Success',
        message: 'Login successful! Welcome.',
        variant: 'success',
      });

      // Redirect to the Admin Dashboard after closing the modal
      setTimeout(() => {
        window.location.href = '/admin/dashboard';
      }, 2000); // Redirect after 2 seconds
    } catch (error) {
      // Handle errors (e.g., invalid credentials)
      if (error.response && error.response.status === 401) {
        setModalData({
          show: true,
          title: 'Error',
          message: 'Invalid username or password.',
          variant: 'danger',
        });
      } else {
        setModalData({
          show: true,
          title: 'Error',
          message: 'An error occurred. Please try again.',
          variant: 'danger',
        });
      }
    }
  };


  // Function to handle logout
  const handleLogout = () => {
    localStorage.removeItem('authToken'); // Remove the token
    window.location.href = '/'; // Redirect to the login page
  };

  return (
    <>
        {/* Custom Modal */}
        <CustomModal
            show={modalData.show}
            onClose={() => setModalData({ ...modalData, show: false })}
            title={modalData.title}
            message={modalData.message}
            variant={modalData.variant}
        />

        <Router>
            <Routes>
                {/* Redirect to Admin Dashboard after login */}
                <Route
                    path="/admin/dashboard"
                    element={<AdminDashboard onLogout={handleLogout} />}
                />

                {/* Default route (login page) */}
                <Route
                    path="/"
                    element={
                        <div className="container mt-5">
                            <div className="row justify-content-center">
                                <div className="col-md-6">
                                    <div className="card">
                                        <div className="card-body">
                                            <h3 className="card-title text-center mb-4">Login</h3>
                                            <form onSubmit={handleLogin}>
                                                <div className="mb-3">
                                                    <label htmlFor="username" className="form-label">
                                                        Username
                                                    </label>
                                                    <input
                                                        type="text"
                                                        className="form-control"
                                                        id="username"
                                                        value={username}
                                                        onChange={(e) => setUsername(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <div className="mb-3">
                                                    <label htmlFor="password" className="form-label">
                                                        Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        className="form-control"
                                                        id="password"
                                                        value={password}
                                                        onChange={(e) => setPassword(e.target.value)}
                                                        required
                                                    />
                                                </div>
                                                <button type="submit" className="btn btn-primary w-100">
                                                    Login
                                                </button>
                                            </form>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                />
            </Routes>
        </Router>
    </>
);
}

export default App;
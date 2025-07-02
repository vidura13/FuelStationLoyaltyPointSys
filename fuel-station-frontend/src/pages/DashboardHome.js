// src/components/DashboardHome.js
import React, { useEffect, useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import { Modal, Button } from 'react-bootstrap';

const DashboardHome = ({ onLogout }) => {
  const [showModal, setShowModal] = useState(false);

  const handleLogoutClick = () => {
      setShowModal(true); // Show the confirmation modal
  };

  const handleConfirmLogout = () => {
      setShowModal(false); // Hide the modal
      onLogout(); // Call the logout function
  };

  const handleCancelLogout = () => {
      setShowModal(false); // Hide the modal
  };

  return (
      <div className="container mt-5">
          <h2>Welcome to the Admin Dashboard</h2>
          <p>This is the home section of the dashboard. From here, you can manage customers, transactions, and loyalty points.</p>

          {/* Logout Button */}
          <button className="btn btn-danger" onClick={handleLogoutClick}>
              Logout
          </button>

          {/* Confirmation Modal */}
          <Modal show={showModal} onHide={handleCancelLogout}>
              <Modal.Header closeButton>
                  <Modal.Title>Confirm Logout</Modal.Title>
              </Modal.Header>
              <Modal.Body>Are you sure you want to log out?</Modal.Body>
              <Modal.Footer>
                  <Button variant="secondary" onClick={handleCancelLogout}>
                      Cancel
                  </Button>
                  <Button variant="danger" onClick={handleConfirmLogout}>
                      Yes, Log Out
                  </Button>
              </Modal.Footer>
          </Modal>
      </div>
  );
};

export default DashboardHome;
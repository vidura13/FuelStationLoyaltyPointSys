// src/components/CustomModal.js
import React from 'react';
import { Modal, Button } from 'react-bootstrap';

const CustomModal = ({ show, onClose, title, message, variant = 'success', onConfirm }) => {
    return (
        <Modal show={show} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>{title}</Modal.Title>
            </Modal.Header>
            <Modal.Body>{message}</Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose}>
                    Cancel
                </Button>
                <Button variant={variant} onClick={onConfirm}>
                    Confirm
                </Button>
            </Modal.Footer>
        </Modal>
    );
};

export default CustomModal;
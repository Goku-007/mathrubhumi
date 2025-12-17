import React from "react";
import Modal from "./Modal";

const IdleTimeoutModal = ({ isOpen, onClose }) => {
    const message = "You have been idle for 30 minutes and have been logged out. Please log in again.";
    const buttons = [
        {
            label: "OK",
            onClick: onClose,
            className: "bg-blue-500 hover:bg-blue-600",
        },
    ];
    return (
        <Modal isOpen={isOpen} message={message} type="info" buttons={buttons} size="sm" />
    );
};

export default IdleTimeoutModal;

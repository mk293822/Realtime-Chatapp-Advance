import React from "react";

const CallRejectedModal = ({ onClose }) => {
    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-70 transition-opacity duration-300 ease-in-out">
            <div className="bg-red-600 p-8 rounded-lg shadow-lg text-center">
                <h2 className="text-2xl font-bold text-white">Call Rejected</h2>
                <p className="text-white mt-2">The call has been rejected.</p>
                <button
                    onClick={onClose}
                    className="mt-4 px-6 py-2 bg-white text-red-600 rounded-lg font-semibold transition-transform duration-300 hover:scale-105"
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default CallRejectedModal;

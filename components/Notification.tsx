
import React from 'react';
import type { NotificationState } from '../types';

interface NotificationProps extends NotificationState {
    onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, visible, onClose }) => {
    if (!visible) return null;

    const typeClasses = {
        success: "bg-green-500 text-white",
        error: "bg-red-500 text-white",
        warning: "bg-yellow-500 text-black",
        info: "bg-blue-500 text-white"
    };

    return (
        <div className={`fixed top-5 right-5 max-w-sm p-4 rounded-lg shadow-lg z-50 animate-fade-in ${typeClasses[type]}`}>
            <div className="flex justify-between items-center">
                <p className="text-sm font-medium whitespace-pre-wrap">{message}</p>
                <button onClick={onClose} className="ml-4 text-xl font-bold leading-none hover:opacity-70">&times;</button>
            </div>
        </div>
    );
};

export default Notification;


import React, { useEffect } from 'react';

interface NotificationProps {
    message: string;
    type: 'success' | 'error' | 'warning' | 'info';
    visible: boolean;
    onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, type, visible, onClose }) => {
    useEffect(() => {
        if (visible) {
            const timer = setTimeout(() => {
                onClose();
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [visible, onClose]);

    if (!visible) return null;

    const typeClasses = {
        success: "bg-green-500 text-white",
        error: "bg-red-500 text-white",
        warning: "bg-yellow-500 text-white",
        info: "bg-blue-500 text-white"
    };

    return (
        <div className={`fixed top-5 right-5 max-w-sm p-4 rounded-lg shadow-lg z-50 animate-fade-in ${typeClasses[type]}`}>
            <div className="flex justify-between items-center">
                <p className="text-sm font-medium whitespace-pre-wrap">{message}</p>
                <button onClick={onClose} className="ml-4 text-xl font-bold leading-none hover:opacity-70">
                    {'×'}
                </button>
            </div>
        </div>
    );
};

export default Notification;

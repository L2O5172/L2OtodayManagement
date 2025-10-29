
import React, { useState } from 'react';
import { Order, OrderStatus } from '../types';
import LoadingSpinner from './LoadingSpinner';

interface OrderCardProps {
    order: Order;
    onConfirm: (orderId: string, adminNotes: string) => Promise<void>;
    onStatusUpdate: (orderId: string, status: OrderStatus) => Promise<void>;
    onPrint: (order: Order) => void;
}

const OrderCard: React.FC<OrderCardProps> = ({ order, onConfirm, onStatusUpdate, onPrint }) => {
    const [showConfirmModal, setShowConfirmModal] = useState(false);
    const [adminNotes, setAdminNotes] = useState('');
    const [isProcessing, setIsProcessing] = useState(false);

    const formatDate = (dateString: string | null): string => {
        if (!dateString) return '未設定';
        try {
            const date = new Date(dateString);
            return isNaN(date.getTime()) ? dateString : date.toLocaleString('zh-TW', { dateStyle: 'short', timeStyle: 'short'});
        } catch {
            return dateString;
        }
    };

    const getStatusColor = (status: OrderStatus) => ({
        'confirmed': 'bg-green-100 text-green-800 border-green-300',
        'preparing': 'bg-blue-100 text-blue-800 border-blue-300',
        'ready': 'bg-purple-100 text-purple-800 border-purple-300',
        'completed': 'bg-gray-200 text-gray-800 border-gray-400',
        'cancelled': 'bg-red-100 text-red-800 border-red-300',
        'pending': 'bg-yellow-100 text-yellow-800 border-yellow-300',
    }[status] || 'bg-gray-100 text-gray-800 border-gray-300');

    const getStatusText = (status: OrderStatus) => ({
        'confirmed': '已確認', 'preparing': '製作中', 'ready': '可取餐',
        'completed': '已完成', 'cancelled': '已取消', 'pending': '待確認',
    }[status] || '未知');

    const handleConfirm = async () => {
        if (isProcessing) return;
        setIsProcessing(true);
        try {
            await onConfirm(order.orderId, adminNotes);
            setShowConfirmModal(false);
            setAdminNotes('');
        } finally {
            setIsProcessing(false);
        }
    };

    const handleStatusUpdate = async (newStatus: OrderStatus) => {
        if (isProcessing) return;
        setIsProcessing(true);
        try {
            await onStatusUpdate(order.orderId, newStatus);
        } finally {
            setIsProcessing(false);
        }
    };

    const statusOptions: { value: OrderStatus; label: string }[] = [
        { value: 'pending', label: '待確認' }, { value: 'confirmed', label: '已確認' },
        { value: 'preparing', label: '製作中' }, { value: 'ready', label: '可取餐' },
        { value: 'completed', label: '已完成' }, { value: 'cancelled', label: '已取消' }
    ];

    return (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden animate-fade-in order-details">
            <div className="bg-gray-50 px-4 py-3 border-b border-gray-200">
                <div className="flex justify-between items-start">
                    <div>
                        <h3 className="font-bold text-lg break-words">{order.orderId}</h3>
                        <p className="text-sm text-gray-600 mt-1">{order.customerName} &bull; {order.customerPhone}</p>
                    </div>
                    <div className="text-right ml-4 flex-shrink-0">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(order.status)}`}>{getStatusText(order.status)}</span>
                        <p className="text-sm text-gray-500 mt-1">{formatDate(order.createdAt)}</p>
                    </div>
                </div>
            </div>
            
            <div className="p-4">
                <div className="mb-4"><h4 className="font-semibold mb-2">訂單內容:</h4>
                    <div className="bg-gray-50 rounded-lg p-3">
                        <div className="space-y-2">
                            {order.items.map((item, index) => (
                                <div key={index} className="flex justify-between text-sm">
                                    <span>{item.icon} {item.name} <span className="text-gray-500 ml-2">x{item.quantity}</span></span>
                                    <span>${item.price * item.quantity}</span>
                                </div>
                            ))}
                        </div>
                        <div className="border-t mt-2 pt-2 font-bold"><div className="flex justify-between"><span>總金額:</span><span>${order.totalAmount}</span></div></div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm mb-4">
                    <div>
                        <p><strong>取餐時間:</strong> {formatDate(order.pickupTime)}</p>
                        <p><strong>取餐方式:</strong> {order.deliveryAddress ? '外送' : '自取'}</p>
                        {order.deliveryAddress && <p className="break-words"><strong>外送地址:</strong> {order.deliveryAddress}</p>}
                    </div>
                    <div>
                        {order.notes && <p className="break-words"><strong>顧客備註:</strong> {order.notes}</p>}
                    </div>
                </div>
                <div className="flex flex-wrap gap-2 items-center">
                    {order.status === 'pending' && <button onClick={() => setShowConfirmModal(true)} disabled={isProcessing} className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">{isProcessing ? <LoadingSpinner /> : '✅'} 確認訂單</button>}
                    <select value={order.status} onChange={(e) => handleStatusUpdate(e.target.value as OrderStatus)} disabled={isProcessing} className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 bg-white">
                        {statusOptions.map(option => <option key={option.value} value={option.value}>{option.label}</option>)}
                    </select>
                    <button onClick={() => onPrint(order)} className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">🖨️ 列印</button>
                </div>
            </div>

            {showConfirmModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full animate-fade-in">
                        <h3 className="text-lg font-bold mb-4">確認訂單</h3>
                        <p className="mb-4">您即將確認訂單 <strong>{order.orderId}</strong></p>
                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-2">店家備註 (可選)</label>
                            <textarea value={adminNotes} onChange={(e) => setAdminNotes(e.target.value)} rows={3} className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500" placeholder="輸入備註資訊..."/>
                        </div>
                        <div className="flex justify-end gap-3">
                            <button onClick={() => setShowConfirmModal(false)} disabled={isProcessing} className="px-4 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50">取消</button>
                            <button onClick={handleConfirm} disabled={isProcessing} className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">{isProcessing ? <LoadingSpinner /> : null} 確認訂單</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default OrderCard;


import React, { useState } from 'react';
import type { Order, OrderStatus } from '../types';

interface OrderCardProps {
    order: Order;
    onStatusUpdate: (orderId: string, newStatus: OrderStatus) => void;
    onPrint: (order: Order) => void;
}

const statusConfig: Record<OrderStatus, { label: string; color: string }> = {
    pending: { label: '待確認', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
    confirmed: { label: '已確認', color: 'bg-blue-100 text-blue-800 border-blue-300' },
    preparing: { label: '製作中', color: 'bg-indigo-100 text-indigo-800 border-indigo-300' },
    ready: { label: '可取餐', color: 'bg-purple-100 text-purple-800 border-purple-300' },
    completed: { label: '已完成', color: 'bg-green-100 text-green-800 border-green-300' },
    cancelled: { label: '已取消', color: 'bg-red-100 text-red-800 border-red-300' },
};

const statusOptions: { value: OrderStatus; label: string }[] = [
    { value: 'pending', label: '待確認' },
    { value: 'confirmed', label: '已確認' },
    { value: 'preparing', label: '製作中' },
    { value: 'ready', label: '可取餐' },
    { value: 'completed', label: '已完成' },
    { value: 'cancelled', label: '已取消' },
];

const OrderCard: React.FC<OrderCardProps> = ({ order, onStatusUpdate, onPrint }) => {
    const [isProcessing, setIsProcessing] = useState(false);
    
    const formatDate = (dateString: string) => {
        try {
            return new Date(dateString).toLocaleString('zh-TW', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' });
        } catch {
            return dateString;
        }
    };
    
    const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (isProcessing) return;
        setIsProcessing(true);
        await onStatusUpdate(order.orderId, e.target.value as OrderStatus);
        setIsProcessing(false);
    };

    return (
        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden animate-fade-in">
            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-start gap-4">
                <div>
                    <h3 className="font-bold text-lg text-slate-800 break-all">{order.orderId}</h3>
                    <p className="text-sm text-slate-600 mt-1">{order.customerName} &bull; {order.customerPhone}</p>
                </div>
                <div className="text-right flex-shrink-0">
                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${statusConfig[order.status].color}`}>
                        {statusConfig[order.status].label}
                    </span>
                    <p className="text-xs text-slate-500 mt-1">{formatDate(order.createdAt)}</p>
                </div>
            </div>
            
            <div className="p-4 space-y-4">
                <div>
                    <h4 className="font-semibold text-slate-700 mb-2">訂單內容</h4>
                    <div className="bg-slate-50 rounded-lg p-3 text-sm text-slate-800 space-y-2">
                        <p className="whitespace-pre-wrap">{order.items.replace(/,\s*/g, '\n')}</p>
                        <div className="border-t border-slate-200 mt-2 pt-2 font-bold flex justify-between">
                            <span>總金額:</span>
                            <span className="text-green-600">${order.totalAmount}</span>
                        </div>
                    </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-x-4 gap-y-2 text-sm">
                    <p><strong>取餐時間:</strong> {formatDate(order.pickupTime)}</p>
                    <p><strong>取餐方式:</strong> {order.deliveryAddress ? '外送' : '自取'}</p>
                    {order.deliveryAddress && <p className="md:col-span-2"><strong>外送地址:</strong> {order.deliveryAddress}</p>}
                    {order.notes && <p className="md:col-span-2"><strong>顧客備註:</strong> {order.notes}</p>}
                </div>
                
                {order.adminNotes && (
                    <div className="p-3 bg-yellow-50 border-l-4 border-yellow-400 text-sm text-yellow-800">
                        <strong>店家備註:</strong> {order.adminNotes}
                    </div>
                )}
                
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200">
                    <select value={order.status} onChange={handleStatusChange} disabled={isProcessing} className="border border-slate-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white w-full sm:w-auto">
                        {statusOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                    <button onClick={() => onPrint(order)} className="bg-slate-600 hover:bg-slate-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors text-sm w-full sm:w-auto">
                        <span>🖨️</span> 列印
                    </button>
                    {isProcessing && <div className="text-sm text-slate-500">更新中...</div>}
                </div>
            </div>
        </div>
    );
};

export default OrderCard;


import React, { useMemo } from 'react';
import type { Order } from '../types';
import StatCard from './StatCard';

interface SalesStatisticsProps {
    orders: Order[];
    onViewChange: (view: 'orders' | 'statistics') => void;
}

const SalesStatistics: React.FC<SalesStatisticsProps> = ({ orders, onViewChange }) => {
    const statistics = useMemo(() => {
        const completedOrders = orders.filter(o => o.status === 'completed');
        const totalRevenue = completedOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        const totalOrders = completedOrders.length;
        const averageOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
        
        const customerPhoneSet = new Set(completedOrders.map(o => o.customerPhone));
        const uniqueCustomers = customerPhoneSet.size;

        return {
            totalRevenue,
            totalOrders,
            averageOrderValue,
            uniqueCustomers
        };
    }, [orders]);
    
    return (
        <div className="animate-fade-in space-y-8">
            <div className="flex items-center justify-between">
                <h2 className="text-3xl font-bold text-slate-800">銷售統計報表</h2>
                <button onClick={() => onViewChange('orders')} className="bg-slate-200 hover:bg-slate-300 text-slate-800 px-4 py-2 rounded-lg transition-colors">
                    ← 返回訂單
                </button>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="總營業額" value={`$${statistics.totalRevenue.toLocaleString()}`} subtitle="僅計算已完成訂單" icon="💰" color="border-green-500" />
                <StatCard title="總訂單數" value={statistics.totalOrders.toLocaleString()} subtitle="已完成的訂單" icon="📦" color="border-blue-500" />
                <StatCard title="平均客單價" value={`$${statistics.averageOrderValue.toFixed(0)}`} subtitle="每筆訂單平均" icon="📊" color="border-purple-500" />
                <StatCard title="不重複顧客" value={statistics.uniqueCustomers.toLocaleString()} subtitle="根據電話號碼計算" icon="👥" color="border-yellow-500" />
            </div>
            
            <div className="bg-white rounded-lg p-6 border border-slate-200 shadow-sm">
                <h3 className="text-xl font-bold mb-4 text-slate-800">近期已完成訂單</h3>
                <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    {orders.filter(o => o.status === 'completed').length > 0 ? (
                        orders.filter(o => o.status === 'completed').map(order => (
                            <div key={order.orderId} className="border border-slate-200 rounded-lg p-3 text-sm">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h4 className="font-semibold text-slate-700">{order.customerName}</h4>
                                        <p className="text-xs text-slate-500">{order.orderId}</p>
                                        <p className="mt-1">{order.items}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold text-green-600">${order.totalAmount}</p>
                                        <p className="text-xs text-slate-500 mt-1">{new Date(order.createdAt).toLocaleDateString('zh-TW')}</p>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <p className="text-slate-500 text-center py-8">暫無已完成的訂單。</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default SalesStatistics;

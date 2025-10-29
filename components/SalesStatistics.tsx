
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { Order } from '../types';
import StatCard from './StatCard';

// Declare Chart.js from global scope, as it's loaded via CDN
declare global {
  interface Window { Chart: any; }
}

interface SalesStatisticsProps {
    orders: Order[];
    onViewChange: (view: 'orders' | 'statistics') => void;
}

const SalesStatistics: React.FC<SalesStatisticsProps> = ({ orders, onViewChange }) => {
    const [dateRange, setDateRange] = useState('today');
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));

    const revenueChartRef = useRef<HTMLCanvasElement>(null);
    const customerChartRef = useRef<HTMLCanvasElement>(null);
    const monthlyRevenueChartRef = useRef<HTMLCanvasElement>(null);
    const popularItemsChartRef = useRef<HTMLCanvasElement>(null);

    const getDateRange = useMemo(() => {
        const now = new Date();
        const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfYear = new Date(now.getFullYear(), 0, 1);
        
        const [year, month] = selectedMonth.split('-').map(Number);
        const startOfSelectedMonth = new Date(year, month - 1, 1);
        const endOfSelectedMonth = new Date(year, month, 0, 23, 59, 59);

        return {
            today: { start: startOfDay, end: now },
            month: { start: startOfMonth, end: now },
            year: { start: startOfYear, end: now },
            custom: { start: startOfSelectedMonth, end: endOfSelectedMonth }
        }[dateRange] || { start: startOfDay, end: now };
    }, [dateRange, selectedMonth]);

    const filteredOrders = useMemo(() => {
        const { start, end } = getDateRange;
        return orders.filter(order => {
            const orderDate = new Date(order.createdAt);
            return orderDate >= start && orderDate <= end && order.status !== 'cancelled';
        });
    }, [orders, getDateRange]);

    const statistics = useMemo(() => {
        const totalRevenue = filteredOrders.reduce((sum, order) => sum + order.totalAmount, 0);
        const customerCount = filteredOrders.length;
        const itemSales: { [key: string]: { quantity: number; revenue: number; icon: string } } = {};
        
        filteredOrders.forEach(order => {
            order.items.forEach(item => {
                const itemName = item.name;
                if (!itemSales[itemName]) {
                    itemSales[itemName] = { quantity: 0, revenue: 0, icon: item.icon };
                }
                itemSales[itemName].quantity += item.quantity;
                itemSales[itemName].revenue += item.price * item.quantity;
            });
        });

        const popularItems = Object.entries(itemSales)
            .map(([name, data]) => ({ name, ...data }))
            .sort((a, b) => b.quantity - a.quantity);

        const dailyData: { [key: string]: { revenue: number; customers: number; orders: number } } = {};
        filteredOrders.forEach(order => {
            const date = new Date(order.createdAt).toLocaleDateString('zh-TW');
            if (!dailyData[date]) {
                dailyData[date] = { revenue: 0, customers: 0, orders: 0 };
            }
            dailyData[date].revenue += order.totalAmount;
            dailyData[date].customers += 1;
            dailyData[date].orders += 1;
        });
        
        const monthlyData: { [key: string]: { revenue: number; customers: number; orders: number } } = {};
        const allOrdersInYear = orders.filter(order => new Date(order.createdAt).getFullYear() === new Date().getFullYear());
        allOrdersInYear.forEach(order => {
            const month = new Date(order.createdAt).toLocaleDateString('zh-TW', { year: 'numeric', month: 'long' });
            if (!monthlyData[month]) {
                monthlyData[month] = { revenue: 0, customers: 0, orders: 0 };
            }
            monthlyData[month].revenue += order.totalAmount;
            monthlyData[month].customers += 1;
            monthlyData[month].orders += 1;
        });

        return {
            totalRevenue,
            customerCount,
            popularItems,
            dailyData,
            monthlyData,
            averageOrderValue: customerCount > 0 ? totalRevenue / customerCount : 0,
            totalOrders: filteredOrders.length
        };
    }, [filteredOrders, orders]);

    const createChart = <T,>(chartRef: React.RefObject<HTMLCanvasElement>, config: T) => {
        if (!chartRef.current) return;
        const chartInstance = new window.Chart(chartRef.current, config);
        return () => chartInstance.destroy();
    };

    useEffect(() => {
        const dates = Object.keys(statistics.dailyData).sort((a,b) => new Date(a).getTime() - new Date(b).getTime());
        const revenueData = dates.map(date => statistics.dailyData[date].revenue);
        const customerData = dates.map(date => statistics.dailyData[date].customers);

        const cleanupRevenue = createChart(revenueChartRef, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: '每日營業額', data: revenueData, borderColor: 'rgb(34, 197, 94)',
                    backgroundColor: 'rgba(34, 197, 94, 0.1)', tension: 0.4, fill: true
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, title: { display: true, text: '營業額 ($)' } } } }
        });
        
        const cleanupCustomer = createChart(customerChartRef, {
            type: 'line',
            data: {
                labels: dates,
                datasets: [{
                    label: '每日客數', data: customerData, borderColor: 'rgb(59, 130, 246)',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)', tension: 0.4, fill: true
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true, title: { display: true, text: '客數' } } } }
        });
        
        return () => {
            if(cleanupRevenue) cleanupRevenue();
            if(cleanupCustomer) cleanupCustomer();
        };
    }, [statistics.dailyData]);
    
    useEffect(() => {
        const sortedMonths = Object.keys(statistics.monthlyData).sort((a, b) => new Date(`1 ${a}`).getMonth() - new Date(`1 ${b}`).getMonth());
        const monthlyRevenue = sortedMonths.map(month => statistics.monthlyData[month].revenue);
        
        const cleanupMonthly = createChart(monthlyRevenueChartRef, {
            type: 'bar',
            data: {
                labels: sortedMonths,
                datasets: [{
                    label: '每月營業額', data: monthlyRevenue, backgroundColor: 'rgba(75, 192, 192, 0.8)',
                    borderColor: 'rgb(75, 192, 192)', borderWidth: 1
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, scales: { y: { beginAtZero: true } } }
        });
        
        const topItems = statistics.popularItems.slice(0, 8);
        const cleanupPopular = createChart(popularItemsChartRef, {
            type: 'doughnut',
            data: {
                labels: topItems.map(item => item.name),
                datasets: [{
                    label: '銷售數量', data: topItems.map(item => item.quantity),
                    backgroundColor: ['rgba(255, 99, 132, 0.8)','rgba(54, 162, 235, 0.8)','rgba(255, 206, 86, 0.8)','rgba(75, 192, 192, 0.8)','rgba(153, 102, 255, 0.8)','rgba(255, 159, 64, 0.8)','rgba(199, 199, 199, 0.8)','rgba(83, 102, 255, 0.8)']
                }]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'right' } } }
        });

        return () => {
            if(cleanupMonthly) cleanupMonthly();
            if(cleanupPopular) cleanupPopular();
        };
    }, [statistics.monthlyData, statistics.popularItems]);


    return (
        <div className="animate-fade-in">
            <div className="flex items-center mb-6">
                <button onClick={() => onViewChange('orders')} className="text-gray-600 hover:text-gray-800 mr-3 text-2xl">
                    &larr;
                </button>
                <h2 className="text-2xl font-bold">銷售統計報表</h2>
            </div>

            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm mb-6">
                <div className="flex flex-wrap gap-4 items-center">
                    <label className="font-medium">統計期間:</label>
                    <select value={dateRange} onChange={(e) => setDateRange(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500">
                        <option value="today">今日</option>
                        <option value="month">本月</option>
                        <option value="year">今年</option>
                        <option value="custom">選擇月份</option>
                    </select>
                    {dateRange === 'custom' && (
                        <input type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} className="border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500"/>
                    )}
                    <div className="text-sm text-gray-600">共 {statistics.totalOrders} 筆訂單，{statistics.customerCount} 位顧客</div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <StatCard title="總營業額" value={`$${statistics.totalRevenue.toLocaleString()}`} icon="💰" color="border-l-blue-500" />
                <StatCard title="總客數" value={statistics.customerCount.toLocaleString()} icon="👥" color="border-l-green-500" />
                <StatCard title="平均客單價" value={`$${Math.round(statistics.averageOrderValue)}`} icon="📊" color="border-l-purple-500" />
                <StatCard title="訂單數量" value={statistics.totalOrders} icon="📦" color="border-l-orange-500" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm"><h3 className="text-lg font-bold mb-4">每日營業額趨勢</h3><div className="h-80"><canvas ref={revenueChartRef}></canvas></div></div>
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm"><h3 className="text-lg font-bold mb-4">每日客數趨勢</h3><div className="h-80"><canvas ref={customerChartRef}></canvas></div></div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm"><h3 className="text-lg font-bold mb-4">每月營業額</h3><div className="h-80"><canvas ref={monthlyRevenueChartRef}></canvas></div></div>
                <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm"><h3 className="text-lg font-bold mb-4">熱門商品銷售排行</h3><div className="h-80"><canvas ref={popularItemsChartRef}></canvas></div></div>
            </div>
            
            <div className="bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
                <h3 className="text-lg font-bold mb-4">商品銷售明細</h3>
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-gray-50">
                                <th className="border border-gray-200 p-3 text-left">排名</th><th className="border border-gray-200 p-3 text-left">商品</th><th className="border border-gray-200 p-3 text-center">銷售量</th><th className="border border-gray-200 p-3 text-right">銷售額</th><th className="border border-gray-200 p-3 text-right">佔比</th>
                            </tr>
                        </thead>
                        <tbody>
                            {statistics.popularItems.map((item, index) => (
                                <tr key={index} className="hover:bg-gray-50">
                                    <td className="border border-gray-200 p-3 font-medium">#{index + 1}</td>
                                    <td className="border border-gray-200 p-3"><div className="flex items-center gap-2"><span>{item.icon}</span><span>{item.name}</span></div></td>
                                    <td className="border border-gray-200 p-3 text-center">{item.quantity}</td>
                                    <td className="border border-gray-200 p-3 text-right">${item.revenue.toLocaleString()}</td>
                                    <td className="border border-gray-200 p-3 text-right">{statistics.totalRevenue > 0 ? `${((item.revenue / statistics.totalRevenue) * 100).toFixed(1)}%` : '0%'}</td>
                                </tr>
                            ))}
                        </tbody>
                        <tfoot>
                            <tr className="bg-gray-100 font-bold">
                                <td className="border border-gray-200 p-3" colSpan={2}>總計</td>
                                <td className="border border-gray-200 p-3 text-center">{statistics.popularItems.reduce((sum, item) => sum + item.quantity, 0)}</td>
                                <td className="border border-gray-200 p-3 text-right">${statistics.totalRevenue.toLocaleString()}</td>
                                <td className="border border-gray-200 p-3 text-right">100%</td>
                            </tr>
                        </tfoot>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default SalesStatistics;

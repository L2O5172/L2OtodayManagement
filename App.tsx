import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { apiService } from './services/apiService';
import type { Order, OrderStatus, NotificationState } from './types';
import OrderCard from './components/OrderCard';
import SalesStatistics from './components/SalesStatistics';
import LoadingSpinner from './components/LoadingSpinner';
import Notification from './components/Notification';

const App: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
    const [notification, setNotification] = useState<NotificationState>({ message: '', type: 'success', visible: false });
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
    const [currentView, setCurrentView] = useState<'orders' | 'statistics'>('orders');

    const showNotification = useCallback((message: string, type: NotificationState['type'] = 'success') => {
        setNotification({ message, type, visible: true });
        setTimeout(() => setNotification(prev => ({ ...prev, visible: false })), 5000);
    }, []);

    const loadOrders = useCallback(async () => {
        try {
            const result = await apiService.getAllOrders();
            if (result.success && result.data) {
                const sortedOrders = result.data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
                setOrders(sortedOrders);
                if (sortedOrders.length > 0) {
                    showNotification(`成功載入 ${sortedOrders.length} 筆訂單`, 'success');
                } else {
                    showNotification('目前沒有任何訂單。', 'info');
                }
            } else {
                setOrders([]);
                showNotification(`載入訂單失敗: ${result.message}`, 'error');
            }
        } catch (error) {
            console.error('Load orders failed:', error);
            setOrders([]);
            const errorMessage = error instanceof Error ? error.message : '未知的錯誤';
            showNotification(`載入訂單時發生錯誤: ${errorMessage}`, 'error');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [showNotification]);

    useEffect(() => {
        loadOrders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const filteredOrders = useMemo(() => {
        if (statusFilter === 'all') return orders;
        return orders.filter(order => order.status === statusFilter);
    }, [orders, statusFilter]);
    
    const handleStatusUpdate = useCallback(async (orderId: string, status: OrderStatus) => {
        const result = await apiService.updateOrderStatus(orderId, status);
        if (result.success) {
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.orderId === orderId ? { ...order, status, updatedAt: new Date().toISOString() } : order
                )
            );
            showNotification('訂單狀態已更新', 'success');
        } else {
            showNotification('更新訂單狀態失敗', 'error');
        }
    }, [showNotification]);

    const handlePrintOrder = (order: Order) => {
        const printWindow = window.open('', '_blank');
        if (!printWindow) {
            alert('無法打開列印視窗，請檢查您的瀏覽器設定。');
            return;
        }
        const printContent = `
            <!DOCTYPE html>
            <html lang="zh-TW">
            <head>
                <title>訂單 - ${order.orderId}</title>
                <style>
                    body { font-family: 'Noto Sans TC', sans-serif; margin: 20px; font-size: 14px; }
                    .header { text-align: center; margin-bottom: 20px; border-bottom: 2px solid #333; padding-bottom: 10px; }
                    h1 { font-size: 24px; margin: 0; } h2 { font-size: 18px; margin: 5px 0; }
                    .info-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 15px; }
                    .info-item { display: flex; flex-direction: column; } .info-item strong { margin-bottom: 2px; }
                    .items { border-top: 1px dashed #999; border-bottom: 1px dashed #999; padding: 10px 0; margin: 15px 0; }
                    .total { font-weight: bold; text-align: right; font-size: 1.2em; margin-top: 10px; }
                    .notes { margin-top: 15px; padding: 10px; background-color: #f9f9f9; border: 1px solid #eee; border-radius: 4px; }
                </style>
            </head>
            <body>
                <div class="header"><h1>台灣小吃店</h1><h2>顧客訂單</h2></div>
                <div class="info-grid">
                    <div class="info-item"><strong>訂單編號:</strong> ${order.orderId}</div>
                    <div class="info-item"><strong>顧客:</strong> ${order.customerName} (${order.customerPhone})</div>
                    <div class="info-item"><strong>下單時間:</strong> ${new Date(order.createdAt).toLocaleString('zh-TW')}</div>
                    <div class="info-item"><strong>取餐時間:</strong> ${new Date(order.pickupTime).toLocaleString('zh-TW')}</div>
                </div>
                <div class="items"><strong>訂單內容:</strong><p style="margin: 5px 0; white-space: pre-wrap;">${order.items.replace(/, /g, '\n')}</p></div>
                <div class="total">總金額: $${order.totalAmount}</div>
                ${order.deliveryAddress ? `<div class="notes"><strong>外送地址:</strong> ${order.deliveryAddress}</div>` : ''}
                ${order.notes ? `<div class="notes"><strong>顧客備註:</strong> ${order.notes}</div>` : ''}
                <script>setTimeout(() => window.print(), 500);</script>
            </body>
            </html>`;
        printWindow.document.write(printContent);
        printWindow.document.close();
    };

    const handleRefresh = () => {
        setIsRefreshing(true);
        loadOrders();
    };

    const orderStats = useMemo(() => ({
        all: orders.length,
        pending: orders.filter(o => o.status === 'pending').length,
        confirmed: orders.filter(o => o.status === 'confirmed').length,
        preparing: orders.filter(o => o.status === 'preparing').length,
        ready: orders.filter(o => o.status === 'ready').length,
        completed: orders.filter(o => o.status === 'completed').length,
        cancelled: orders.filter(o => o.status === 'cancelled').length,
    }), [orders]);
    
    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center">
                <LoadingSpinner />
                <p className="mt-4 text-slate-600">正在載入訂單...</p>
            </div>
        );
    }
    
    return (
        <div className="min-h-screen bg-slate-50">
            <Notification {...notification} onClose={() => setNotification(p => ({ ...p, visible: false }))} />
            <header className="bg-white shadow-sm sticky top-0 z-40 border-b border-slate-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <h1 className="text-2xl font-bold text-slate-800">小吃店管理系統</h1>
                        <div className="flex items-center gap-4">
                            <button onClick={handleRefresh} disabled={isRefreshing} className="bg-blue-500 hover:bg-blue-600 disabled:bg-slate-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105">
                                <span className={isRefreshing ? 'animate-spin' : ''}>🔄</span> 刷新
                            </button>
                            <button onClick={() => setCurrentView(v => v === 'orders' ? 'statistics' : 'orders')} className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-all duration-300 transform hover:scale-105">
                                <span>{currentView === 'orders' ? '📊' : '📋'}</span> {currentView === 'orders' ? '統計' : '訂單'}
                            </button>
                        </div>
                    </div>
                </div>
            </header>
            
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {currentView === 'orders' ? (
                    <>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-8">
                            {[
                                { key: 'all', label: '全部' },
                                { key: 'pending', label: '待確認' },
                                { key: 'confirmed', label: '已確認' },
                                { key: 'preparing', label: '製作中' },
                                { key: 'ready', label: '可取餐' },
                                { key: 'completed', label: '已完成' },
                            ].map(({ key, label }) => (
                                <button key={key} onClick={() => setStatusFilter(key as OrderStatus | 'all')} className={`p-4 rounded-lg text-left transition-all duration-300 transform hover:-translate-y-1 ${statusFilter === key ? 'bg-indigo-600 text-white shadow-lg' : 'bg-white text-slate-700 shadow-sm hover:shadow-md'}`}>
                                    <div className="text-2xl font-bold">{orderStats[key as keyof typeof orderStats]}</div>
                                    <div className="text-sm font-medium">{label}</div>
                                </button>
                            ))}
                        </div>
                        <div className="space-y-6">
                            {filteredOrders.length === 0 ? (
                                <div className="text-center py-16 bg-white rounded-lg border border-slate-200">
                                    <div className="text-6xl mb-4">📭</div>
                                    <h3 className="text-xl font-semibold text-slate-700">暫無訂單</h3>
                                    <p className="text-slate-500">此分類目前沒有訂單。</p>
                                </div>
                            ) : (
                                filteredOrders.map(order => <OrderCard key={order.orderId} order={order} onStatusUpdate={handleStatusUpdate} onPrint={handlePrintOrder} />)
                            )}
                        </div>
                    </>
                ) : (
                    <SalesStatistics orders={orders} onViewChange={setCurrentView} />
                )}
            </main>
        </div>
    );
};

export default App;
import React, { useState, useEffect, useCallback } from 'react';
import { apiService } from './services/apiService';
import { Order, OrderStatus } from './types';
import LoadingSpinner from './components/LoadingSpinner';
import Notification from './components/Notification';
import OrderCard from './components/OrderCard';
import SalesStatistics from './components/SalesStatistics';

const App: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [notification, setNotification] = useState({ message: '', type: 'success' as 'success' | 'error', visible: false });
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
    const [currentView, setCurrentView] = useState<'orders' | 'statistics'>('orders');
    
    const showNotification = useCallback((message: string, type: 'success' | 'error' = 'success') => {
        setNotification({ message, type, visible: true });
    }, []);

    const loadOrders = useCallback(async (isRefresh = false) => {
        if (isRefresh) setIsRefreshing(true);
        else setIsLoading(true);
        
        try {
            const result = await apiService.getAllOrders();
            if (result.success) {
                setOrders(result.data);
                if(!isRefresh) showNotification(`成功載入 ${result.data.length} 筆訂單`, 'success');
            } else {
                throw new Error('載入訂單失敗');
            }
        } catch (error) {
            showNotification(error instanceof Error ? error.message : '未知錯誤', 'error');
        } finally {
            setIsLoading(false);
            setIsRefreshing(false);
        }
    }, [showNotification]);

    useEffect(() => {
        loadOrders();
    }, [loadOrders]);

    useEffect(() => {
        if (statusFilter === 'all') {
            setFilteredOrders(orders);
        } else {
            setFilteredOrders(orders.filter(order => order.status === statusFilter));
        }
    }, [statusFilter, orders]);

    const handleConfirmOrder = async (orderId: string, adminNotes: string) => {
        await apiService.confirmOrder(orderId, adminNotes);
        showNotification('訂單已確認！', 'success');
        await loadOrders(true);
    };

    const handleStatusUpdate = async (orderId: string, status: OrderStatus) => {
        await apiService.updateOrderStatus(orderId, status);
        showNotification('訂單狀態已更新！', 'success');
        await loadOrders(true);
    };

    const handlePrint = (order: Order) => {
        // This is a simplified print handler. In a real app, you'd generate a more print-friendly layout.
        window.print();
    }

    const statusFilters: { value: OrderStatus | 'all'; label: string }[] = [
        { value: 'all', label: '全部訂單' }, { value: 'pending', label: '待確認' },
        { value: 'confirmed', label: '已確認' }, { value: 'preparing', label: '製作中' },
        { value: 'ready', label: '可取餐' }, { value: 'completed', label: '已完成' },
        { value: 'cancelled', label: '已取消' }
    ];

    const renderOrderView = () => (
        <div className="animate-fade-in">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold">訂單管理</h2>
                <button onClick={() => setCurrentView('statistics')} className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-lg flex items-center gap-2 transition-colors shadow-sm">
                    📊 查看銷售統計
                </button>
            </div>
            <div className="bg-white rounded-lg p-4 border border-gray-200 shadow-sm mb-6 no-print">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div className="flex flex-wrap gap-2">
                        {statusFilters.map(filter => {
                             const count = filter.value === 'all' ? orders.length : orders.filter(o => o.status === filter.value).length;
                             return (
                                <button key={filter.value} onClick={() => setStatusFilter(filter.value)} className={`px-4 py-2 rounded-lg border text-sm transition-colors ${statusFilter === filter.value ? 'bg-blue-600 text-white border-blue-600' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}>
                                    {filter.label} ({count})
                                </button>
                             )
                        })}
                    </div>
                    <button onClick={() => loadOrders(true)} disabled={isRefreshing} className="bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors w-full md:w-auto justify-center">
                        {isRefreshing ? <LoadingSpinner /> : '🔄'}
                        {isRefreshing ? '刷新中...' : '刷新訂單'}
                    </button>
                </div>
            </div>
            {isLoading ? (
                <div className="text-center py-12"><div className="inline-block"><LoadingSpinner/></div><p className="mt-4 text-gray-600">載入訂單中...</p></div>
            ) : filteredOrders.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm"><div className="text-4xl mb-4">📋</div><p className="text-gray-500 text-lg">暫無訂單</p><p className="text-gray-400">{statusFilter !== 'all' ? `目前沒有${statusFilters.find(f => f.value === statusFilter)?.label}的訂單` : '尚未收到任何訂單'}</p></div>
            ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {filteredOrders.map(order => <OrderCard key={order.orderId} order={order} onConfirm={handleConfirmOrder} onStatusUpdate={handleStatusUpdate} onPrint={handlePrint} />)}
                </div>
            )}
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-6 max-w-7xl">
                <header className="mb-8 no-print">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">台灣小吃店 - 店家管理系統</h1>
                    <p className="text-gray-600">{currentView === 'orders' ? '訂單管理與追蹤' : '銷售統計與分析'}</p>
                </header>
                <main>
                    {currentView === 'statistics' ? <SalesStatistics orders={orders} onViewChange={setCurrentView} /> : renderOrderView()}
                </main>
            </div>
            <Notification message={notification.message} type={notification.type} visible={notification.visible} onClose={() => setNotification(prev => ({ ...prev, visible: false }))} />
        </div>
    );
};

export default App;

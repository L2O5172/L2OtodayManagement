
import { Order, MenuItem } from '../types';

// 菜單項目
export const MENU_ITEMS: MenuItem[] = [
    { name: '滷肉飯', price: 35, icon: '🍚' },
    { name: '雞肉飯', price: 40, icon: '🍗' },
    { name: '蚵仔煎', price: 65, icon: '🍳' },
    { name: '大腸麵線', price: 50, icon: '🍜' },
    { name: '珍珠奶茶', price: 45, icon: '🥤' },
    { name: '鹽酥雞', price: 60, icon: '🍖' },
    { name: '甜不辣', price: 40, icon: '🍢' },
    { name: '肉圓', price: 45, icon: '🥟' },
    { name: '臭豆腐', price: 55, icon: '🧆' },
    { name: '牛肉麵', price: 120, icon: '🍲' }
];

// 生成測試資料
export const generateTestData = (): Order[] => {
    const orders: Order[] = [];
    const statuses: Order['status'][] = ['pending', 'confirmed', 'preparing', 'ready', 'completed'];
    const customers = ['王小明', '陳小華', '林小美', '張小強', '李小雯', '黃小龍', '劉小婷'];
    const addresses = ['', '台北市信義區忠孝東路五段100號', '台北市大安區仁愛路四段50號', ''];
    
    // 生成過去30天的資料
    for (let i = 0; i < 100; i++) {
        const daysAgo = Math.floor(Math.random() * 30);
        const orderDate = new Date();
        orderDate.setDate(orderDate.getDate() - daysAgo);
        orderDate.setHours(10 + Math.floor(Math.random() * 10), Math.floor(Math.random() * 60));
        
        const itemCount = Math.floor(Math.random() * 4) + 1;
        const items = [];
        let totalAmount = 0;
        
        for (let j = 0; j < itemCount; j++) {
            const menuItem = MENU_ITEMS[Math.floor(Math.random() * MENU_ITEMS.length)];
            const quantity = Math.floor(Math.random() * 3) + 1;
            items.push({
                name: menuItem.name,
                price: menuItem.price,
                quantity: quantity,
                icon: menuItem.icon
            });
            totalAmount += menuItem.price * quantity;
        }
        
        const customerIndex = Math.floor(Math.random() * customers.length);
        const addressIndex = Math.floor(Math.random() * addresses.length);
        const statusIndex = Math.floor(Math.random() * statuses.length);
        
        orders.push({
            orderId: `ORD${String(1000 + i).slice(1)}`,
            customerName: customers[customerIndex],
            customerPhone: `09${String(10000000 + Math.floor(Math.random() * 90000000)).slice(1)}`,
            items: items,
            totalAmount: totalAmount,
            status: statuses[statusIndex],
            pickupTime: new Date(orderDate.getTime() + 30 * 60000).toISOString(),
            deliveryAddress: addresses[addressIndex],
            notes: Math.random() > 0.7 ? '不要加辣' : (Math.random() > 0.5 ? '需要餐具' : ''),
            createdAt: orderDate.toISOString(),
            confirmedAt: statuses[statusIndex] !== 'pending' ? new Date(orderDate.getTime() + 5 * 60000).toISOString() : null
        });
    }
    
    return orders.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
};

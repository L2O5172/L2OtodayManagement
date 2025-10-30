import { Order, OrderItem, OrderStatus } from '../types';
import { MENU_ITEMS } from '../utils/testData';

const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxR1gzQgV1jq8DUhYX8EY0EmA6i2PBnjo_IZJUuwRgj7Ggjgro8Mdbnic7ZdhIIc2B1/exec';

// Create a menu map for quick lookups to parse order items string from backend
const menuMap = new Map<string, { price: number; icon: string }>();
MENU_ITEMS.forEach(item => {
    menuMap.set(item.name, { price: item.price, icon: item.icon });
});

const parseOrderItems = (itemsString: string): OrderItem[] => {
    if (!itemsString || typeof itemsString !== 'string') return [];
    const items: OrderItem[] = [];
    const itemParts = itemsString.split(', ');

    for (const part of itemParts) {
        const match = part.match(/(.+) x(\d+)/);
        if (match) {
            const [, name, quantityStr] = match;
            const quantity = parseInt(quantityStr, 10);
            const menuItem = menuMap.get(name.trim());

            if (menuItem) {
                items.push({
                    name: name.trim(),
                    quantity,
                    price: menuItem.price,
                    icon: menuItem.icon,
                });
            } else {
                items.push({ // Fallback for items not in the static menu
                    name: name.trim(),
                    quantity,
                    price: 0,
                    icon: '❓',
                });
            }
        }
    }
    return items;
};


export const apiService = {
    getAllOrders: async (): Promise<{ success: boolean; data: Order[] }> => {
        try {
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain;charset=utf-8', // Apps Script requires this header for POST
                },
                body: JSON.stringify({ action: 'getOrders' }),
            });

            if (!response.ok) {
                throw new Error(`Network response was not ok: ${response.statusText}`);
            }

            const result = await response.json();
            
            if (!result.success) {
                throw new Error(result.message || 'Failed to fetch orders from backend.');
            }
            
            // Map backend data to frontend Order type
            const mappedData: Order[] = result.data.map((order: any) => ({
                orderId: order.orderId,
                customerName: order.customerName,
                customerPhone: order.customerPhone,
                items: parseOrderItems(order.items),
                totalAmount: Number(order.totalAmount),
                status: order.status as OrderStatus,
                pickupTime: order.pickupTime,
                deliveryAddress: order.deliveryAddress,
                notes: order.notes,
                createdAt: order.createdAt,
                confirmedAt: null, // Backend doesn't provide this, setting to null
                adminNotes: order.adminNotes,
            })).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

            return {
                success: true,
                data: mappedData,
            };
        } catch (error) {
            console.error('API 請求失敗:', error);
            // On failure, return an empty array to prevent app crash
            return { success: false, data: [] };
        }
    },

    confirmOrder: async (orderId: string, adminNotes: string): Promise<{ success: boolean; message: string }> => {
        try {
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                    action: 'confirmOrder',
                    orderId,
                    adminNotes,
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`網路回應錯誤: ${response.status} ${errorText}`);
            }
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.message || '後端確認訂單失敗');
            }
            return { success: true, message: result.message || '訂單確認成功' };
        } catch (error) {
            console.error('確認訂單 API 失敗:', error);
            throw error; // Rethrow to be caught by the component
        }
    },

    updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<{ success: boolean; message: string }> => {
        try {
            const response = await fetch(SCRIPT_URL, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                    action: 'updateOrderStatus',
                    orderId,
                    status,
                }),
            });
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`網路回應錯誤: ${response.status} ${errorText}`);
            }
            const result = await response.json();
            if (!result.success) {
                throw new Error(result.message || '後端更新狀態失敗');
            }
            return { success: true, message: result.message ||'狀態更新成功' };
        } catch (error) {
            console.error('更新狀態 API 失敗:', error);
            throw error; // Rethrow to be caught by the component
        }
    }
};

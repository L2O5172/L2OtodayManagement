import { API_ENDPOINT } from '../constants';
import type { Order, ApiResponse, OrderStatus } from '../types';

export const apiService = {
    getAllOrders: async (): Promise<ApiResponse<Order[]>> => {
        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                // Using text/plain helps bypass potential CORS preflight issues with Google Apps Script.
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({ action: 'getOrders' }),
                redirect: 'follow',
            });
            
            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}. Response: ${errorText}`);
            }
            
            const text = await response.text();
            return JSON.parse(text) as ApiResponse<Order[]>;
        } catch (error) {
            console.error('Failed to fetch all orders:', error);
            const message = error instanceof Error ? error.message : 'An unknown network error occurred. Please check your connection or the backend script.';
            return { success: false, data: [], message };
        }
    },

    updateOrderStatus: async (orderId: string, status: OrderStatus): Promise<ApiResponse<{ orderId: string; status: OrderStatus }>> => {
        try {
            const response = await fetch(API_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'text/plain;charset=utf-8' },
                body: JSON.stringify({
                    action: 'updateOrderStatus',
                    orderId: orderId,
                    status: status
                }),
                redirect: 'follow',
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`HTTP error! status: ${response.status}, message: ${errorText}`);
            }

            const text = await response.text();
            const result = JSON.parse(text);

            if (!result.success) {
                throw new Error(result.message || 'Backend returned an error.');
            }

            return result as ApiResponse<{ orderId: string; status: OrderStatus }>;

        } catch (error) {
            console.error(`Failed to update order ${orderId}:`, error);
            const message = error instanceof Error ? error.message : 'An unknown network error occurred.';
            return { success: false, data: { orderId, status }, message };
        }
    }
};
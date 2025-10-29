
export interface MenuItem {
  name: string;
  price: number;
  icon: string;
}

export interface OrderItem extends MenuItem {
  quantity: number;
}

export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface Order {
  orderId: string;
  customerName: string;
  customerPhone: string;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  pickupTime: string;
  deliveryAddress: string;
  notes: string;
  createdAt: string;
  confirmedAt: string | null;
  adminNotes?: string;
}

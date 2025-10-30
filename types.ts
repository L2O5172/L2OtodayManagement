
export type OrderStatus = 'pending' | 'confirmed' | 'preparing' | 'ready' | 'completed' | 'cancelled';

export interface Order {
  orderId: string;
  customerName: string;
  customerPhone: string;
  items: string;
  totalAmount: number;
  pickupTime: string;
  deliveryAddress: string;
  notes: string;
  status: OrderStatus;
  createdAt: string;
  adminNotes: string;
  updatedAt: string;
}

export interface MenuItem {
  name: string;
  price: number;
  icon: string;
  status: string;
  image: string;
}

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface NotificationState {
  message: string;
  type: NotificationType;
  visible: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

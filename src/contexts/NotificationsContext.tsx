'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { usePusher } from '@/hooks/usePusher';
import { toast } from 'sonner';

export interface Notification {
  id: string;
  type: 'new_order' | 'order_status' | 'info';
  title: string;
  message: string;
  timestamp: Date;
  read: boolean;
  data?: any;
}

interface NotificationsContextType {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearNotifications: () => void;
}

const NotificationsContext = createContext<NotificationsContextType | null>(null);

const MAX_NOTIFICATIONS = 20;

export function NotificationsProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const { data: session } = useSession();
  const cafeId = session?.user?.cafeId || null;
  const { channel, isConnected } = usePusher(cafeId);

  const addNotification = useCallback((notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: Notification = {
      ...notification,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };

    setNotifications(prev => {
      const updated = [newNotification, ...prev];
      // Keep only the last MAX_NOTIFICATIONS
      return updated.slice(0, MAX_NOTIFICATIONS);
    });

    // Also show a toast for immediate feedback
    if (notification.type === 'new_order') {
      toast.success(notification.title, {
        description: notification.message,
      });
    }
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  // Listen for Pusher events
  useEffect(() => {
    if (!channel || !isConnected) return;

    // New order event
    const handleNewOrder = (data: any) => {
      addNotification({
        type: 'new_order',
        title: 'New Order Received!',
        message: `Order #${data.orderNumber} from ${data.customerName} - ₹${data.total}`,
        data,
      });
    };

    // Order status update event
    const handleStatusUpdate = (data: any) => {
      addNotification({
        type: 'order_status',
        title: 'Order Status Updated',
        message: `Order #${data.orderNumber} is now ${data.status}`,
        data,
      });
    };

    channel.bind('new-order', handleNewOrder);
    channel.bind('order-status-updated', handleStatusUpdate);

    return () => {
      channel.unbind('new-order', handleNewOrder);
      channel.unbind('order-status-updated', handleStatusUpdate);
    };
  }, [channel, isConnected, addNotification]);

  return (
    <NotificationsContext.Provider
      value={{
        notifications,
        unreadCount,
        addNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
      }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationsContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationsProvider');
  }
  return context;
}



import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
// Fix: Added .ts extension to the import path.
import type { Notification, User } from '../types.ts';

interface NotificationContextType {
    isPanelOpen: boolean;
    togglePanel: () => void;
    notifications: Notification[];
    addNotification: (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;
    markAsRead: (notificationId: string) => void;
    markAllAsRead: (userId: string) => void;
    getPersonalizedValues: (user: User | null) => {
        notifications: Notification[];
        unreadCount: number;
    };
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [isPanelOpen, setIsPanelOpen] = useState(false);

    const togglePanel = () => {
        setIsPanelOpen(prev => !prev);
    };

    const addNotification = useCallback((notificationData: Omit<Notification, 'id' | 'read' | 'createdAt'>) => {
        const newNotification: Notification = {
            ...notificationData,
            id: `notif-${Date.now()}-${Math.random()}`,
            read: false,
            createdAt: new Date(),
        };
        setNotifications(prev => [newNotification, ...prev]);
    }, []);

    const markAsRead = useCallback((notificationId: string) => {
        setNotifications(prev =>
            prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
        );
    }, []);
    
    const markAllAsRead = useCallback((userId: string) => {
        setNotifications(prev => 
            prev.map(n => (n.recipient === userId && !n.read ? { ...n, read: true } : n))
        );
    }, []);

    const getPersonalizedValues = useCallback((user: User | null) => {
        if (!user) {
            return { notifications: [], unreadCount: 0 };
        }
        const userId = user.role === 'admin' ? 'admin' : user.id;
        const userNotifications = notifications.filter(n => n.recipient === userId);
        const userUnreadCount = userNotifications.filter(n => !n.read).length;
        
        return { notifications: userNotifications, unreadCount: userUnreadCount };
    }, [notifications]);


    return (
        <NotificationContext.Provider value={{ isPanelOpen, togglePanel, notifications, addNotification, markAsRead, markAllAsRead, getPersonalizedValues }}>
            {children}
        </NotificationContext.Provider>
    );
};

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (!context) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};

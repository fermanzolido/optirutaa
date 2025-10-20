
import React from 'react';
// Fix: Added .tsx extension to the import path.
import { useNotifications } from '../contexts/NotificationContext.tsx';
// Fix: Added .ts extension to the import path.
import type { Notification, User } from '../types.ts';
import { X, CheckCheck, Info, PackageCheck, AlertTriangle, Bell } from 'lucide-react';

const NotificationIcon: React.FC<{ type: Notification['type'] }> = ({ type }) => {
    switch (type) {
        case 'success':
            return <PackageCheck className="h-5 w-5 text-green-500" />;
        case 'info':
            return <Info className="h-5 w-5 text-blue-500" />;
        case 'warning':
            return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
        default:
            return <Bell className="h-5 w-5 text-[var(--color-text-main)]" />;
    }
};


interface NotificationPanelProps {
    user: User | null;
}

export const NotificationPanel: React.FC<NotificationPanelProps> = ({ user }) => {
    const { isPanelOpen, togglePanel, getPersonalizedValues, markAsRead, markAllAsRead } = useNotifications();
    
    if (!user) return null;
    
    const currentUserId = user.role === 'admin' ? 'admin' : user.id;
    const { notifications, unreadCount } = getPersonalizedValues(user);
    const sortedNotifications = [...notifications].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    const handleMarkAllRead = (e: React.MouseEvent) => {
        e.stopPropagation();
        markAllAsRead(currentUserId);
    };

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 bg-black/30 backdrop-blur-sm z-40 transition-opacity duration-300 ${isPanelOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
                onClick={togglePanel}
            />

            {/* Panel */}
            <div
                className={`fixed top-0 right-0 h-full w-full max-w-sm bg-[var(--color-surface)] z-50 shadow-[-10px_0px_20px_var(--color-shadow-dark)] 
                           transform transition-transform duration-300 ease-in-out flex flex-col border-l border-[var(--color-border)]
                           ${isPanelOpen ? 'translate-x-0' : 'translate-x-full'}`}
            >
                {/* Header */}
                <div className="p-4 flex justify-between items-center border-b border-[var(--color-border)] flex-shrink-0">
                    <h3 className="text-xl font-semibold text-[var(--color-text-strong)]">Notificaciones</h3>
                    <button onClick={togglePanel} className="p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-strong)] transition rounded-full hover:bg-[var(--color-bg)]">
                        <X size={24} />
                    </button>
                </div>

                {/* Mark all as read button */}
                 {unreadCount > 0 && (
                    <div className="p-2 border-b border-[var(--color-border)] flex-shrink-0">
                        <button onClick={handleMarkAllRead} className="w-full text-xs font-medium text-[var(--color-primary)] hover:underline flex items-center justify-center p-2">
                            <CheckCheck size={14} className="mr-1" />
                            Marcar todas como leídas
                        </button>
                    </div>
                )}


                {/* Notification List */}
                <div className="flex-grow overflow-y-auto">
                    {sortedNotifications.length > 0 ? (
                        sortedNotifications.map(notification => (
                            <div
                                key={notification.id}
                                className={`p-4 border-b border-[var(--color-border)] flex items-start gap-4 hover:bg-[var(--color-bg)] transition-colors cursor-pointer ${!notification.read ? 'bg-[var(--color-primary)] bg-opacity-[0.07]' : ''}`}
                                onClick={() => markAsRead(notification.id)}
                            >
                                <div className="flex-shrink-0 mt-1 p-2 bg-[var(--color-bg)] rounded-full shadow-sm">
                                    <NotificationIcon type={notification.type} />
                                </div>
                                <div className="flex-grow">
                                    <p className="font-semibold text-sm text-[var(--color-text-strong)]">{notification.title}</p>
                                    <p className="text-xs text-[var(--color-text-main)] mt-0.5">{notification.message}</p>
                                    <p className="text-[10px] text-[var(--color-text-muted)] mt-1.5">{new Date(notification.createdAt).toLocaleString()}</p>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center">
                            <Bell size={48} className="text-[var(--color-text-muted)] opacity-50 mb-4" />
                            <p className="font-semibold text-[var(--color-text-strong)]">Todo está tranquilo</p>
                            <p className="text-sm text-[var(--color-text-main)]">No tienes notificaciones nuevas.</p>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
};


import React from 'react';
import { User, Bell, Menu } from 'lucide-react';
// Fix: Added .ts extension to the import path.
import { User as UserType } from '../types.ts';
// Fix: Added .tsx extension to the import path.
import { useNotifications } from '../contexts/NotificationContext.tsx';

interface HeaderProps {
    user: UserType;
    onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onMenuClick }) => {
    const { getPersonalizedValues, togglePanel } = useNotifications();
    const { unreadCount } = getPersonalizedValues(user);

    return (
        <header className="relative bg-transparent p-4 flex justify-between items-center z-20">
            <div className="flex items-center">
                <button 
                    onClick={onMenuClick} 
                    className="lg:hidden text-[var(--color-text-main)] hover:text-[var(--color-primary)] mr-4 p-2 rounded-full hover:bg-[var(--color-surface)] hover:shadow-[2px_2px_4px_var(--color-shadow-dark),_-2px_-2px_4px_var(--color-shadow-light)] transition-all duration-200"
                    aria-label="Abrir menú lateral"
                >
                    <Menu size={24} />
                </button>
                <h1 className="hidden sm:block text-lg sm:text-xl font-bold text-[var(--color-text-strong)]">Panel de Control OptiRuta</h1>
            </div>
            <div className="flex items-center space-x-4">
                <div className="relative">
                    <button 
                        onClick={togglePanel} 
                        className="relative text-[var(--color-text-main)] hover:text-[var(--color-primary)] p-2 rounded-full hover:bg-[var(--color-surface)] hover:shadow-[2px_2px_4px_var(--color-shadow-dark),_-2px_-2px_4px_var(--color-shadow-light)] transition-all duration-200"
                        aria-label={`Ver notificaciones (${unreadCount} no leídas)`}
                    >
                        <Bell size={20} />
                        {unreadCount > 0 && (
                            <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-xs font-bold text-white" aria-hidden="true">
                                {unreadCount}
                            </span>
                        )}
                    </button>
                </div>
                <div className="flex items-center space-x-2 p-2 rounded-full bg-[var(--color-surface)] shadow-[2px_2px_4px_var(--color-shadow-dark),_-2px_-2px_4px_var(--color-shadow-light)]">
                    <User size={20} className="text-[var(--color-text-main)]" />
                    <span className="hidden sm:inline text-sm font-medium text-[var(--color-text-strong)] pr-2">{user.name}</span>
                </div>
            </div>
        </header>
    );
};
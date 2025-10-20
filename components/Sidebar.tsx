

import React, { useState, useRef, useEffect } from 'react';
import { LayoutDashboard, Package, BarChart3, MessageSquare, Route, Bot, LogOut, Users, Palette, Check, SlidersHorizontal, History } from 'lucide-react';
// Fix: Added .ts extension to the import path.
import type { User, View } from '../types.ts';
// Fix: Added .tsx extension to the import path.
import { useTheme } from '../contexts/ThemeContext.tsx';

interface SidebarProps {
  user: User;
  view: View;
  setView: (view: View) => void;
  onLogout: () => void;
  isSidebarOpen: boolean;
  setIsSidebarOpen: (isOpen: boolean) => void;
}

interface NavItemProps {
  icon: React.ElementType;
  label: string;
  isActive: boolean;
  onClick: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, label, isActive, onClick }) => (
  <li>
    <a
      href="#"
      onClick={(e) => { e.preventDefault(); onClick(); }}
      className={`flex items-center p-3 text-base font-medium rounded-xl transition-all duration-200 group ${
        isActive
          ? 'text-[var(--color-primary)] shadow-[inset_3px_3px_7px_var(--color-shadow-dark),_-inset_-3px_-3px_7px_var(--color-shadow-light)] font-semibold'
          : 'text-[var(--color-text-strong)] hover:shadow-[3px_3px_7px_var(--color-shadow-dark),_-3px_-3px_7px_var(--color-shadow-light)] hover:bg-[var(--color-surface)]'
      }`}
    >
      <Icon className={`h-6 w-6 transition duration-75 ${isActive ? 'text-[var(--color-primary)]' : 'text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]'}`} />
      <span className="ml-3 flex-1 whitespace-nowrap">{label}</span>
    </a>
  </li>
);

const ThemeSelector: React.FC = () => {
  const { theme, setTheme } = useTheme();
  const [isOpen, setIsOpen] = useState(false);
  const themes = [
    { name: 'light', label: 'Claro', color: '#e0e5ec' },
    { name: 'dark', label: 'Oscuro', color: '#26344a' },
    { name: 'mint', label: 'Menta', color: '#e6fcf5' },
    { name: 'lavender', label: 'Lavanda', color: '#f0edff' },
    { name: 'peach', label: 'Durazno', color: '#fff3e6' },
  ];
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={menuRef}>
      <a
        href="#"
        onClick={(e) => { e.preventDefault(); setIsOpen(!isOpen); }}
        className="flex items-center p-3 text-base font-medium rounded-xl transition-all duration-200 group text-[var(--color-text-strong)] hover:shadow-[3px_3px_7px_var(--color-shadow-dark),_-3px_-3px_7px_var(--color-shadow-light)] hover:bg-[var(--color-surface)]"
      >
        <Palette className="h-6 w-6 text-[var(--color-text-muted)] group-hover:text-[var(--color-primary)]" />
        <span className="ml-3 flex-1 whitespace-nowrap">Cambiar Tema</span>
      </a>
      {isOpen && (
        <div className="absolute bottom-full mb-2 w-full bg-[var(--color-surface)] rounded-xl shadow-[3px_3px_7px_var(--color-shadow-dark),_-3px_-3px_7px_var(--color-shadow-light)] p-2 space-y-1 border border-[var(--color-border)]">
          {themes.map(t => (
            <button
              key={t.name}
              onClick={() => { setTheme(t.name); setIsOpen(false); }}
              className={`w-full flex items-center justify-between text-left p-2 rounded-lg text-sm text-[var(--color-text-strong)] hover:bg-[var(--color-bg)] ${theme === t.name ? 'font-semibold' : ''}`}
            >
              <div className="flex items-center">
                <div className="w-4 h-4 rounded-full mr-2 border border-[var(--color-border)]" style={{ backgroundColor: t.color }}></div>
                {t.label}
              </div>
              {theme === t.name && <Check size={16} className="text-[var(--color-primary)]" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const Sidebar: React.FC<SidebarProps> = ({ user, view, setView, onLogout, isSidebarOpen, setIsSidebarOpen }) => {
  const adminNavItems = [
    { id: 'dashboard', label: 'Centro de Mando', icon: LayoutDashboard },
    { id: 'orders', label: 'Pedidos', icon: Package },
    { id: 'drivers', label: 'Conductores', icon: Users },
    { id: 'analytics', label: 'Analíticas', icon: BarChart3 },
    { id: 'messages', label: 'Mensajes', icon: MessageSquare },
    { id: 'settings', label: 'Configuraciones', icon: SlidersHorizontal },
  ];

  const driverNavItems = [
    { id: 'copilot', label: 'Mi Ruta & Co-Piloto', icon: Bot },
    { id: 'history', label: 'Mi Historial', icon: History },
    { id: 'messages', label: 'Mensajes', icon: MessageSquare },
  ];
  
  const navItems = user.role === 'admin' ? adminNavItems : driverNavItems;

  const handleNavClick = (selectedView: View) => {
    setView(selectedView);
    setIsSidebarOpen(false);
  }
  
  const handleLogoutClick = () => {
    onLogout();
    setIsSidebarOpen(false);
  }

  return (
    <>
        {isSidebarOpen && <div className="fixed inset-0 z-20 bg-black/50 lg:hidden" onClick={() => setIsSidebarOpen(false)} />}
        <aside className={`fixed top-0 left-0 h-full w-64 z-30 transform transition-transform duration-300 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0`} aria-label="Sidebar">
            <div className="flex flex-col h-full overflow-y-auto bg-[var(--color-surface)] p-4 shadow-[5px_0_15px_var(--color-shadow-dark)]">
                <div className="flex items-center mb-6 p-2">
                <Route size={32} className="text-[var(--color-primary)]" />
                <span className="self-center text-xl font-semibold whitespace-nowrap ml-3 text-[var(--color-text-strong)]">OptiRuta</span>
                </div>
                <ul className="space-y-2 flex-grow">
                {navItems.map(item => (
                    <NavItem
                    key={item.id}
                    label={item.label}
                    icon={item.icon}
                    isActive={view === item.id}
                    onClick={() => handleNavClick(item.id as View)}
                    />
                ))}
                </ul>
                <div className="mt-4 pt-4 border-t border-[var(--color-border)] space-y-2">
                {user.role === 'admin' && <ThemeSelector />}
                <NavItem icon={LogOut} label="Cerrar Sesión" isActive={false} onClick={handleLogoutClick} />
                </div>
            </div>
        </aside>
    </>
  );
};
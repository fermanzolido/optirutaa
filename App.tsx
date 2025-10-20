import React, { useState } from 'react';
// Fix: Added .ts extension to the import path.
import type { User, View, Order } from './types.ts';
// Fix: Added .ts extension to the import path.
import { useFleetData } from './hooks/useFleetData.ts';
// Fix: Added .tsx extension to the import path.
import { ThemeProvider } from './contexts/ThemeContext.tsx';
// Fix: Added .tsx extension to the import path.
import { NotificationProvider, useNotifications } from './contexts/NotificationContext.tsx';
// Fix: Added .tsx extension to the import path.
import { LoginScreen } from './components/LoginScreen.tsx';
// Fix: Added .tsx extension to the import path.
import { Sidebar } from './components/Sidebar.tsx';
// Fix: Added .tsx extension to the import path.
import { Header } from './components/Header.tsx';
// Fix: Added .tsx extension to the import path.
import { CommandCenter } from './components/CommandCenter.tsx';
// Fix: Added .tsx extension to the import path.
import { OrderManagement } from './components/OrderManagement.tsx';
// Fix: Added .tsx extension to the import path.
import { AnalyticsDashboard } from './components/AnalyticsDashboard.tsx';
// Fix: Added .tsx extension to the import path.
import { DriverManagement } from './components/DriverManagement.tsx';
// Fix: Added .tsx extension to the import path.
import { CommunicationCenter } from './components/CommunicationCenter.tsx';
// Fix: Added .tsx extension to the import path.
import { Settings } from './components/Settings.tsx';
// Fix: Added .tsx extension to the import path.
import { DriverCoPilot } from './components/DriverCoPilot.tsx';
// Fix: Added .tsx extension to the import path.
import { CustomerTrackingPortal } from './components/CustomerTrackingPortal.tsx';
// Fix: Added .tsx extension to the import path.
import { NotificationPanel } from './components/NotificationPanel.tsx';
// Fix: Added .tsx extension to the import path.
import { DriverHistory } from './components/DriverHistory.tsx';
import './index.css';

const AppContent: React.FC = () => {
    const [currentUser, setCurrentUser] = useState<User | null>(null);
    const [view, setView] = useState<View>('dashboard');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [trackingOrder, setTrackingOrder] = useState<Order | null>(null);

    const { addNotification } = useNotifications();

    const fleetData = useFleetData(addNotification, currentUser);

    const handleLogin = (user: User) => {
        setCurrentUser(user);
        if (user.role === 'driver') {
            setView('copilot');
        } else {
            setView('dashboard');
        }
    };

    const handleLogout = () => {
        setCurrentUser(null);
        setView('dashboard');
    };
    
    const handleCreateOrder = (orderData: Omit<Order, 'id' | 'createdAt' | 'status' | 'assignedDriverId' | 'deliveryLocation' | 'pickupLocation' | 'pod' | 'deliveredAt' | 'rating' | 'customerInstructions'>) => {
        const newOrder = fleetData.addOrder(orderData);
        setTrackingOrder(newOrder);
        addNotification({
            recipient: 'admin',
            type: 'info',
            title: 'Nuevo Pedido Creado',
            message: `El cliente ${newOrder.customerName} ha creado el pedido #${newOrder.id}.`
        });
    };

    const handleTrackOrder = (orderId: string): boolean => {
        const order = fleetData.orders.find(o => o.id.toLowerCase() === orderId.toLowerCase());
        if (order) {
            setTrackingOrder(order);
            return true;
        }
        return false;
    };
    
    const renderView = () => {
        if (!currentUser) {
            if (trackingOrder) {
                const driver = trackingOrder.assignedDriverId ? fleetData.drivers.find(d => d.id === trackingOrder.assignedDriverId) ?? null : null;
                return <CustomerTrackingPortal order={trackingOrder} driver={driver} onBack={() => setTrackingOrder(null)} onRateDelivery={fleetData.rateDelivery} onAddInstruction={fleetData.addCustomerInstruction} />;
            }
            return <LoginScreen onLogin={handleLogin} onCreateOrder={handleCreateOrder} onRegisterDriver={fleetData.registerDriver} onTrackOrder={handleTrackOrder} drivers={fleetData.drivers} />;
        }

        if (currentUser.role === 'admin') {
            switch (view) {
                case 'dashboard': return <CommandCenter orders={fleetData.orders} drivers={fleetData.drivers} assignOrder={fleetData.assignOrder} optimizeRoute={fleetData.optimizeRoute} performSmartAssignment={fleetData.performSmartAssignment} addNotification={addNotification} />;
                case 'orders': return <OrderManagement orders={fleetData.orders} addOrder={fleetData.addOrder} addBulkOrders={fleetData.addBulkOrders} updateOrderStatus={fleetData.updateOrderStatus} />;
                case 'drivers': return <DriverManagement drivers={fleetData.drivers} auditLogs={fleetData.auditLogs} driverStatusLogs={fleetData.driverStatusLogs} onApprove={fleetData.approveDriver} onReject={fleetData.rejectDriver} onDelete={fleetData.deleteDriver} />;
                case 'analytics': return <AnalyticsDashboard orders={fleetData.orders} drivers={fleetData.drivers} />;
                case 'messages': return <CommunicationCenter user={currentUser} drivers={fleetData.drivers} messages={fleetData.messages} sendMessage={fleetData.sendMessage} />;
                case 'settings': return <Settings />;
                default: return <CommandCenter orders={fleetData.orders} drivers={fleetData.drivers} assignOrder={fleetData.assignOrder} optimizeRoute={fleetData.optimizeRoute} performSmartAssignment={fleetData.performSmartAssignment} addNotification={addNotification} />;
            }
        }

        if (currentUser.role === 'driver') {
            const driver = fleetData.drivers.find(d => d.id === currentUser.id);
            if (!driver) return <div>Error: Driver not found.</div>;
            const driverOrders = fleetData.orders.filter(o => o.assignedDriverId === driver.id);

            switch (view) {
                case 'copilot': return <DriverCoPilot driver={driver} orders={driverOrders} onSubmitPod={fleetData.submitPod} sendMessage={fleetData.sendMessage} optimizeRoute={fleetData.optimizeRoute} />;
                case 'history': return <DriverHistory driver={driver} driverStatusLogs={fleetData.driverStatusLogs} />;
                case 'messages': return <CommunicationCenter user={currentUser} drivers={fleetData.drivers} messages={fleetData.messages} sendMessage={fleetData.sendMessage} />;
                default: return <DriverCoPilot driver={driver} orders={driverOrders} onSubmitPod={fleetData.submitPod} sendMessage={fleetData.sendMessage} optimizeRoute={fleetData.optimizeRoute} />;
            }
        }
    };
    
    if (!currentUser && !trackingOrder) {
        return <LoginScreen onLogin={handleLogin} onCreateOrder={handleCreateOrder} onRegisterDriver={fleetData.registerDriver} onTrackOrder={handleTrackOrder} drivers={fleetData.drivers} />;
    }
    
    if (trackingOrder && !currentUser) {
        const driver = trackingOrder.assignedDriverId ? fleetData.drivers.find(d => d.id === trackingOrder.assignedDriverId) ?? null : null;
        return <CustomerTrackingPortal order={trackingOrder} driver={driver} onBack={() => setTrackingOrder(null)} onRateDelivery={fleetData.rateDelivery} onAddInstruction={fleetData.addCustomerInstruction} />;
    }

    return (
        <div className="flex h-screen bg-[var(--color-bg)] text-[var(--color-text-main)] font-sans">
            {currentUser && <Sidebar user={currentUser} view={view} setView={setView} onLogout={handleLogout} isSidebarOpen={isSidebarOpen} setIsSidebarOpen={setIsSidebarOpen} />}
            <main className="flex-1 flex flex-col transition-all duration-300 lg:ml-64">
                {currentUser && <Header user={currentUser} onMenuClick={() => setIsSidebarOpen(true)} />}
                <div className="flex-grow p-4 sm:p-6 overflow-y-auto">
                    {renderView()}
                </div>
            </main>
            {currentUser && <NotificationPanel user={currentUser} />}
        </div>
    );
}

const App: React.FC = () => {
    return (
        <ThemeProvider>
            <NotificationProvider>
                <AppContent />
            </NotificationProvider>
        </ThemeProvider>
    );
};

export default App;
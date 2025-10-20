
import React, { useState, useMemo } from 'react';
// Fix: Added .ts extension to the import path.
import type { Order, Driver, Notification } from '../types.ts';
// Fix: Added .ts extension to the import path.
import { OrderStatus, DriverStatus } from '../types.ts';
// Fix: Added .tsx extension to the import path.
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card.tsx';
// Fix: Added .tsx extension to the import path.
import { FleetMap } from './FleetMap.tsx';
import { Route, UserCheck, GripVertical, Bot, Loader } from 'lucide-react';
// Fix: Added .tsx extension to the import path.
import { useNotifications } from '../contexts/NotificationContext.tsx';

type AddNotificationFn = (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;

interface CommandCenterProps {
  orders: Order[];
  drivers: Driver[];
  assignOrder: (orderId: string, driverId: string) => void;
  optimizeRoute: (driverId: string) => void;
  performSmartAssignment: () => Promise<void>;
  addNotification: AddNotificationFn;
}

const OrderCard: React.FC<{ 
    order: Order; 
    isDragging: boolean;
    onDragStart: (e: React.DragEvent<HTMLDivElement>, orderId: string) => void;
    onDragEnd: (e: React.DragEvent<HTMLDivElement>) => void;
}> = React.memo(({ order, isDragging, onDragStart, onDragEnd }) => (
    <div
        draggable
        onDragStart={(e) => onDragStart(e, order.id)}
        onDragEnd={onDragEnd}
        className={`flex items-center p-3 bg-[var(--color-surface)] rounded-xl shadow-[4px_4px_8px_var(--color-shadow-dark),_-4px_-4px_8px_var(--color-shadow-light)] cursor-grab active:cursor-grabbing transition-all duration-200 ${isDragging ? 'opacity-50 scale-95 shadow-[inset_2px_2px_4px_var(--color-shadow-dark),_-inset_-2px_-2px_4px_var(--color-shadow-light)]' : 'hover:scale-[1.02]'}`}
    >
        <GripVertical className="h-5 w-5 text-[var(--color-text-muted)] mr-3 flex-shrink-0" />
        <div className="flex-1 overflow-hidden">
            <p className="font-semibold text-[var(--color-text-strong)] truncate">#{order.id} - {order.customerName}</p>
            <p className="text-sm text-[var(--color-text-main)] truncate">{order.deliveryAddress}</p>
        </div>
    </div>
));

const DriverCard: React.FC<{ 
    driver: Driver; 
    optimizeRoute: (driverId: string) => void; 
    orderCount: number; 
    isDropTarget: boolean;
    onDragEnter: () => void;
    onDragLeave: () => void;
    onDragOver: (e: React.DragEvent<HTMLDivElement>) => void;
    onDrop: (e: React.DragEvent<HTMLDivElement>) => void;
}> = React.memo(({ driver, optimizeRoute, orderCount, isDropTarget, onDragEnter, onDragLeave, onDragOver, onDrop }) => (
    <div 
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onDragOver={onDragOver}
        onDrop={onDrop}
        className={`p-3 bg-[var(--color-surface)] rounded-xl flex justify-between items-center transition-all duration-300 ${isDropTarget ? 'scale-105 shadow-[inset_4px_4px_8px_var(--color-shadow-dark),_-inset_-4px_-4px_8px_var(--color-shadow-light)] ring-2 ring-[var(--color-primary)]' : 'shadow-[4px_4px_8px_var(--color-shadow-dark),_-4px_-4px_8px_var(--color-shadow-light)]'}`}
    >
        <div className="flex-1 overflow-hidden">
            <p className="font-semibold text-[var(--color-text-strong)] truncate">{driver.name}</p>
            <p className="text-sm text-[var(--color-text-main)]">{orderCount} {orderCount === 1 ? 'pedido' : 'pedidos'} en curso</p>
        </div>
        <button 
            onClick={() => optimizeRoute(driver.id)} 
            className="p-2 ml-2 text-[var(--color-primary)] rounded-full bg-[var(--color-surface)] shadow-[3px_3px_5px_var(--color-shadow-dark),_-3px_-3px_5px_var(--color-shadow-light)] active:shadow-[inset_1px_1px_2px_var(--color-shadow-dark),_-inset_-1px_-1px_2px_var(--color-shadow-light)] transition-all"
            title="Optimizar Ruta"
            aria-label={`Optimizar ruta para ${driver.name}`}
        >
            <Route size={18} />
        </button>
    </div>
));


export const CommandCenter: React.FC<CommandCenterProps> = ({ orders, drivers, assignOrder, optimizeRoute, performSmartAssignment, addNotification }) => {
    const [draggedOrderId, setDraggedOrderId] = useState<string | null>(null);
    const [draggedOverDriverId, setDraggedOverDriverId] = useState<string | null>(null);
    const [isAssigning, setIsAssigning] = useState(false);
    const { isPanelOpen } = useNotifications();

    const pendingOrders = useMemo(() => orders.filter(o => o.status === OrderStatus.Pending), [orders]);
    const onlineDrivers = useMemo(() => drivers.filter(d => d.status === DriverStatus.Online), [drivers]);

    const handleDragStart = (e: React.DragEvent<HTMLDivElement>, orderId: string) => {
        e.dataTransfer.setData('text/plain', orderId);
        setTimeout(() => {
            setDraggedOrderId(orderId);
        }, 0);
    };

    const handleDragEnd = () => {
        setDraggedOrderId(null);
        setDraggedOverDriverId(null);
    };

    const handleDropOrderOnDriver = (orderId: string, driverId: string) => {
        assignOrder(orderId, driverId);
        handleDragEnd();
    };
    
    // Fix: Refactored to remove API key handling and use NotificationContext for errors.
    const handleSmartAssign = async () => {
        setIsAssigning(true);
        try {
            await performSmartAssignment();
        } catch (error) {
            addNotification({
                recipient: 'admin',
                type: 'warning',
                title: 'Error de Asignación Inteligente',
                message: error instanceof Error ? error.message : 'No se pudo conectar con el servicio de IA.',
            });
        } finally {
            setIsAssigning(false);
        }
    };

    const driverOrderCounts = useMemo(() => {
        const counts: Record<string, number> = {};
        orders.forEach(order => {
            if (order.assignedDriverId && order.status === OrderStatus.InProgress) {
                counts[order.assignedDriverId] = (counts[order.assignedDriverId] || 0) + 1;
            }
        });
        return counts;
    }, [orders]);

    return (
        <div className="relative grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[calc(100vh-8rem)]">
            <div className={`lg:col-span-2 h-[320px] lg:h-full transition-all duration-300 ${isPanelOpen ? 'z-0' : 'z-10'}`}>
                <FleetMap 
                    drivers={drivers} 
                    orders={orders} 
                    onDropOrderOnDriver={handleDropOrderOnDriver}
                    draggedOverDriverId={draggedOverDriverId}
                    setDraggedOverDriverId={setDraggedOverDriverId}
                />
            </div>
            <div className="lg:col-span-1 flex flex-col gap-6 lg:overflow-y-auto no-scrollbar">
                <Card className="flex flex-col flex-shrink-0">
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <CardTitle>Pedidos Pendientes ({pendingOrders.length})</CardTitle>
                            {/* Fix: Simplified button state, removing API key dependency. */}
                            <button
                                onClick={handleSmartAssign}
                                disabled={isAssigning || pendingOrders.length === 0}
                                className="flex items-center text-sm font-semibold px-3 py-1.5 rounded-lg text-[var(--color-primary)] bg-[var(--color-surface)] shadow-[3px_3px_5px_var(--color-shadow-dark),_-3px_-3px_5px_var(--color-shadow-light)] active:shadow-[inset_1px_1px_2px_var(--color-shadow-dark),_-inset_-1px_-1px_2px_var(--color-shadow-light)] transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:text-[var(--color-text-muted)]"
                                title="Asignar pedidos con IA"
                            >
                                {isAssigning ? <Loader size={16} className="animate-spin mr-2" /> : <Bot size={16} className="mr-2" />}
                                {isAssigning ? 'Asignando...' : 'Asignación Inteligente'}
                            </button>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {pendingOrders.length > 0 ? (
                            pendingOrders.map(order => (
                                <OrderCard 
                                    key={order.id} 
                                    order={order} 
                                    isDragging={draggedOrderId === order.id}
                                    onDragStart={handleDragStart}
                                    onDragEnd={handleDragEnd} 
                                />
                            ))
                        ) : (
                            <p className="text-center text-[var(--color-text-main)] py-8">No hay pedidos pendientes.</p>
                        )}
                    </CardContent>
                </Card>
                <Card className="flex flex-col flex-shrink-0">
                    <CardHeader>
                         <CardTitle className="flex items-center">
                            <UserCheck className="mr-2 text-green-500"/>
                            Conductores en Línea ({onlineDrivers.length})
                         </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                        {onlineDrivers.length > 0 ? (
                            onlineDrivers.map(driver => (
                                <DriverCard 
                                    key={driver.id} 
                                    driver={driver} 
                                    optimizeRoute={optimizeRoute} 
                                    orderCount={driverOrderCounts[driver.id] || 0}
                                    isDropTarget={!!draggedOrderId && draggedOverDriverId === driver.id}
                                    onDragEnter={() => {
                                        if (draggedOrderId) setDraggedOverDriverId(driver.id);
                                    }}
                                    onDragLeave={() => {
                                        setDraggedOverDriverId(null);
                                    }}
                                    onDragOver={(e) => {
                                        if (draggedOrderId) e.preventDefault();
                                    }}
                                    onDrop={(e) => {
                                        e.preventDefault();
                                        const orderId = e.dataTransfer.getData('text/plain');
                                        if (orderId) {
                                            handleDropOrderOnDriver(orderId, driver.id);
                                        }
                                    }}
                                />
                            ))
                        ) : (
                            <p className="text-center text-[var(--color-text-main)] py-8">No hay conductores en línea.</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};
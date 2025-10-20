
import React, { useState, useMemo } from 'react';
// Fix: Added .ts extension to the import path.
import type { Order } from '../types.ts';
// Fix: Added .ts extension to the import path.
import { OrderStatus } from '../types.ts';
// Fix: Added .tsx extension to the import path.
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card.tsx';
import { PlusCircle, Search, Eye, PackageCheck, XCircle } from 'lucide-react';
// Fix: Added .tsx extension to the import path.
import { NewOrderModal } from './NewOrderModal.tsx';
// Fix: Added .tsx extension to the import path.
import { OrderDetailsModal } from './OrderDetailsModal.tsx';
// Fix: Added .tsx extension to the import path.
import { ConfirmationModal } from './ui/ConfirmationModal.tsx';

type NewOrderData = Omit<Order, 'id' | 'createdAt' | 'status' | 'assignedDriverId' | 'deliveryLocation' | 'pickupLocation' | 'pod' | 'deliveredAt' | 'rating' | 'customerInstructions'>;

interface OrderManagementProps {
  orders: Order[];
  addOrder: (newOrder: NewOrderData) => void;
  addBulkOrders: (newOrders: NewOrderData[]) => void;
  updateOrderStatus: (orderId: string, status: OrderStatus) => void;
}

const getStatusBadge = (status: OrderStatus) => {
    let colorClasses = '';
    switch (status) {
        case OrderStatus.Delivered: colorClasses = 'text-green-700 bg-green-100 dark:text-green-300 dark:bg-green-500/20'; break;
        case OrderStatus.InProgress: colorClasses = 'text-blue-700 bg-blue-100 dark:text-blue-300 dark:bg-blue-500/20'; break;
        case OrderStatus.Pending: colorClasses = 'text-yellow-700 bg-yellow-100 dark:text-yellow-300 dark:bg-yellow-500/20'; break;
        case OrderStatus.Failed: colorClasses = 'text-red-700 bg-red-100 dark:text-red-300 dark:bg-red-500/20'; break;
        default: colorClasses = 'text-gray-700 bg-gray-100 dark:text-gray-300 dark:bg-gray-500/20'; break;
    }
    return <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${colorClasses}`}>{status}</span>;
}

const OrderCardMobile: React.FC<{ 
    order: Order; 
    onViewDetails: () => void; 
    onUpdateStatus: (status: OrderStatus) => void; 
}> = ({ order, onViewDetails, onUpdateStatus }) => (
    <div className="p-4 bg-[var(--color-surface)] rounded-xl shadow-[4px_4px_8px_var(--color-shadow-dark),_-4px_-4px_8px_var(--color-shadow-light)]">
        <div className="flex justify-between items-start">
            <div>
                <p className="font-bold text-sm text-[var(--color-text-strong)]">{order.id}</p>
                <p className="text-xs text-[var(--color-text-main)]">{order.customerName}</p>
            </div>
            {getStatusBadge(order.status)}
        </div>
        <div className="mt-3 border-t border-[var(--color-border)] pt-3">
            <p className="text-sm text-[var(--color-text-main)]"><strong>Entrega:</strong> {order.deliveryAddress}</p>
            <p className="text-xs text-[var(--color-text-muted)] mt-1"><strong>Fecha:</strong> {new Date(order.createdAt).toLocaleDateString()}</p>
        </div>
        <div className="mt-3 flex items-center justify-end gap-2">
            {order.status === OrderStatus.InProgress && (
                <>
                    <button onClick={() => onUpdateStatus(OrderStatus.Delivered)} className="text-green-600 p-2 rounded-full hover:bg-white/50 dark:hover:bg-slate-700/50" title="Marcar como Entregado">
                        <PackageCheck size={18} />
                    </button>
                    <button onClick={() => onUpdateStatus(OrderStatus.Failed)} className="text-red-600 p-2 rounded-full hover:bg-white/50 dark:hover:bg-slate-700/50" title="Marcar como Fallido">
                        <XCircle size={18} />
                    </button>
                </>
            )}
            <button onClick={onViewDetails} className="text-[var(--color-primary)] p-2 rounded-full hover:bg-white/50 dark:hover:bg-slate-700/50" title="Ver Detalles">
                <Eye size={18} />
            </button>
        </div>
    </div>
);


export const OrderManagement: React.FC<OrderManagementProps> = ({ orders, addOrder, addBulkOrders, updateOrderStatus }) => {
    const [isNewOrderModalOpen, setIsNewOrderModalOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all');
    const [confirmation, setConfirmation] = useState<{ order: Order; status: OrderStatus } | null>(null);

    const filteredOrders = useMemo(() => {
        return orders.filter(order => {
            const matchesSearch = order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                  order.deliveryAddress.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
            return matchesSearch && matchesStatus;
        });
    }, [orders, searchTerm, statusFilter]);
    
    const handleAddOrder = (newOrderData: NewOrderData) => {
        addOrder(newOrderData);
        setIsNewOrderModalOpen(false);
    };

    const handleConfirmStatusChange = () => {
        if (!confirmation) return;
        updateOrderStatus(confirmation.order.id, confirmation.status);
        setConfirmation(null);
    };

    return (
        <>
            <Card>
                <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <CardTitle>Gestión de Pedidos ({filteredOrders.length})</CardTitle>
                    <div className="flex gap-2">
                        <button onClick={() => setIsNewOrderModalOpen(true)} className="flex items-center text-[var(--color-primary)] font-semibold px-4 py-2 rounded-lg bg-[var(--color-surface)] shadow-[4px_4px_8px_var(--color-shadow-dark),_-4px_-4px_8px_var(--color-shadow-light)] hover:text-[var(--color-primary-hover)] active:shadow-[inset_2px_2px_5px_var(--color-shadow-dark),_-inset_-2px_-2px_5px_var(--color-shadow-light)] transition-all">
                            <PlusCircle size={18} className="mr-2" />
                            Nuevo Pedido
                        </button>
                    </div>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-4 mb-6">
                        <div className="relative flex-grow">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-text-muted)]" size={20} />
                            <input
                                type="text"
                                placeholder="Buscar por ID, cliente, dirección..."
                                value={searchTerm}
                                onChange={e => setSearchTerm(e.target.value)}
                                className="w-full pl-12 pr-4 py-3 bg-[var(--color-surface)] rounded-lg shadow-[inset_3px_3px_6px_var(--color-shadow-dark),inset_-3px_-3px_6px_var(--color-shadow-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition"
                            />
                        </div>
                        <select
                            value={statusFilter}
                            onChange={e => setStatusFilter(e.target.value as OrderStatus | 'all')}
                            className="bg-[var(--color-surface)] rounded-lg shadow-[inset_3px_3px_6px_var(--color-shadow-dark),_-inset_-3px_-3px_6px_var(--color-shadow-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] px-4 py-3 appearance-none transition"
                        >
                            <option value="all">Todos los estados</option>
                            {Object.values(OrderStatus).map(status => (
                                <option key={status} value={status}>{status}</option>
                            ))}
                        </select>
                    </div>

                    {/* Desktop Table View */}
                    <div className="overflow-x-auto hidden md:block">
                        <table className="min-w-full divide-y divide-[var(--color-border)]">
                            <thead className="bg-[var(--color-bg)]">
                                <tr>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Pedido ID</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Cliente</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Entrega</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Estado</th>
                                    <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Fecha</th>
                                    <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-border)]">
                                {filteredOrders.map(order => (
                                    <tr key={order.id} className="transition-colors hover:bg-[var(--color-bg)]">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--color-text-strong)]">{order.id}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-main)]">{order.customerName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-main)]">{order.deliveryAddress}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">{getStatusBadge(order.status)}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-[var(--color-text-main)]">{new Date(order.createdAt).toLocaleDateString()}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-1">
                                                {order.status === OrderStatus.InProgress && (
                                                    <>
                                                        <button onClick={() => setConfirmation({ order, status: OrderStatus.Delivered })} className="text-green-600 hover:text-green-800 p-2 rounded-full hover:bg-white/50 dark:hover:bg-slate-700/50" title="Marcar como Entregado">
                                                            <PackageCheck size={20} />
                                                        </button>
                                                        <button onClick={() => setConfirmation({ order, status: OrderStatus.Failed })} className="text-red-600 hover:text-red-800 p-2 rounded-full hover:bg-white/50 dark:hover:bg-slate-700/50" title="Marcar como Fallido">
                                                            <XCircle size={20} />
                                                        </button>
                                                    </>
                                                )}
                                                <button onClick={() => setSelectedOrder(order)} className="text-[var(--color-primary)] hover:text-[var(--color-primary-hover)] p-2 rounded-full hover:bg-white/50 dark:hover:bg-slate-700/50" title="Ver Detalles">
                                                    <Eye size={20} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="space-y-4 md:hidden">
                        {filteredOrders.map(order => (
                            <OrderCardMobile
                                key={order.id}
                                order={order}
                                onViewDetails={() => setSelectedOrder(order)}
                                onUpdateStatus={(status) => setConfirmation({ order, status })}
                            />
                        ))}
                    </div>

                     {filteredOrders.length === 0 && (
                        <div className="text-center py-12 text-[var(--color-text-main)]">
                            <p className="font-semibold">No se encontraron pedidos</p>
                            <p className="text-sm">Intenta ajustar los filtros de búsqueda.</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <NewOrderModal isOpen={isNewOrderModalOpen} onClose={() => setIsNewOrderModalOpen(false)} onAddOrder={handleAddOrder} />
            
            {selectedOrder && (
                <OrderDetailsModal order={selectedOrder} onClose={() => setSelectedOrder(null)} />
            )}
            {confirmation && (
                <ConfirmationModal
                    isOpen={!!confirmation}
                    onClose={() => setConfirmation(null)}
                    onConfirm={handleConfirmStatusChange}
                    title="Confirmar Cambio de Estado"
                    message={<>¿Estás seguro de que quieres cambiar el estado del pedido <strong className="text-[var(--color-text-strong)]">#{confirmation.order.id}</strong> a <strong className="text-[var(--color-text-strong)]">"{confirmation.status}"</strong>?</>}
                    variant={confirmation.status === OrderStatus.Failed ? 'destructive' : 'primary'}
                    confirmText="Sí, cambiar estado"
                />
            )}
        </>
    );
};


import React, { useEffect } from 'react';
// FIX: Added .ts extension to the import path.
import type { Order } from '../types.ts';
// FIX: Added .tsx extension to the import path.
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card.tsx';
import { X, User, MapPin, Truck, Calendar, CheckCircle, FileText, Camera, Edit3 } from 'lucide-react';
// FIX: Added .ts extension to the import path.
import { OrderStatus } from '../types.ts';

interface OrderDetailsModalProps {
  order: Order;
  onClose: () => void;
}

const DetailRow: React.FC<{ icon: React.ElementType, label: string, value: string | React.ReactNode }> = ({ icon: Icon, label, value }) => (
    <div className="flex items-start py-2">
        <Icon className="h-5 w-5 text-[var(--color-primary)] mr-3 mt-1 flex-shrink-0" />
        <div>
            <p className="text-sm font-semibold text-[var(--color-text-strong)]">{label}</p>
            <div className="text-sm text-[var(--color-text-main)]">{value}</div>
        </div>
    </div>
);

const getStatusInfo = (status: OrderStatus) => {
    switch (status) {
      case OrderStatus.Delivered:
        return { color: 'text-green-600', text: 'Entregado' };
      case OrderStatus.InProgress:
        return { color: 'text-blue-600', text: 'En Progreso' };
      case OrderStatus.Pending:
        return { color: 'text-yellow-700', text: 'Pendiente' };
      case OrderStatus.Failed:
        return { color: 'text-red-600', text: 'Fallido' };
      default:
        return { color: 'text-gray-600', text: 'Desconocido' };
    }
};

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({ order, onClose }) => {
    const statusInfo = getStatusInfo(order.status);

    useEffect(() => {
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    return (
        <div 
            role="dialog"
            aria-modal="true"
            aria-labelledby="orderDetailsModalTitle"
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300"
            onClick={onClose}
        >
            <div 
                className="bg-[var(--color-surface)] rounded-[var(--border-radius-main)] shadow-[5px_5px_10px_var(--color-shadow-dark),_-5px_-5px_10px_var(--color-shadow-light)] w-full max-w-2xl max-h-[90vh] flex flex-col scale-95 opacity-0 animate-scale-in border border-[var(--color-shadow-light)]"
                style={{ animation: 'scaleIn 0.3s forwards' }}
                onClick={e => e.stopPropagation()}
            >
                <CardHeader className="flex justify-between items-center relative">
                    <div>
                        <CardTitle id="orderDetailsModalTitle">Detalles del Pedido: #{order.id}</CardTitle>
                        <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-bold bg-[var(--color-surface)] shadow-[3px_3px_5px_var(--color-shadow-dark),_-3px_-3px_5px_var(--color-shadow-light)] ${statusInfo.color}`}>
                           <CheckCircle size={16} className="mr-2"/> {statusInfo.text}
                        </div>
                    </div>
                    <button 
                        onClick={onClose} 
                        className="absolute top-4 right-4 p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-strong)] transition rounded-full hover:bg-[var(--color-bg)]"
                        aria-label="Cerrar modal de detalles del pedido"
                    >
                        <X size={24} />
                    </button>
                </CardHeader>
                <CardContent className="overflow-y-auto px-6 py-4 space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                        <DetailRow icon={User} label="Cliente" value={order.customerName} />
                        <DetailRow icon={Truck} label="Conductor Asignado" value={order.assignedDriverId || 'No asignado'} />
                        <DetailRow icon={MapPin} label="Dirección de Recogida" value={order.pickupAddress} />
                        <DetailRow icon={MapPin} label="Dirección de Entrega" value={order.deliveryAddress} />
                        <DetailRow icon={Calendar} label="Fecha de Creación" value={new Date(order.createdAt).toLocaleString()} />
                        {order.deliveredAt && (
                            <DetailRow icon={CheckCircle} label="Fecha de Entrega" value={new Date(order.deliveredAt).toLocaleString()} />
                        )}
                    </div>
                    
                    {order.status === OrderStatus.Delivered && order.pod && (
                        <div>
                            <h4 className="text-md font-semibold text-[var(--color-text-strong)] border-t border-[var(--color-border)] pt-4 mt-4">Prueba de Entrega (POD)</h4>
                            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                    <DetailRow icon={Edit3} label="Firma del Receptor" value={
                                        order.pod.signatureUrl ? 
                                        <img src={order.pod.signatureUrl} alt="Firma" className="bg-[var(--color-surface)] border-none rounded-md p-2 mt-1 shadow-[inset_2px_2px_4px_var(--color-shadow-dark),_-inset_-2px_-2px_4px_var(--color-shadow-light)]"/> : 
                                        "No disponible"
                                    } />
                                     <DetailRow icon={FileText} label="Notas del Conductor" value={order.pod.notes || 'Sin notas.'} />
                                </div>
                                <div>
                                     <DetailRow icon={Camera} label="Foto de Entrega" value={
                                        order.pod.photoUrl ? 
                                        <img src={order.pod.photoUrl} alt="Foto de entrega" className="rounded-lg shadow-[3px_3px_6px_var(--color-shadow-dark),_-3px_-3px_6px_var(--color-shadow-light)] w-full mt-1"/> : 
                                        "No disponible"
                                    } />
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>
            </div>
            <style>{`
                @keyframes scaleIn {
                    from { transform: scale(0.95); opacity: 0; }
                    to { transform: scale(1); opacity: 1; }
                }
            `}</style>
        </div>
    );
};
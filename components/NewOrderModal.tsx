
import React, { useState, useEffect } from 'react';
// FIX: Added .ts extension to the import path.
import type { Order } from '../types.ts';
// FIX: Added .tsx extension to the import path.
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card.tsx';
import { X } from 'lucide-react';

interface NewOrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  // FIX: Aligned Omit type with useFleetData hook's addOrder function signature.
  onAddOrder: (newOrder: Omit<Order, 'id' | 'createdAt' | 'status' | 'assignedDriverId' | 'deliveryLocation' | 'pickupLocation' | 'pod' | 'deliveredAt' | 'rating' | 'customerInstructions'>) => void;
}

export const NewOrderModal: React.FC<NewOrderModalProps> = ({ isOpen, onClose, onAddOrder }) => {
    const [customerName, setCustomerName] = useState('');
    const [pickupAddress, setPickupAddress] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [itemName, setItemName] = useState('');
    const [itemQuantity, setItemQuantity] = useState(1);
    
    useEffect(() => {
        if (!isOpen) return;
        const handleEsc = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEsc);
        return () => window.removeEventListener('keydown', handleEsc);
    }, [isOpen, onClose]);
    
    if (!isOpen) return null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customerName || !pickupAddress || !deliveryAddress || !itemName) {
            alert('Por favor, complete todos los campos requeridos.');
            return;
        }
        onAddOrder({
            customerName,
            pickupAddress,
            deliveryAddress,
            items: [{ name: itemName, quantity: itemQuantity }],
        });
        // Reset form
        setCustomerName('');
        setPickupAddress('');
        setDeliveryAddress('');
        setItemName('');
        setItemQuantity(1);
    };

    return (
        <div 
            role="dialog"
            aria-modal="true"
            aria-labelledby="newOrderModalTitle"
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300"
            onClick={onClose}
        >
            <div 
                className="bg-[var(--color-surface)] rounded-[var(--border-radius-main)] shadow-[5px_5px_10px_var(--color-shadow-dark),_-5px_-5px_10px_var(--color-shadow-light)] w-full max-w-lg scale-95 opacity-0 animate-scale-in border border-[var(--color-shadow-light)]"
                style={{ animation: 'scaleIn 0.3s forwards' }}
                onClick={e => e.stopPropagation()}
            >
                <CardHeader className="flex justify-between items-center relative">
                    <CardTitle id="newOrderModalTitle">Crear Nuevo Pedido</CardTitle>
                    <button 
                        onClick={onClose} 
                        className="absolute top-4 right-4 p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-strong)] transition rounded-full hover:bg-[var(--color-bg)]"
                        aria-label="Cerrar modal de nuevo pedido"
                    >
                        <X size={24} />
                    </button>
                </CardHeader>
                <CardContent className="py-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="customerName" className="block text-sm font-medium text-[var(--color-text-strong)] mb-2">Nombre del Cliente</label>
                            <input type="text" id="customerName" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full px-4 py-3 bg-[var(--color-surface)] rounded-lg shadow-[inset_3px_3px_6px_var(--color-shadow-dark),inset_-3px_-3px_6px_var(--color-shadow-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition" required />
                        </div>
                        <div>
                            <label htmlFor="pickupAddress" className="block text-sm font-medium text-[var(--color-text-strong)] mb-2">Dirección de Recogida</label>
                            <input type="text" id="pickupAddress" value={pickupAddress} onChange={e => setPickupAddress(e.target.value)} className="w-full px-4 py-3 bg-[var(--color-surface)] rounded-lg shadow-[inset_3px_3px_6px_var(--color-shadow-dark),inset_-3px_-3px_6px_var(--color-shadow-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition" required />
                        </div>
                        <div>
                            <label htmlFor="deliveryAddress" className="block text-sm font-medium text-[var(--color-text-strong)] mb-2">Dirección de Entrega</label>
                            <input type="text" id="deliveryAddress" value={deliveryAddress} onChange={e => setDeliveryAddress(e.target.value)} className="w-full px-4 py-3 bg-[var(--color-surface)] rounded-lg shadow-[inset_3px_3px_6px_var(--color-shadow-dark),inset_-3px_-3px_6px_var(--color-shadow-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition" required />
                        </div>
                         <div className="grid grid-cols-3 gap-4">
                            <div className="col-span-2">
                                <label htmlFor="itemName" className="block text-sm font-medium text-[var(--color-text-strong)] mb-2">Ítem</label>
                                <input type="text" id="itemName" value={itemName} onChange={e => setItemName(e.target.value)} className="w-full px-4 py-3 bg-[var(--color-surface)] rounded-lg shadow-[inset_3px_3px_6px_var(--color-shadow-dark),inset_-3px_-3px_6px_var(--color-shadow-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition" placeholder="Ej: Documentos" required />
                            </div>
                            <div>
                                <label htmlFor="itemQuantity" className="block text-sm font-medium text-[var(--color-text-strong)] mb-2">Cantidad</label>
                                <input type="number" id="itemQuantity" value={itemQuantity} onChange={e => setItemQuantity(parseInt(e.target.value, 10))} min="1" className="w-full px-4 py-3 bg-[var(--color-surface)] rounded-lg shadow-[inset_3px_3px_6px_var(--color-shadow-dark),_-inset_-3px_-3px_6px_var(--color-shadow-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition" required />
                            </div>
                        </div>
                        <div className="flex justify-end pt-4 space-x-3">
                             <button type="button" onClick={onClose} className="px-5 py-2 text-[var(--color-text-strong)] font-semibold rounded-lg bg-[var(--color-surface)] shadow-[4px_4px_8px_var(--color-shadow-dark),_-4px_-4px_8px_var(--color-shadow-light)] hover:shadow-[2px_2px_5px_var(--color-shadow-dark),_-2px_-2px_5px_var(--color-shadow-light)] active:shadow-[inset_2px_2px_5px_var(--color-shadow-dark),_-inset_-2px_-2px_5px_var(--color-shadow-light)] transition-all">Cancelar</button>
                            <button type="submit" className="px-5 py-2 text-white font-semibold rounded-lg bg-[var(--color-primary)] shadow-[4px_4px_8px_var(--color-shadow-dark),_-4px_-4px_8px_var(--color-shadow-light)] hover:bg-[var(--color-primary-hover)] active:shadow-[inset_2px_2px_5px_var(--color-shadow-dark),_-inset_-2px_-2px_5px_var(--color-shadow-light)] transition-all">Crear Pedido</button>
                        </div>
                    </form>
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
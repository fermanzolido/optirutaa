
import React, { useState, useEffect, useMemo } from 'react';
// Fix: Added .ts extension to the import path.
import type { Order, Driver, Location } from '../types.ts';
// Fix: Added .ts extension to the import path.
import { OrderStatus } from '../types.ts';
// Fix: Added .tsx extension to the import path.
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card.tsx';
// Fix: Added .tsx extension to the import path.
import { ProofOfDeliveryModal } from './ProofOfDeliveryModal.tsx';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Truck, Package, PackageCheck, List, Map, Route, Loader, X } from 'lucide-react';
import { AIAssistant } from './AIAssistant.tsx';
import type { FunctionCall } from '@google/genai';


interface DriverCoPilotProps {
  driver: Driver;
  orders: Order[];
  onSubmitPod: (orderId: string, podData: { signature: string; photo: File | null; notes: string; }) => void;
  sendMessage: (senderId: string, receiverId: string, text: string) => void;
  optimizeRoute: (driverId: string) => void;
}

const driverIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMyMmM1NWUiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48Y2lyY2xlIGN4PSI1LjUiIGN5PSIxNy41IiByPSIzLjUiLz48Y2lyY2xlIGN4PSIxOC41IiBjeT0iMTcuNSIgcj0iMy41Ii8+PHBhdGggZD0iTTE1IDE3LjVoLTUuNWwxLjUtNUgxNWwtMS01SDYuNWwtMiA1SDIiLz48cGF0aCBkPSJtNi41IDEyLjUgMS41LTVoM2wyIDUiLz48cGF0aCBkPSJNMTUuNSAxMi41SDE4bC0xLjUtNSIvPjwvc3ZnPg==',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
});

const packageIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZDg4MDgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1wYWNrYWdlIj48cGF0aCBkPSJtMTYuNSA5MS0xLjQxIDEtMi4wOSA1LjQuNDktNC43MUwxNi41IDlaIi8+PHBhdGggZD0ibTIxIDE2LTQgNSIvPjxwYXRoIGQ9Ik0zLjUgOC41IDkgMyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIi8+PHBhdGggZD0iTTEyIDIwLjVWMjFsLTYtNkwzIDEyLjVWMThhMiAyIDAgMCAwIDIgMmgxMGEyIDIgMCAwIDAgMi0yVjcuNWwtMy0yLjg1LTQtMS4zNUw2IDZ2NmwyIDMiLz48L3N2Zz4=',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
});

const selectedPackageIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMyNTYzZWIiIHN0cm9rZS13aWR0aD0iMi41IiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPjxwYXRoIGQ9Im0xNi41IDkgMS0xLjQxLTIuMDktNS40LjQ5IDQuNzFMMTYuNSA5WiIvPjxwYXRoIGQ9Im0yMSAxNi00IDUiLz48cGF0aCBkPSJNOSAzbC01LjUgNS41Ii8+PHBhdGggZD0iTTEyIDIwLjVWMjFsLTYtNkwzIDEyLjVWMThhMiAyIDAgMCAwIDIgMmgxMGEyIDIgMCAwIDAgMi0yVjcuNWwtMy0yLjg1LTQtMS4zNUw2IDZ2NmwyIDMiLz48L3N2Zz4=',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
});

const MapViewUpdater: React.FC<{ center: Location | null; zoom: number }> = ({ center, zoom }) => {
    const map = useMap();
    useEffect(() => {
        if (center) {
            map.setView([center.lat, center.lng], zoom);
        }
    }, [center, zoom, map]);
    return null;
};

const MapResizer: React.FC = () => {
    const map = useMap();
    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 100);
        return () => clearTimeout(timer);
    }, [map]);
    return null;
};

const OrderTask: React.FC<{ order: Order; onComplete: () => void; onClick: () => void; isSelected: boolean; }> = ({ order, onComplete, onClick, isSelected }) => (
    <div 
        onClick={onClick}
        className={`p-4 bg-[var(--color-surface)] rounded-xl shadow-[4px_4px_8px_var(--color-shadow-dark),_-4px_-4px_8px_var(--color-shadow-light)] cursor-pointer transition-all duration-300 ${isSelected ? 'ring-2 ring-[var(--color-primary)] scale-105' : 'hover:scale-[1.02]'}`}
    >
        <div className="flex justify-between items-start">
            <div>
                <p className="font-bold text-sm text-[var(--color-text-strong)]">{order.id}</p>
                <p className="text-xs text-[var(--color-text-main)]">{order.customerName}</p>
            </div>
            <div className="text-xs font-semibold px-2 py-1 rounded-md bg-blue-100 text-blue-800">{OrderStatus.InProgress}</div>
        </div>
        <div className="mt-3 border-t border-[var(--color-border)] pt-3">
            <p className="text-sm text-[var(--color-text-main)]"><strong>Entrega:</strong> {order.deliveryAddress}</p>
            {order.customerInstructions && (
                <p className="text-sm text-amber-700 bg-amber-100 p-2 rounded-md mt-2"><strong>Instrucciones:</strong> {order.customerInstructions}</p>
            )}
        </div>
        <div className="mt-3 flex items-center justify-end">
            <button onClick={(e) => { e.stopPropagation(); onComplete(); }} className="flex items-center text-white font-semibold px-4 py-2 rounded-lg bg-[var(--color-primary)] shadow-[4px_4px_8px_var(--color-shadow-dark),_-4px_-4px_8px_var(--color-shadow-light)] hover:bg-[var(--color-primary-hover)] active:shadow-[inset_2px_2px_5px_var(--color-shadow-dark),_-inset_-2px_-2px_5px_var(--color-shadow-light)] transition-all">
                <PackageCheck size={18} className="mr-2" />
                Completar Entrega
            </button>
        </div>
    </div>
);

export const DriverCoPilot: React.FC<DriverCoPilotProps> = ({ driver, orders, onSubmitPod, sendMessage, optimizeRoute }) => {
    const [podOrder, setPodOrder] = useState<Order | null>(null);
    const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
    const [isOptimizing, setIsOptimizing] = useState(false);
    const [showWelcome, setShowWelcome] = useState(false);
    const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

    useEffect(() => {
        const welcomeMessageShown = sessionStorage.getItem('welcomeMessageShown');
        if (!welcomeMessageShown) {
            setShowWelcome(true);
            sessionStorage.setItem('welcomeMessageShown', 'true');
        }
    }, []);

    const inProgressOrders = orders.filter(o => o.status === OrderStatus.InProgress);

    const selectedOrderLocation = useMemo(() => {
        if (!selectedOrderId) return null;
        const order = inProgressOrders.find(o => o.id === selectedOrderId);
        return order ? order.deliveryLocation : null;
    }, [selectedOrderId, inProgressOrders]);

    const handlePodSubmit = (orderId: string, podData: { signature: string; photo: File | null; notes:string; }) => {
        onSubmitPod(orderId, podData);
        setPodOrder(null);
    };
    
    const handleOptimize = () => {
        if (inProgressOrders.length <= 1) return;
        setIsOptimizing(true);
        // Simulate async operation for visual feedback
        setTimeout(() => {
            optimizeRoute(driver.id);
            setIsOptimizing(false);
        }, 1500);
    };

    const handleFunctionCall = (functionCall: FunctionCall): string => {
        const nextOrder = inProgressOrders[0];
        
        switch (functionCall.name) {
            case 'getNextStop':
                return nextOrder
                    ? `Tu próxima parada es en ${nextOrder.deliveryAddress} para el cliente ${nextOrder.customerName}.`
                    : 'No tienes más paradas en tu ruta actual.';
            
            case 'optimizeMyRoute':
                if (inProgressOrders.length > 1) {
                    handleOptimize();
                    return 'Ok, he iniciado la optimización de tu ruta. Dame un momento...';
                }
                return 'No es necesario optimizar, solo te queda una entrega o ninguna.';

            case 'readCustomerInstructions':
                return nextOrder
                    ? (nextOrder.customerInstructions || `No hay instrucciones especiales para el pedido de ${nextOrder.customerName}.`)
                    : 'No hay un pedido activo para leer instrucciones.';

            case 'markOrderAsDelivered':
                if (nextOrder) {
                    setPodOrder(nextOrder);
                    return `Ok, abriendo la pantalla de confirmación de entrega para el pedido ${nextOrder.id}.`;
                }
                return 'No hay un pedido activo para marcar como entregado.';

            case 'sendMessageToDispatch':
                const message = functionCall.args.message as string;
                if(message) {
                    sendMessage(driver.id, 'admin', message);
                    return `Ok, he enviado el mensaje "${message}" al centro de despacho.`;
                }
                return 'No entendí el mensaje que querías enviar.';

            default:
                return "Lo siento, no puedo realizar esa acción.";
        }
    };

    return (
        <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:h-[calc(100vh-8rem)]">
                <div className="lg:col-span-1 flex flex-col gap-6 lg:overflow-y-auto no-scrollbar">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-center">
                                <CardTitle>Mis Tareas ({inProgressOrders.length})</CardTitle>
                                <button
                                    onClick={handleOptimize}
                                    disabled={inProgressOrders.length <= 1 || isOptimizing}
                                    className="flex items-center text-sm font-semibold px-3 py-1.5 rounded-lg text-[var(--color-primary)] bg-[var(--color-surface)] shadow-[3px_3px_5px_var(--color-shadow-dark),_-3px_-3px_5px_var(--color-shadow-light)] active:shadow-[inset_1px_1px_2px_var(--color-shadow-dark),_-inset_-1px_-1px_2px_var(--color-shadow-light)] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                                    title="Optimizar mi ruta"
                                >
                                    {isOptimizing ? <Loader size={16} className="mr-2 animate-spin" /> : <Route size={16} className="mr-2" />}
                                    {isOptimizing ? 'Optimizando...' : 'Optimizar'}
                                </button>
                            </div>
                             <div className="mt-4 flex bg-[var(--color-bg)] rounded-lg p-1 shadow-inner">
                                <button onClick={() => setViewMode('list')} className={`flex-1 p-2 rounded-md text-sm font-semibold flex items-center justify-center transition-all ${viewMode === 'list' ? 'bg-[var(--color-surface)] shadow-md text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}><List size={16} className="mr-2"/>Lista</button>
                                <button onClick={() => setViewMode('map')} className={`flex-1 p-2 rounded-md text-sm font-semibold flex items-center justify-center transition-all ${viewMode === 'map' ? 'bg-[var(--color-surface)] shadow-md text-[var(--color-primary)]' : 'text-[var(--color-text-muted)]'}`}><Map size={16} className="mr-2"/>Mapa</button>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {showWelcome && (
                                <div className="bg-blue-100 border-l-4 border-blue-500 text-blue-800 dark:bg-blue-900/30 dark:border-blue-400 dark:text-blue-300 p-3 rounded-lg mb-4 flex justify-between items-center shadow-inner text-sm">
                                    <p>¡Bienvenido, <strong>{driver.name.split(' ')[0]}</strong>! Usa el Co-Piloto de IA para obtener ayuda en tu ruta.</p>
                                    <button onClick={() => setShowWelcome(false)} className="p-1 rounded-full hover:bg-blue-200 dark:hover:bg-blue-800/50">
                                        <X size={16} />
                                    </button>
                                </div>
                            )}
                            {inProgressOrders.length > 0 ? (
                                inProgressOrders.map(order => (
                                    <OrderTask 
                                        key={order.id} 
                                        order={order} 
                                        onComplete={() => setPodOrder(order)} 
                                        onClick={() => setSelectedOrderId(order.id)}
                                        isSelected={selectedOrderId === order.id}
                                    />
                                ))
                            ) : (
                                <p className="text-center text-[var(--color-text-main)] py-8">No tienes pedidos en curso.</p>
                            )}
                        </CardContent>
                    </Card>
                    <AIAssistant 
                        driver={driver} 
                        orders={inProgressOrders}
                        onFunctionCall={handleFunctionCall}
                    />
                </div>
                <div className="lg:col-span-2 h-[320px] lg:h-full">
                    <div className="h-full w-full rounded-[var(--border-radius-main)] overflow-hidden shadow-[inset_5px_5px_10px_var(--color-shadow-dark),_-inset_-5px_-5px_10px_var(--color-shadow-light)] p-1 bg-[var(--color-surface)]">
                        <MapContainer center={[driver.location.lat, driver.location.lng]} zoom={13} scrollWheelZoom={true} className="h-full w-full rounded-lg">
                            <MapResizer />
                            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                            <MapViewUpdater center={selectedOrderLocation} zoom={15} />
                            <Marker position={[driver.location.lat, driver.location.lng]} icon={driverIcon}>
                                <Popup>Tu ubicación actual</Popup>
                            </Marker>
                            {driver.optimizedRoute && <Polyline positions={driver.optimizedRoute.map(l => [l.lat, l.lng])} color="var(--color-primary)" />}
                            {inProgressOrders.map(order => (
                                <Marker 
                                    key={order.id} 
                                    position={[order.deliveryLocation.lat, order.deliveryLocation.lng]} 
                                    icon={selectedOrderId === order.id ? selectedPackageIcon : packageIcon}
                                >
                                    <Popup>{order.customerName} - {order.deliveryAddress}</Popup>
                                </Marker>
                            ))}
                        </MapContainer>
                    </div>
                </div>
            </div>
            {podOrder && (
                <ProofOfDeliveryModal
                    order={podOrder}
                    isOpen={!!podOrder}
                    onClose={() => setPodOrder(null)}
                    onSubmit={handlePodSubmit}
                />
            )}
        </>
    );
};

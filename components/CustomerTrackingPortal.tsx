
import React, { useState, useMemo, useEffect } from 'react';
// Fix: Added .ts extension to the import path.
import type { Order, Driver } from '../types.ts';
// Fix: Added .ts extension to the import path.
import { OrderStatus } from '../types.ts';
// Fix: Added .tsx extension to the import path.
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card.tsx';
import { MapContainer, TileLayer, Marker, Polyline, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Truck, Package, CheckCircle, Clock, ArrowLeft, Star, MessageSquare, Send } from 'lucide-react';

interface CustomerTrackingPortalProps {
    order: Order;
    driver: Driver | null;
    onBack: () => void;
    onRateDelivery: (orderId: string, rating: number) => void;
    onAddInstruction: (orderId: string, instruction: string) => void;
}

const getStatusInfo = (status: OrderStatus, hasDriver: boolean) => {
    if (!hasDriver && status === OrderStatus.Pending) {
      return { text: 'Esperando asignación', icon: Clock, color: 'text-yellow-600' };
    }
    switch (status) {
      case OrderStatus.Delivered:
        return { text: 'Entregado', icon: CheckCircle, color: 'text-green-600' };
      case OrderStatus.InProgress:
        return { text: 'En Camino', icon: Truck, color: 'text-blue-600' };
      case OrderStatus.Pending:
        return { text: 'Pedido Confirmado', icon: Package, color: 'text-indigo-600' };
      default:
        return { text: 'Estado Desconocido', icon: Package, color: 'text-gray-500' };
    }
};

const driverIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiMyNTYzZWIiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIj48Y2lyY2xlIGN4PSI1LjUiIGN5PSIxNy41IiByPSIzLjUiLz48Y2lyY2xlIGN4PSIxOC41IiBjeT0iMTcuNSIgcj0iMy41Ii8+PHBhdGggZD0iTTE1IDE3LjVoLTUuNWwxLjUtNUgxNWwtMS01SDYuNWwtMiA1SDIiLz48cGF0aCBkPSJtNi41IDEyLjUgMS41LTVoM2wyIDUiLz48cGF0aCBkPSJNMTUuNSAxMi41SDE4bC0xLjUtNSIvPjwvc3ZnPg==',
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -36],
});

const packageIcon = new L.Icon({
    iconUrl: 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZDg4MDgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1wYWNrYWdlIj48cGF0aCBkPSJtMTYuNSA5MS0xLjQxIDEtMi4wOSA1LjQuNDktNC43MUwxNi41IDlaIi8+PHBhdGggZD0ibTIxIDE2LTQgNSIvPjxwYXRoIGQ9Ik0zLjUgOC41IDkgMyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIi8+PHBhdGggZD0iTTEyIDIwLjVWMjFsLTYtNkwzIDEyLjVWMThhMiAyIDAgMCAwIDIgMmgxMGEyIDIgMCAwIDAgMi0yVjcuNWwtMy0yLjg1LTQtMS4zNUw2IDZ2NmwyIDMiLz48L3N2Zz4=',
    iconSize: [24, 24],
    iconAnchor: [12, 24],
});

const haversineDistance = (coords1: {lat: number, lng: number}, coords2: {lat: number, lng: number}): number => {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371; // Earth radius in km
    const dLat = toRad(coords2.lat - coords1.lat);
    const dLon = toRad(coords2.lng - coords1.lng);
    const lat1 = toRad(coords1.lat);
    const lat2 = toRad(coords2.lat);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) + Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
};

const StarRating: React.FC<{ rating: number, setRating: (r: number) => void }> = ({ rating, setRating }) => {
    return (
        <div className="flex justify-center space-x-2">
            {[1, 2, 3, 4, 5].map((star) => (
                <Star
                    key={star}
                    className={`cursor-pointer h-10 w-10 transition-colors ${rating >= star ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                    onClick={() => setRating(star)}
                />
            ))}
        </div>
    );
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


export const CustomerTrackingPortal: React.FC<CustomerTrackingPortalProps> = ({ order, driver, onBack, onRateDelivery, onAddInstruction }) => {
    const [rating, setRating] = useState(order.rating || 0);
    const [hoverRating, setHoverRating] = useState(0);
    const [instruction, setInstruction] = useState('');
    const [instructionSent, setInstructionSent] = useState(false);
    
    const statusInfo = getStatusInfo(order.status, !!driver);
    const StatusIcon = statusInfo.icon;
    const mapCenter = driver ? [driver.location.lat, driver.location.lng] : [order.deliveryLocation.lat, order.deliveryLocation.lng];

    const estimatedTime = useMemo(() => {
        if (!driver || order.status !== OrderStatus.InProgress) return null;
        const distance = haversineDistance(driver.location, order.deliveryLocation);
        const speedKmh = 30; // Average city speed
        const timeHours = distance / speedKmh;
        const timeMinutes = Math.round(timeHours * 60);
        if (timeMinutes < 2) return "Llegando ahora";
        return `${timeMinutes} min`;
    }, [driver, order]);

    const handleRatingSubmit = () => {
        onRateDelivery(order.id, rating);
    };
    
    const handleInstructionSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (instruction.trim()) {
            onAddInstruction(order.id, instruction.trim());
            setInstructionSent(true);
            setInstruction('');
            setTimeout(() => setInstructionSent(false), 3000);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row h-screen font-sans">
            <div className="lg:w-1/3 p-6 space-y-6 overflow-y-auto">
                <button onClick={onBack} className="flex items-center text-sm text-[var(--color-text-main)] hover:text-[var(--color-text-strong)] font-medium">
                    <ArrowLeft size={16} className="mr-2" />
                    Crear otro envío
                </button>
                <h1 className="text-3xl font-bold text-[var(--color-text-strong)]">Seguimiento de tu pedido</h1>
                
                {order.status === OrderStatus.Delivered ? (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-center">¡Gracias por tu pedido!</CardTitle>
                        </CardHeader>
                        <CardContent>
                             <div className="flex items-center justify-center space-x-3 mb-6">
                                <StatusIcon className={`h-8 w-8 ${statusInfo.color}`} />
                                <p className={`text-xl font-semibold ${statusInfo.color}`}>{statusInfo.text}</p>
                            </div>
                            <p className="text-center text-[var(--color-text-main)] mb-4">
                                {order.rating ? 'Gracias por tu calificación.' : 'Por favor, califica tu experiencia de entrega.'}
                            </p>
                            <StarRating rating={rating} setRating={setRating} />
                            {!order.rating && (
                                <button onClick={handleRatingSubmit} disabled={rating === 0} className="w-full mt-6 p-3 rounded-lg text-lg font-semibold text-white bg-[var(--color-primary)] shadow-[5px_5px_10px_var(--color-shadow-dark),_-5px_-5px_10px_var(--color-shadow-light)] hover:bg-[var(--color-primary-hover)] active:shadow-[inset_2px_2px_5px_var(--color-shadow-dark),_-inset_-2px_-2px_5px_var(--color-shadow-light)] transition-all disabled:opacity-50">
                                    Enviar Calificación
                                </button>
                            )}
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardHeader>
                            <CardTitle>ID: <span className="text-[var(--color-primary)] font-mono">{order.id}</span></CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex items-center space-x-3">
                                <StatusIcon className={`h-8 w-8 ${statusInfo.color}`} />
                                <p className={`text-xl font-semibold ${statusInfo.color}`}>{statusInfo.text}</p>
                            </div>
                            {estimatedTime && (
                                <div className="mt-4 p-3 bg-[var(--color-bg)] rounded-lg shadow-inner">
                                    <p className="text-center text-lg font-bold text-[var(--color-primary)]">ETA: {estimatedTime}</p>
                                </div>
                            )}
                            <div className="mt-4 border-t border-[var(--color-border)] pt-4 space-y-3 text-sm text-[var(--color-text-main)]">
                               <p><strong>Para:</strong> {order.customerName}</p>
                               <p><strong>Dirección:</strong> {order.deliveryAddress}</p>
                               {driver && <p><strong>Conductor:</strong> {driver.name}</p>}
                            </div>
                        </CardContent>
                    </Card>
                )}

                 {order.status === OrderStatus.InProgress && (
                     <Card>
                        <CardHeader>
                             <CardTitle className="flex items-center text-lg"><MessageSquare size={20} className="mr-2 text-[var(--color-primary)]" />Instrucciones para el conductor</CardTitle>
                        </CardHeader>
                         <CardContent>
                             <form onSubmit={handleInstructionSubmit} className="flex gap-2">
                                <input
                                    type="text"
                                    value={instruction}
                                    onChange={e => setInstruction(e.target.value)}
                                    placeholder="Ej: Dejar en portería"
                                    className="flex-grow px-4 py-2 bg-[var(--color-surface)] rounded-lg shadow-[inset_2px_2px_4px_var(--color-shadow-dark),inset_-2px_-2px_4px_var(--color-shadow-light)] focus:outline-none focus:ring-1 focus:ring-[var(--color-primary)] transition"
                                    disabled={instructionSent}
                                />
                                 <button type="submit" className="p-2.5 text-white font-semibold rounded-lg bg-[var(--color-primary)] shadow-[3px_3px_6px_var(--color-shadow-dark),_-3px_-3px_6px_var(--color-shadow-light)] hover:bg-[var(--color-primary-hover)] active:shadow-[inset_1px_1px_3px_var(--color-shadow-dark),_-inset_-1px_-1px_3px_var(--color-shadow-light)] transition-all disabled:opacity-60" disabled={instructionSent}>
                                    <Send size={18} />
                                </button>
                             </form>
                             {instructionSent && <p className="text-xs text-green-600 mt-2 text-center">Instrucción enviada con éxito.</p>}
                         </CardContent>
                     </Card>
                 )}
                 
                 <div className="text-center text-xs text-[var(--color-text-muted)] opacity-70">
                    La ubicación del conductor se actualiza en tiempo real.
                </div>
            </div>
            <div className="flex-grow h-64 lg:h-full p-2 lg:p-4">
                 <div className="h-full w-full rounded-2xl overflow-hidden shadow-[inset_7px_7px_15px_var(--color-shadow-dark),_-inset_-7px_-7px_15px_var(--color-shadow-light)] p-1 bg-[var(--color-surface)]">
                     <style>{`
                        .leaflet-container {
                            border-radius: 14px;
                        }
                        .leaflet-popup-content-wrapper, .leaflet-popup-tip {
                            background: var(--color-surface);
                            color: var(--color-text-main);
                            box-shadow: 7px 7px 15px var(--color-shadow-dark), -7px -7px 15px var(--color-shadow-light);
                        }
                    `}</style>
                    <MapContainer
                        center={mapCenter as L.LatLngExpression}
                        zoom={13}
                        scrollWheelZoom={true}
                        className="h-full w-full"
                    >
                        <MapResizer />
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {driver && order.status === OrderStatus.InProgress && (
                            <>
                                <Marker position={[driver.location.lat, driver.location.lng]} icon={driverIcon}>
                                    <Popup>
                                        <div className="font-sans">
                                            <p className="font-bold text-base text-[var(--color-text-strong)]">{driver.name}</p>
                                            <p className="text-sm">{driver.vehicle}</p>
                                        </div>
                                    </Popup>
                                </Marker>
                                <Polyline positions={[
                                    [driver.location.lat, driver.location.lng],
                                    [order.deliveryLocation.lat, order.deliveryLocation.lng]
                                ]} color="var(--color-primary)" dashArray="5, 10" />
                            </>
                        )}
                        <Marker position={[order.deliveryLocation.lat, order.deliveryLocation.lng]} icon={packageIcon} />
                    </MapContainer>
                </div>
            </div>
        </div>
    );
};

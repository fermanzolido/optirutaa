
import React, { useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap, Circle, type MarkerProps } from 'react-leaflet';
import L from 'leaflet';
// Fix: Added .ts extension to the import path.
import type { Driver, Order } from '../types.ts';
// Fix: Added .ts extension to the import path.
import { DriverStatus } from '../types.ts';

/**
 * A component that forces the Leaflet map to recalculate its size.
 * This is a common fix for issues where the map container's dimensions are not
 * immediately available on initial render, especially in complex responsive layouts.
 */
const MapResizer: React.FC = () => {
    const map = useMap();
    useEffect(() => {
        const timer = setTimeout(() => {
            map.invalidateSize();
        }, 400); // A small delay to ensure layout has settled, increased for robustness
        return () => clearTimeout(timer);
    }, [map]);
    return null;
};


// FIX: Create a wrapper component for Marker that supports HTML5 drag-and-drop events.
// The default react-leaflet Marker does not support these events in its `eventHandlers` prop.
// This component gets a ref to the underlying Leaflet marker instance, retrieves its
// DOM element, and attaches the necessary event listeners for drag-and-drop.
const DropTargetMarker: React.FC<MarkerProps & { customEventHandlers: any }> = ({ customEventHandlers, children, ...props }) => {
    const markerRef = useRef<L.Marker>(null);

    useEffect(() => {
        const marker = markerRef.current;
        if (marker) {
            const iconElement = marker.getElement();
            if (iconElement) {
                const { dragenter, dragleave, dragover, drop } = customEventHandlers;
                
                iconElement.addEventListener('dragenter', dragenter);
                iconElement.addEventListener('dragleave', dragleave);
                iconElement.addEventListener('dragover', dragover);
                iconElement.addEventListener('drop', drop);

                return () => {
                    iconElement.removeEventListener('dragenter', dragenter);
                    iconElement.removeEventListener('dragleave', dragleave);
                    iconElement.removeEventListener('dragover', dragover);
                    iconElement.removeEventListener('drop', drop);
                };
            }
        }
    }, [markerRef, customEventHandlers]);

    return <Marker ref={markerRef} {...props}>{children}</Marker>;
};


const getDriverIconSvg = (color: string) => {
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="${color}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="5.5" cy="17.5" r="3.5"/><circle cx="18.5" cy="17.5" r="3.5"/><path d="M15 17.5h-5.5l1.5-5H15l-1-5H6.5l-2 5H2"/><path d="m6.5 12.5 1.5-5h3l2 5"/><path d="M15.5 12.5H18l-1.5-5"/></svg>`;
    return `data:image/svg+xml;base64,${btoa(svg)}`;
};

const getIcon = (type: 'driver' | 'order', status?: DriverStatus, isTarget: boolean = false) => {
    const size: [number, number] = type === 'driver' ? [36, 36] : [24, 24];
    const anchor: [number, number] = [size[0] / 2, size[1]];

    let iconUrl = '';

    if (type === 'driver') {
        let color = '#6b7280'; // Default to offline/grey
        if (status === DriverStatus.Online) color = '#22c55e';
        if (status === DriverStatus.OnBreak) color = '#f97316';
        iconUrl = getDriverIconSvg(color);
    } else {
        iconUrl = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9IiNmZDg4MDgiIHN0cm9rZS13aWR0aD0iMiIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIiBzdHJva2UtbGluZWpvaW49InJvdW5kIiBjbGFzcz0ibHVjaWRlIGx1Y2lkZS1wYWNrYWdlIj48cGF0aCBkPSJtMTYuNSA5MS0xLjQxIDEtMi4wOSA1LjQuNDktNC4yMUwxNi41IDlaIi8+PHBhdGggZD0ibTIxIDE2LTQgNSIvPjxwYXRoIGQ9Ik0zLjUgOC41IDkgMyIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIi8+PHBhdGggZD0iTTEyIDIwLjVWMjFsLTYtNkwzIDEyLjVWMThhMiAyIDAgMCAwIDIgMmgxMGEyIDIgMCAwIDAgMi0yVjcuNWwtMy0yLjg1LTQtMS4zNUw2IDZ2NmwyIDMiLz48L3N2Zz4=';
    }

    return new L.Icon({
        iconUrl,
        iconSize: size,
        iconAnchor: anchor,
        popupAnchor: [0, -size[1]],
        className: isTarget ? 'leaflet-marker-target' : ''
    });
};

// FIX: Added the missing interface definition for the component's props.
interface FleetMapProps {
    drivers: Driver[];
    orders: Order[];
    onDropOrderOnDriver: (orderId: string, driverId: string) => void;
    draggedOverDriverId: string | null;
    setDraggedOverDriverId: React.Dispatch<React.SetStateAction<string | null>>;
}

export const FleetMap: React.FC<FleetMapProps> = ({ drivers, orders, onDropOrderOnDriver, draggedOverDriverId, setDraggedOverDriverId }) => {
  return (
    <div className="h-full w-full rounded-[var(--border-radius-main)] overflow-hidden shadow-[inset_5px_5px_10px_var(--color-shadow-dark),_-inset_-5px_-5px_10px_var(--color-shadow-light)] p-1 bg-[var(--color-surface)]">
        <style>{`
            @keyframes pulse-target-marker {
                0% {
                    transform: scale(1.4);
                }
                50% {
                    transform: scale(1.7);
                    filter: brightness(1.2);
                }
                100% {
                    transform: scale(1.4);
                }
            }
            .leaflet-marker-target { 
                animation: pulse-target-marker 1.5s infinite ease-in-out;
                transform-origin: bottom center;
            }
            .leaflet-container {
                border-radius: calc(var(--border-radius-main) - 4px);
            }
            .leaflet-popup-content-wrapper, .leaflet-popup-tip {
                background: var(--color-surface);
                color: var(--color-text-main);
                box-shadow: 5px 5px 10px var(--color-shadow-dark), -5px -5px 10px var(--color-shadow-light);
                border-radius: var(--border-radius-main);
            }
            @keyframes pulse {
                0% {
                    transform: scale(0.9);
                    opacity: 0.5;
                }
                70% {
                    transform: scale(2.5);
                    opacity: 0;
                }
                100% {
                    transform: scale(0.9);
                    opacity: 0;
                }
            }
            .pulse-indicator {
                animation: pulse 2s infinite ease-out;
                transform-origin: center;
            }
        `}</style>
       <MapContainer center={[-34.6037, -58.3816]} zoom={13} scrollWheelZoom={true}>
            <MapResizer />
            <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {drivers.filter(d => d.status !== DriverStatus.Offline).map(driver => (
                <React.Fragment key={driver.id}>
                    <DropTargetMarker 
                        position={[driver.location.lat, driver.location.lng]} 
                        icon={getIcon('driver', driver.status, draggedOverDriverId === driver.id)}
                        customEventHandlers={{
                            dragenter: () => {
                                setDraggedOverDriverId(driver.id);
                            },
                            dragleave: () => {
                                setDraggedOverDriverId(null);
                            },
                            dragover: (e: DragEvent) => {
                               e.preventDefault(); // Allow drop
                            },
                            drop: (e: DragEvent) => {
                                e.preventDefault();
                                const orderId = e.dataTransfer?.getData('text/plain');
                                if (orderId) {
                                    onDropOrderOnDriver(orderId, driver.id);
                                }
                                setDraggedOverDriverId(null);
                            }
                        }}
                    >
                        <Popup>
                            <div className="font-sans">
                                <p className="font-bold text-base text-[var(--color-text-strong)]">{driver.name}</p>
                                <p className="text-sm">{driver.vehicle} - {driver.licensePlate}</p>
                                <p className={`text-sm font-semibold ${driver.status === 'En línea' ? 'text-green-600' : 'text-orange-500'}`}>{driver.status}</p>
                            </div>
                        </Popup>
                    </DropTargetMarker>
                    {driver.status === DriverStatus.OnBreak && (
                        <Circle
                            center={[driver.location.lat, driver.location.lng]}
                            radius={40}
                            pathOptions={{ color: 'transparent', fillColor: '#f97316', fillOpacity: 0.5 }}
                            className="pulse-indicator"
                        />
                    )}
                </React.Fragment>
            ))}
             {orders.filter(o => o.status === 'Pendiente' || o.status === 'En Progreso').map(order => (
                <Marker key={order.id} position={[order.deliveryLocation.lat, order.deliveryLocation.lng]} icon={getIcon('order')}>
                    <Popup>
                        <div className="font-sans">
                            <p className="font-bold text-base text-[var(--color-text-strong)]">Pedido #{order.id}</p>
                            <p className="text-sm">Cliente: {order.customerName}</p>
                            <p className="text-sm">Dirección: {order.deliveryAddress}</p>
                            <p className={`text-sm font-semibold ${order.status === 'Pendiente' ? 'text-yellow-600' : 'text-blue-600'}`}>{order.status}</p>
                        </div>
                    </Popup>
                </Marker>
            ))}
       </MapContainer>
    </div>
  );
};

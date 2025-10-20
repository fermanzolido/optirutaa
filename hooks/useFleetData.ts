import { useState, useEffect, useCallback } from 'react';
// Fix: Added .ts extension to the import path.
import type { Order, Driver, Message, Location, Notification, User, AuditLog, AuditLogAction, DriverStatusLog } from '../types.ts';
// Fix: Added .ts extension to the import path.
import { OrderStatus, DriverStatus, AccountStatus } from '../types.ts';
// Fix: Added .ts extension to the import path.
import { getSmartAssignments } from '../services/geminiService.ts';

// Mock Data
const MOCK_DRIVERS: Driver[] = [
  { id: 'D001', name: 'Carlos Gomez', email: 'carlos@email.com', password: 'password123', vehicle: 'Moto Honda Wave', licensePlate: 'A123BCC', location: { lat: -34.6037, lng: -58.3816 }, status: DriverStatus.Online, accountStatus: AccountStatus.Approved, lastMovedAt: new Date(), vehicleCapacity: 20, fuelType: 'Gasolina' },
  { id: 'D002', name: 'Lucia Fernandez', email: 'lucia@email.com', password: 'password123', vehicle: 'Bicicleta Raleigh', licensePlate: 'N/A', location: { lat: -34.5950, lng: -58.4000 }, status: DriverStatus.Online, accountStatus: AccountStatus.Approved, lastMovedAt: new Date(), vehicleCapacity: 10, fuelType: 'Eléctrico' },
  { id: 'D003', name: 'Martin Herrera', email: 'martin@email.com', password: 'password123', vehicle: 'Moto Zanella ZB', licensePlate: 'B456CDE', location: { lat: -34.6100, lng: -58.3700 }, status: DriverStatus.OnBreak, accountStatus: AccountStatus.Approved, lastMovedAt: new Date(), vehicleCapacity: 25, fuelType: 'Gasolina' },
  { id: 'D004', name: 'Sofia Diaz', email: 'sofia@email.com', password: 'password123', vehicle: 'Moto Corven Energy', licensePlate: 'C789DEF', location: { lat: -34.6200, lng: -58.4100 }, status: DriverStatus.Offline, accountStatus: AccountStatus.Approved, lastMovedAt: new Date(), vehicleCapacity: 20, fuelType: 'Híbrido' },
  { id: 'D005', name: 'Jorge Ramirez', email: 'jorge@email.com', password: 'password123', vehicle: 'Moto Bajaj Rouser', licensePlate: 'D123GHI', location: { lat: -34.615, lng: -58.395 }, status: DriverStatus.Offline, accountStatus: AccountStatus.Pending, lastMovedAt: new Date(), vehicleCapacity: 30, fuelType: 'Gasolina' },
];

const geocodeAddress = (address: string): Location => {
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    const char = address.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  const lat = -34.6037 + (hash % 2000 - 1000) / 20000;
  const lng = -58.3816 + (hash % 4000 - 2000) / 20000;
  return { lat, lng };
};

const MOCK_ORDERS: Order[] = [
  { id: 'ORD-A1B2C', customerName: 'Oficina Legal Diaz', pickupAddress: 'Av. Corrientes 1234, CABA', deliveryAddress: 'Florida 550, CABA', pickupLocation: geocodeAddress('Av. Corrientes 1234, CABA'), deliveryLocation: geocodeAddress('Florida 550, CABA'), items: [{ name: 'Documentos Urgentes', quantity: 1 }], status: OrderStatus.Pending, assignedDriverId: null, createdAt: new Date(Date.now() - 3600000 * 1).toISOString() },
  { id: 'ORD-D3E4F', customerName: 'Restaurante "El Sabor"', pickupAddress: 'Defensa 900, CABA', deliveryAddress: 'Av. de Mayo 800, CABA', pickupLocation: geocodeAddress('Defensa 900, CABA'), deliveryLocation: geocodeAddress('Av. de Mayo 800, CABA'), items: [{ name: 'Pedido de Comida', quantity: 3 }], status: OrderStatus.InProgress, assignedDriverId: 'D001', createdAt: new Date(Date.now() - 3600000 * 2).toISOString() },
  { id: 'ORD-G5H6I', customerName: 'Tienda de Ropa "Moderna"', pickupAddress: 'Av. Santa Fe 1860, CABA', deliveryAddress: 'Malabia 1700, CABA', pickupLocation: geocodeAddress('Av. Santa Fe 1860, CABA'), deliveryLocation: geocodeAddress('Malabia 1700, CABA'), items: [{ name: 'Paquete Mediano', quantity: 1 }], status: OrderStatus.InProgress, assignedDriverId: 'D002', createdAt: new Date(Date.now() - 3600000 * 0.5).toISOString() },
  { id: 'ORD-J7K8L', customerName: 'Farmacia Central', pickupAddress: 'Pueyrredón 600, CABA', deliveryAddress: 'Rivadavia 4500, CABA', pickupLocation: geocodeAddress('Pueyrredón 600, CABA'), deliveryLocation: geocodeAddress('Rivadavia 4500, CABA'), items: [{ name: 'Medicamentos', quantity: 1 }], status: OrderStatus.Delivered, assignedDriverId: 'D001', createdAt: new Date(Date.now() - 3600000 * 4).toISOString(), deliveredAt: new Date(Date.now() - 3600000 * 3).toISOString(), rating: 5 },
  { id: 'ORD-M9N0P', customerName: 'Estudio Contable', pickupAddress: 'Lavalle 1500, CABA', deliveryAddress: 'Viamonte 525, CABA', pickupLocation: geocodeAddress('Lavalle 1500, CABA'), deliveryLocation: geocodeAddress('Viamonte 525, CABA'), items: [{ name: 'Carpeta A4', quantity: 2 }], status: OrderStatus.Failed, assignedDriverId: 'D003', createdAt: new Date(Date.now() - 3600000 * 5).toISOString() },
];

const MOCK_DRIVER_STATUS_LOGS: DriverStatusLog[] = [
    { id: 'dsl1', driverId: 'D001', status: DriverStatus.Offline, timestamp: new Date(Date.now() - 3600000 * 8) },
    { id: 'dsl2', driverId: 'D001', status: DriverStatus.Online, timestamp: new Date(Date.now() - 3600000 * 6) },
    { id: 'dsl3', driverId: 'D002', status: DriverStatus.Offline, timestamp: new Date(Date.now() - 3600000 * 10) },
    { id: 'dsl4', driverId: 'D002', status: DriverStatus.Online, timestamp: new Date(Date.now() - 3600000 * 5) },
    { id: 'dsl5', driverId: 'D003', status: DriverStatus.Online, timestamp: new Date(Date.now() - 3600000 * 4) },
    { id: 'dsl6', driverId: 'D003', status: DriverStatus.OnBreak, timestamp: new Date(Date.now() - 3600000 * 2) },
    { id: 'dsl7', driverId: 'D004', status: DriverStatus.Online, timestamp: new Date(Date.now() - 3600000 * 12) },
    { id: 'dsl8', driverId: 'D004', status: DriverStatus.Offline, timestamp: new Date(Date.now() - 3600000 * 3) },
];

const haversineDistance = (coords1: Location, coords2: Location): number => {
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

type AddNotificationFn = (notification: Omit<Notification, 'id' | 'read' | 'createdAt'>) => void;

const IDLE_THRESHOLD_MS = 15000; // 15 seconds for demo purposes

export const useFleetData = (addNotification: AddNotificationFn, currentUser: User | null) => {
    const [drivers, setDrivers] = useState<Driver[]>(MOCK_DRIVERS);
    const [orders, setOrders] = useState<Order[]>(MOCK_ORDERS);
    const [messages, setMessages] = useState<Message[]>([]);
    const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
    const [driverStatusLogs, setDriverStatusLogs] = useState<DriverStatusLog[]>(MOCK_DRIVER_STATUS_LOGS);

    const addAuditLog = useCallback((driverId: string, action: AuditLogAction) => {
        const newLog: AuditLog = {
            id: `log-${Date.now()}`,
            driverId,
            action,
            timestamp: new Date(),
        };
        setAuditLogs(prev => [newLog, ...prev]);
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            setDrivers(prevDrivers => 
                prevDrivers.map(driver => {
                    // If this driver is the current user, geolocation will handle updates.
                    if (currentUser?.role === 'driver' && driver.id === currentUser.id) {
                        return driver;
                    }

                    let newLocation = driver.location;
                    const hasMoved = Math.random() > 0.3; // Simulate not moving sometimes
                    let lastMovedAt = driver.lastMovedAt || new Date();

                    if (driver.status === DriverStatus.Online && hasMoved) {
                        newLocation = {
                            lat: driver.location.lat + (Math.random() - 0.5) * 0.002,
                            lng: driver.location.lng + (Math.random() - 0.5) * 0.002,
                        };
                        lastMovedAt = new Date();
                    }
                    
                    // Anomaly detection
                    if (driver.status === DriverStatus.Online && driver.lastMovedAt) {
                         const timeIdle = new Date().getTime() - new Date(driver.lastMovedAt).getTime();
                         if (timeIdle > IDLE_THRESHOLD_MS && timeIdle < IDLE_THRESHOLD_MS + 5000) { // check in a 5s window to avoid spam
                             addNotification({
                                 recipient: 'admin',
                                 type: 'warning',
                                 title: 'Alerta de Inactividad',
                                 message: `El conductor ${driver.name} parece inactivo por más tiempo del esperado.`,
                             });
                         }
                    }

                    return { ...driver, location: newLocation, lastMovedAt };
                })
            );
        }, 5000);

        return () => clearInterval(interval);
    }, [addNotification, currentUser]);

    useEffect(() => {
        if (currentUser?.role !== 'driver' || !currentUser.id) {
            return;
        }

        const driverId = currentUser.id;
        let watchId: number;

        if ('geolocation' in navigator) {
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    const newLocation: Location = { lat: latitude, lng: longitude };

                    setDrivers(prevDrivers => 
                        prevDrivers.map(driver => 
                            driver.id === driverId 
                            ? { ...driver, location: newLocation, lastMovedAt: new Date() } 
                            : driver
                        )
                    );
                },
                (error) => {
                    console.error("Error getting geolocation:", error);
                    if (error.code === error.PERMISSION_DENIED) {
                        addNotification({
                            recipient: driverId,
                            type: 'warning',
                            title: 'Permiso de Ubicación Denegado',
                            message: 'No se puede actualizar tu ubicación en tiempo real. Por favor, habilita los permisos de ubicación.'
                        });
                    }
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                }
            );
        } else {
             addNotification({
                recipient: driverId,
                type: 'warning',
                title: 'Geolocalización no soportada',
                message: 'Tu dispositivo no soporta la geolocalización.'
            });
        }


        return () => {
            if (watchId) {
                navigator.geolocation.clearWatch(watchId);
            }
        };
    }, [currentUser, addNotification]);


    const addOrder = useCallback((newOrderData: Omit<Order, 'id' | 'createdAt' | 'status' | 'assignedDriverId' | 'deliveryLocation' | 'pickupLocation' | 'pod' | 'deliveredAt' | 'rating' | 'customerInstructions'>): Order => {
        const newOrder: Order = {
            ...newOrderData,
            id: `ORD-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
            createdAt: new Date().toISOString(),
            status: OrderStatus.Pending,
            assignedDriverId: null,
            pickupLocation: geocodeAddress(newOrderData.pickupAddress),
            deliveryLocation: geocodeAddress(newOrderData.deliveryAddress),
        };
        setOrders(prev => [newOrder, ...prev]);
        return newOrder;
    }, []);

    const addBulkOrders = useCallback((newOrdersData: Omit<Order, 'id' | 'createdAt' | 'status' | 'assignedDriverId' | 'deliveryLocation' | 'pickupLocation' | 'pod' | 'deliveredAt' | 'rating' | 'customerInstructions'>[]) => {
        const newOrders: Order[] = newOrdersData.map(orderData => ({
             ...orderData,
            id: `ORD-${Math.random().toString(36).substring(2, 7).toUpperCase()}`,
            createdAt: new Date().toISOString(),
            status: OrderStatus.Pending,
            assignedDriverId: null,
            pickupLocation: geocodeAddress(orderData.pickupAddress),
            deliveryLocation: geocodeAddress(orderData.deliveryAddress),
        }));
        setOrders(prev => [...newOrders, ...prev]);
    }, []);

    const assignOrder = useCallback((orderId: string, driverId: string) => {
        const order = orders.find(o => o.id === orderId);
        if(!order) return;

        setOrders(prev => prev.map(o => 
            o.id === orderId 
            ? { ...o, assignedDriverId: driverId, status: OrderStatus.InProgress } 
            : o
        ));

        // Clear any existing optimized route as it's now invalid
        setDrivers(prev => prev.map(d => 
            d.id === driverId ? { ...d, optimizedRoute: undefined } : d
        ));

        sendMessage('admin', driverId, `Se te ha asignado un nuevo pedido: #${orderId}.`);
        
        addNotification({
            recipient: driverId,
            type: 'success',
            title: 'Nuevo Pedido Asignado',
            message: `Se te asignó el pedido #${order.id} para ${order.customerName}.`,
        });

    }, [orders, addNotification]);

    // Fix: Removed apiKey parameter to align with new guidelines.
    const performSmartAssignment = useCallback(async () => {
        const pendingOrders = orders.filter(o => o.status === OrderStatus.Pending);
        const onlineDrivers = drivers.filter(d => d.status === DriverStatus.Online);
        
        // Fix: Removed apiKey parameter from the call.
        const assignments = await getSmartAssignments(pendingOrders, onlineDrivers);
        
        if (assignments.length > 0) {
            let assignedCount = 0;
            assignments.forEach(assignment => {
                // Check if order and driver still exist and are valid for assignment
                const orderExists = orders.some(o => o.id === assignment.orderId && o.status === OrderStatus.Pending);
                const driverExists = drivers.some(d => d.id === assignment.driverId && d.status === DriverStatus.Online);
                if (orderExists && driverExists) {
                    assignOrder(assignment.orderId, assignment.driverId);
                    assignedCount++;
                }
            });
            addNotification({
                recipient: 'admin',
                type: 'success',
                title: 'Asignación Inteligente Completada',
                message: `Se asignaron ${assignedCount} pedidos de forma óptima.`
            });
        } else {
             addNotification({
                recipient: 'admin',
                type: 'info',
                title: 'Asignación Inteligente',
                message: `No se encontraron nuevas asignaciones óptimas.`
            });
        }
    }, [orders, drivers, assignOrder, addNotification]);

    const updateOrderStatus = useCallback((orderId: string, status: OrderStatus) => {
        const order = orders.find(o => o.id === orderId);
        if (!order || !order.assignedDriverId) return;

        const driver = drivers.find(d => d.id === order.assignedDriverId);
        if(!driver) return;
        
        if (status === OrderStatus.Delivered || status === OrderStatus.Failed) {
            // Clear optimized route upon completion of an order
            setDrivers(prev => prev.map(d =>
                d.id === driver.id ? { ...d, optimizedRoute: undefined } : d
            ));
        }

        setOrders(prev => prev.map(o => {
            if (o.id === orderId) {
                const updatedOrder: Order = { ...o, status };
                if (status === OrderStatus.Delivered) {
                    updatedOrder.deliveredAt = new Date().toISOString();
                }
                return updatedOrder;
            }
            return o;
        }));
        
        addNotification({
            recipient: 'admin',
            type: 'info',
            title: 'Actualización de Estado',
            message: `El conductor ${driver.name} actualizó el pedido #${order.id} a: ${status}.`
        });

    }, [orders, drivers, addNotification]);

    const submitPod = useCallback((orderId: string, podData: { signature: string; photo: File | null; notes: string; }) => {
        const order = orders.find(o => o.id === orderId);
        if (!order || !order.assignedDriverId) return;

        const driver = drivers.find(d => d.id === order.assignedDriverId);
        if(!driver) return;
        
        // Clear optimized route upon completion
        setDrivers(prev => prev.map(d =>
            d.id === driver.id ? { ...d, optimizedRoute: undefined } : d
        ));

        setOrders(prev => prev.map(o => {
            if (o.id === orderId) {
                return {
                    ...o,
                    status: OrderStatus.Delivered,
                    deliveredAt: new Date().toISOString(),
                    pod: {
                        signatureUrl: podData.signature,
                        photoUrl: podData.photo ? URL.createObjectURL(podData.photo) : '',
                        notes: podData.notes,
                    }
                };
            }
            return o;
        }));

        addNotification({
            recipient: 'admin',
            type: 'success',
            title: '¡Pedido Entregado!',
            message: `${driver.name} entregó el pedido #${order.id}. POD registrado.`
        });

    }, [orders, drivers, addNotification]);
    
    const sendMessage = useCallback((senderId: string, receiverId: string, text: string) => {
        const newMessage: Message = {
            id: `MSG-${Date.now()}`,
            senderId,
            receiverId,
            text,
            timestamp: new Date(),
        };
        setMessages(prev => [...prev, newMessage]);
    }, []);

    const optimizeRoute = useCallback((driverId: string) => {
        const driver = drivers.find(d => d.id === driverId);
        if (!driver) return;

        let currentLoc = driver.location;
        const driverOrders = orders.filter(o => o.assignedDriverId === driverId && o.status === OrderStatus.InProgress);
        const remainingOrders = [...driverOrders];
        const optimizedOrder: Order[] = [];

        while(remainingOrders.length > 0) {
            let nearestOrderIndex = -1;
            let minDistance = Infinity;

            for (let i = 0; i < remainingOrders.length; i++) {
                const distance = haversineDistance(currentLoc, remainingOrders[i].deliveryLocation);
                if (distance < minDistance) {
                    minDistance = distance;
                    nearestOrderIndex = i;
                }
            }

            if (nearestOrderIndex !== -1) {
                const nearestOrder = remainingOrders.splice(nearestOrderIndex, 1)[0];
                optimizedOrder.push(nearestOrder);
                currentLoc = nearestOrder.deliveryLocation;
            } else {
                break; // Should not happen
            }
        }
        
        const sortedInProgressOrders = driverOrders.sort((a, b) => {
            const indexA = optimizedOrder.findIndex(o => o.id === a.id);
            const indexB = optimizedOrder.findIndex(o => o.id === b.id);
            return indexA - indexB;
        });

        setOrders(prevOrders => {
            const otherOrders = prevOrders.filter(o => o.assignedDriverId !== driverId);
            const nonInProgressForDriver = prevOrders.filter(o => o.assignedDriverId === driverId && o.status !== OrderStatus.InProgress);
            return [...otherOrders, ...nonInProgressForDriver, ...sortedInProgressOrders];
        });

        const routeCoordinates = [driver.location, ...optimizedOrder.map(o => o.deliveryLocation)];
        setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, optimizedRoute: routeCoordinates } : d));

        sendMessage('admin', driverId, `Tu ruta ha sido optimizada para mayor eficiencia.`);
    }, [drivers, orders, sendMessage]);

    const registerDriver = useCallback((driverData: Omit<Driver, 'id' | 'location' | 'status' | 'accountStatus'>) => {
        const newDriver: Driver = {
            ...driverData,
            id: `D-${Math.random().toString(36).substring(2, 6).toUpperCase()}`,
            location: { lat: -34.6037, lng: -58.3816 }, // Default location
            status: DriverStatus.Offline,
            accountStatus: AccountStatus.Pending,
        };
        setDrivers(prev => [...prev, newDriver]);
        addAuditLog(newDriver.id, 'Registrado');
        addNotification({
            recipient: 'admin',
            type: 'info',
            title: 'Nuevo Registro de Conductor',
            message: `${newDriver.name} se ha registrado y está pendiente de aprobación.`
        });
    }, [addNotification, addAuditLog]);

    const approveDriver = useCallback((driverId: string) => {
        setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, accountStatus: AccountStatus.Approved } : d));
        addAuditLog(driverId, 'Aprobado');
    }, [addAuditLog]);

    const rejectDriver = useCallback((driverId: string) => {
        setDrivers(prev => prev.map(d => d.id === driverId ? { ...d, accountStatus: AccountStatus.Rejected } : d));
        addAuditLog(driverId, 'Rechazado');
    }, [addAuditLog]);
    
    const deleteDriver = useCallback((driverId: string) => {
        setDrivers(prev => prev.filter(d => d.id !== driverId));
        // Optional: Unassign orders from the deleted driver
        setOrders(prev => prev.map(o => o.assignedDriverId === driverId ? { ...o, assignedDriverId: null, status: OrderStatus.Pending } : o));
        addAuditLog(driverId, 'Eliminado');
    }, [addAuditLog]);
    
    const rateDelivery = useCallback((orderId: string, rating: number) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, rating } : o));
    }, []);

    const addCustomerInstruction = useCallback((orderId: string, instruction: string) => {
        setOrders(prev => prev.map(o => o.id === orderId ? { ...o, customerInstructions: instruction } : o));
        const order = orders.find(o => o.id === orderId);
        if (order && order.assignedDriverId) {
            addNotification({
                recipient: order.assignedDriverId,
                type: 'info',
                title: 'Nueva Instrucción de Cliente',
                message: `Pedido #${orderId}: "${instruction}"`,
            });
        }
    }, [orders, addNotification]);


    return { drivers, orders, messages, auditLogs, driverStatusLogs, addOrder, addBulkOrders, assignOrder, updateOrderStatus, submitPod, sendMessage, optimizeRoute, registerDriver, approveDriver, rejectDriver, deleteDriver, performSmartAssignment, rateDelivery, addCustomerInstruction };
};
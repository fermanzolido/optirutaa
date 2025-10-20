

export interface Location {
  lat: number;
  lng: number;
}

export enum OrderStatus {
  Pending = 'Pendiente',
  InProgress = 'En Progreso',
  Delivered = 'Entregado',
  Failed = 'Fallido',
}

export interface OrderItem {
  name: string;
  quantity: number;
}

export interface ProofOfDelivery {
    signatureUrl: string;
    photoUrl: string;
    notes: string;
}

export interface Order {
  id: string;
  customerName: string;
  pickupAddress: string;
  deliveryAddress: string;
  pickupLocation: Location;
  deliveryLocation: Location;
  items: OrderItem[];
  status: OrderStatus;
  assignedDriverId: string | null;
  createdAt: string; // ISO string
  deliveredAt?: string; // ISO string
  pod?: ProofOfDelivery;
  rating?: number;
  customerInstructions?: string;
}

export enum DriverStatus {
  Online = 'En línea',
  OnBreak = 'En Pausa',
  Offline = 'Desconectado',
}

export enum AccountStatus {
    Pending = 'Pendiente',
    Approved = 'Aprobado',
    Rejected = 'Rechazado',
}

export interface Driver {
  id: string;
  name: string;
  email: string;
  password?: string;
  vehicle: string;
  licensePlate: string;
  location: Location;
  status: DriverStatus;
  accountStatus: AccountStatus;
  optimizedRoute?: Location[];
  lastMovedAt?: Date;
  vehicleCapacity: number; // in kg
  fuelType: 'Gasolina' | 'Diesel' | 'Eléctrico' | 'Híbrido';
}

export interface User {
    role: 'admin' | 'driver';
    id?: string; // Driver ID if role is driver
    name: string;
}

export type View = 'dashboard' | 'orders' | 'drivers' | 'analytics' | 'messages' | 'settings' | 'copilot' | 'history';

export interface Message {
  id: string;
  senderId: string; // 'admin' or driver ID
  receiverId: string; // 'admin' or driver ID
  text: string;
  timestamp: Date;
}

export interface Notification {
    id: string;
    recipient: 'admin' | string; // 'admin' or driver ID
    type: 'success' | 'info' | 'warning';
    title: string;
    message: string;
    read: boolean;
    createdAt: Date;
}

export type AuditLogAction = 'Registrado' | 'Aprobado' | 'Rechazado' | 'Eliminado';

export interface AuditLog {
    id: string;
    driverId: string;
    action: AuditLogAction;
    timestamp: Date;
}

export interface DriverStatusLog {
    id: string;
    driverId: string;
    status: DriverStatus;
    timestamp: Date;
}

export interface CoPilotMessage {
  // Fix: The 'assistant' role is not valid for the Gemini API. It should be 'model'.
  role: 'user' | 'model';
  text: string;
  isFunctionCall?: boolean;
}
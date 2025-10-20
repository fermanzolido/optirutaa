
import React, { useState } from 'react';
import { Route, Briefcase, Send, LogIn, Search } from 'lucide-react';
// Fix: Added .ts extension to the import path.
import { Driver, User as UserType, Order } from '../types.ts';
// Fix: Added .ts extension to the import path.
import { AccountStatus } from '../types.ts';
// Fix: Added .tsx extension to the import path.
import { DriverRegistrationModal } from './DriverRegistrationModal.tsx';

type NewOrderData = Omit<Order, 'id' | 'createdAt' | 'status' | 'assignedDriverId' | 'deliveryLocation' | 'pickupLocation' | 'pod' | 'deliveredAt' | 'rating' | 'customerInstructions'>;
type RegisterDriverData = Omit<Driver, 'id' | 'location' | 'status' | 'accountStatus'>;

interface LoginScreenProps {
    onLogin: (user: UserType) => void;
    onCreateOrder: (orderData: NewOrderData) => void;
    onRegisterDriver: (driverData: RegisterDriverData) => void;
    onTrackOrder: (orderId: string) => boolean;
    drivers: Driver[];
}

const NeumorphicInput: React.FC<any> = ({ label, type = 'text', value, onChange, required = false, placeholder = '' }) => (
    <div>
        {label && <label className="block text-sm font-medium text-[var(--color-text-strong)] mb-2">{label}</label>}
        <input 
            type={type} 
            value={value} 
            onChange={onChange} 
            className="w-full px-4 py-3 bg-[var(--color-surface)] rounded-lg shadow-[inset_3px_3px_6px_var(--color-shadow-dark),inset_-3px_-3px_6px_var(--color-shadow-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition-all"
            required={required}
            placeholder={placeholder}
            {...(type === 'number' && { min: 1 })}
        />
    </div>
);


const CreateOrderForm: React.FC<{ onCreateOrder: (orderData: NewOrderData) => void }> = ({ onCreateOrder }) => {
    const [customerName, setCustomerName] = useState('');
    const [pickupAddress, setPickupAddress] = useState('');
    const [deliveryAddress, setDeliveryAddress] = useState('');
    const [itemName, setItemName] = useState('');
    const [itemQuantity, setItemQuantity] = useState(1);
    
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!customerName || !pickupAddress || !deliveryAddress || !itemName) {
            alert('Por favor, complete todos los campos para crear su envío.');
            return;
        }
        onCreateOrder({
            customerName,
            pickupAddress,
            deliveryAddress,
            items: [{ name: itemName, quantity: itemQuantity > 0 ? itemQuantity : 1 }],
        });
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <NeumorphicInput label="Tu Nombre o Empresa" value={customerName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setCustomerName(e.target.value)} required />
            <NeumorphicInput label="Dirección de Recogida" value={pickupAddress} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPickupAddress(e.target.value)} required />
            <NeumorphicInput label="Dirección de Entrega" value={deliveryAddress} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDeliveryAddress(e.target.value)} required />
             <div className="grid grid-cols-3 gap-4">
                <div className="col-span-2">
                    <NeumorphicInput label="Ítem a enviar" value={itemName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setItemName(e.target.value)} placeholder="Ej: Documentos" required />
                </div>
                <div>
                    <NeumorphicInput label="Cantidad" type="number" value={itemQuantity} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setItemQuantity(parseInt(e.target.value, 10))} required />
                </div>
            </div>
            <button type="submit" className="w-full flex justify-center items-center p-3 rounded-lg text-lg font-semibold text-white bg-[var(--color-primary)] shadow-[5px_5px_10px_var(--color-shadow-dark),_-5px_-5px_10px_var(--color-shadow-light)] hover:bg-[var(--color-primary-hover)] active:shadow-[inset_2px_2px_5px_var(--color-shadow-dark),_-inset_-2px_-2px_5px_var(--color-shadow-light)] transition-all">
                <Send className="mr-3 h-6 w-6" />
                Crear Envío y Rastrear
            </button>
        </form>
    );
};

export const LoginScreen: React.FC<LoginScreenProps> = ({ onLogin, onCreateOrder, onRegisterDriver, onTrackOrder, drivers }) => {
    const [isRegistrationModalOpen, setIsRegistrationModalOpen] = useState(false);
    const [driverEmail, setDriverEmail] = useState('');
    const [driverPassword, setDriverPassword] = useState('');
    const [loginError, setLoginError] = useState('');
    const [trackingId, setTrackingId] = useState('');
    const [trackingError, setTrackingError] = useState('');
    
    const handleDriverLogin = (e: React.FormEvent) => {
        e.preventDefault();
        setLoginError('');
        const driver = drivers.find(d => d.email === driverEmail);

        if (driver && driver.password === driverPassword) {
            if (driver.accountStatus === AccountStatus.Approved) {
                onLogin({ role: 'driver', id: driver.id, name: driver.name });
            } else {
                setLoginError('Tu cuenta aún no ha sido aprobada.');
            }
        } else {
            setLoginError('Correo o contraseña incorrectos.');
        }
    };
    
    const handleTrackingSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setTrackingError('');
        if (!trackingId.trim()) {
            setTrackingError('Por favor, ingresa un ID de seguimiento.');
            return;
        }
        const success = onTrackOrder(trackingId.trim());
        if (!success) {
            setTrackingError('ID de seguimiento no encontrado.');
        }
    };

    return (
        <>
        <div className="flex items-center justify-center min-h-screen p-4">
            <div className="w-full max-w-5xl mx-auto">
                 <div className="flex flex-col items-center mb-10 text-center">
                    <Route size={48} className="text-[var(--color-primary)]" />
                    <h1 className="text-3xl sm:text-4xl font-bold text-[var(--color-text-strong)] mt-2">Bienvenido a OptiRuta</h1>
                    <p className="text-[var(--color-text-main)] text-lg">Tu solución logística. Rápida, simple y eficiente.</p>
                </div>
                
                <div className="mb-8 p-6 bg-[var(--color-surface)] rounded-[var(--border-radius-main)] shadow-[5px_5px_10px_var(--color-shadow-dark),_-5px_-5px_10px_var(--color-shadow-light)] border border-[var(--color-shadow-light)]">
                    <h2 className="text-xl font-bold text-[var(--color-text-strong)] mb-3 text-center sm:text-left">¿Ya tienes un envío? Rastréalo aquí.</h2>
                    <form onSubmit={handleTrackingSubmit} className="flex flex-col sm:flex-row gap-3">
                        <NeumorphicInput 
                            placeholder="Ingresa tu ID de seguimiento (ej: ORD-A1B2C)"
                            value={trackingId}
                            onChange={(e: any) => { setTrackingId(e.target.value); setTrackingError(''); }}
                        />
                        <button type="submit" className="flex-shrink-0 flex justify-center items-center px-6 py-2.5 font-semibold text-[var(--color-primary)] bg-[var(--color-surface)] rounded-lg shadow-[4px_4px_8px_var(--color-shadow-dark),_-4px_-4px_8px_var(--color-shadow-light)] hover:text-[var(--color-primary-hover)] active:shadow-[inset_2px_2px_5px_var(--color-shadow-dark),_-inset_-2px_-2px_5px_var(--color-shadow-light)] transition-all">
                           <Search className="mr-2 h-5 w-5" />
                           Rastrear
                        </button>
                    </form>
                    {trackingError && <p className="text-red-500 text-sm mt-2 text-center sm:text-left">{trackingError}</p>}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="p-8 bg-[var(--color-surface)] rounded-[var(--border-radius-main)] shadow-[5px_5px_10px_var(--color-shadow-dark),_-5px_-5px_10px_var(--color-shadow-light)] border border-[var(--color-shadow-light)]">
                        <h2 className="text-2xl font-bold text-[var(--color-text-strong)] mb-2">¿Necesitas enviar algo?</h2>
                        <p className="text-[var(--color-text-main)] mb-6">Completa los datos y obtén un número de seguimiento al instante.</p>
                        <CreateOrderForm onCreateOrder={onCreateOrder} />
                    </div>

                    <div className="p-8 bg-[var(--color-surface)] rounded-[var(--border-radius-main)] shadow-[5px_5px_10px_var(--color-shadow-dark),_-5px_-5px_10px_var(--color-shadow-light)] flex flex-col border border-[var(--color-shadow-light)]">
                         <h2 className="text-2xl font-bold text-[var(--color-text-strong)] mb-2">Acceso para Miembros</h2>
                         <p className="text-[var(--color-text-main)] mb-6">Ingresa a tu panel de control.</p>
                        <div className="space-y-4 flex-grow flex flex-col">
                            <button 
                                onClick={() => onLogin({ role: 'admin', name: 'Admin Despacho' })}
                                className="w-full flex items-center p-4 rounded-lg text-lg font-semibold text-[var(--color-primary)] bg-[var(--color-surface)] shadow-[5px_5px_10px_var(--color-shadow-dark),_-5px_-5px_10px_var(--color-shadow-light)] hover:text-[var(--color-primary-hover)] active:shadow-[inset_2px_2px_5px_var(--color-shadow-dark),_-inset_-2px_-2px_5px_var(--color-shadow-light)] transition-all"
                            >
                                <Briefcase className="mr-4 h-6 w-6" />
                                Ingresar como Despachador
                            </button>

                            <div className="relative my-4">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-[var(--color-border)]" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-[var(--color-surface)] text-[var(--color-text-main)]">o ingresar como conductor</span>
                                </div>
                            </div>
                            
                            <form onSubmit={handleDriverLogin} className="space-y-3">
                                <NeumorphicInput 
                                    placeholder="Correo de conductor"
                                    type="email"
                                    value={driverEmail}
                                    onChange={(e: any) => setDriverEmail(e.target.value)}
                                    required
                                />
                                <NeumorphicInput
                                    placeholder="Contraseña"
                                    type="password"
                                    value={driverPassword}
                                    onChange={(e: any) => setDriverPassword(e.target.value)}
                                    required
                                />
                                {loginError && <p className="text-red-500 text-sm">{loginError}</p>}
                                <button type="submit" className="w-full flex justify-center items-center p-3 rounded-lg text-md font-semibold text-[var(--color-text-strong)] bg-[var(--color-surface)] shadow-[4px_4px_8px_var(--color-shadow-dark),_-4px_-4px_8px_var(--color-shadow-light)] hover:shadow-[2px_2px_5px_var(--color-shadow-dark),_-2px_-2px_5px_var(--color-shadow-light)] active:shadow-[inset_2px_2px_5px_var(--color-shadow-dark),_-inset_-2px_-2px_5px_var(--color-shadow-light)] transition-all">
                                    <LogIn className="mr-2 h-5 w-5" />
                                    Ingresar como Conductor
                                </button>
                            </form>
                             <div className="text-center mt-auto pt-4">
                                <p className="text-sm text-[var(--color-text-main)]">
                                    ¿Quieres ser conductor?{' '}
                                    <button onClick={() => setIsRegistrationModalOpen(true)} className="font-medium text-[var(--color-primary)] hover:underline">
                                        Regístrate aquí
                                    </button>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
         <DriverRegistrationModal 
            isOpen={isRegistrationModalOpen} 
            onClose={() => setIsRegistrationModalOpen(false)} 
            onRegister={onRegisterDriver}
        />
        </>
    );
};

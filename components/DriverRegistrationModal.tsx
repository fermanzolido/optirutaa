
import React, { useState, useEffect } from 'react';
// Fix: Added .ts extension to the import path.
import type { Driver } from '../types.ts';
// Fix: Added .tsx extension to the import path.
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card.tsx';
import { X, UserPlus } from 'lucide-react';

type RegisterDriverData = Omit<Driver, 'id' | 'location' | 'status' | 'accountStatus'>;

interface DriverRegistrationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegister: (driverData: RegisterDriverData) => void;
}

export const DriverRegistrationModal: React.FC<DriverRegistrationModalProps> = ({ isOpen, onClose, onRegister }) => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        vehicle: '',
        licensePlate: '',
    });
    const [error, setError] = useState('');
    
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

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.id]: e.target.value });
    };
    
    const NeumorphicInput: React.FC<{id: string, placeholder: string, type?: string, value: string, onChange: (e: React.ChangeEvent<HTMLInputElement>) => void, required?: boolean}> = ({ id, placeholder, type = 'text', value, onChange, required = false }) => (
        <input 
            type={type}
            id={id}
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            className="w-full px-4 py-3 bg-[var(--color-surface)] rounded-lg shadow-[inset_3px_3px_6px_var(--color-shadow-dark),inset_-3px_-3px_6px_var(--color-shadow-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition"
            required={required}
        />
    );

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        
        if (Object.values(formData).some(val => (val as string).trim() === '')) {
            setError('Todos los campos son obligatorios.');
            return;
        }

        if (formData.password !== formData.confirmPassword) {
            setError('Las contraseñas no coinciden.');
            return;
        }

        const { name, email, vehicle, licensePlate, password } = formData;
        onRegister({ name, email, vehicle, licensePlate, password });

        alert('¡Registro exitoso! Un administrador revisará tu solicitud pronto.');
        onClose();
    };

    return (
        <div 
            role="dialog"
            aria-modal="true"
            aria-labelledby="driverRegistrationModalTitle"
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300"
            onClick={onClose}
        >
            <div 
                className="bg-[var(--color-surface)] rounded-[var(--border-radius-main)] shadow-[5px_5px_10px_var(--color-shadow-dark),_-5px_-5px_10px_var(--color-shadow-light)] w-full max-w-md scale-95 opacity-0 animate-scale-in border border-[var(--color-shadow-light)]"
                style={{ animation: 'scaleIn 0.3s forwards' }}
                onClick={e => e.stopPropagation()}
            >
                <CardHeader className="flex justify-between items-center relative">
                    <CardTitle id="driverRegistrationModalTitle" className="flex items-center">
                        <UserPlus className="mr-3" />
                        Registro de Conductor
                    </CardTitle>
                    <button 
                        onClick={onClose} 
                        className="absolute top-4 right-4 p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-strong)] transition rounded-full hover:bg-[var(--color-bg)]"
                        aria-label="Cerrar modal de registro de conductor"
                    >
                        <X size={24} />
                    </button>
                </CardHeader>
                <CardContent className="py-6">
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <NeumorphicInput id="name" placeholder="Nombre Completo" value={formData.name} onChange={handleChange} required />
                        <NeumorphicInput id="email" placeholder="Correo Electrónico" type="email" value={formData.email} onChange={handleChange} required />
                        <NeumorphicInput id="password" placeholder="Contraseña" type="password" value={formData.password} onChange={handleChange} required />
                        <NeumorphicInput id="confirmPassword" placeholder="Confirmar Contraseña" type="password" value={formData.confirmPassword} onChange={handleChange} required />
                        <NeumorphicInput id="vehicle" placeholder="Modelo del Vehículo (Ej: Moto Honda Wave)" value={formData.vehicle} onChange={handleChange} required />
                        <NeumorphicInput id="licensePlate" placeholder="Matrícula (o N/A si no aplica)" value={formData.licensePlate} onChange={handleChange} required />
                        
                        {error && <p className="text-red-500 text-sm">{error}</p>}

                        <div className="flex justify-end pt-4 space-x-3">
                            <button type="button" onClick={onClose} className="px-5 py-2 text-[var(--color-text-strong)] font-semibold rounded-lg bg-[var(--color-surface)] shadow-[4px_4px_8px_var(--color-shadow-dark),_-4px_-4px_8px_var(--color-shadow-light)] hover:shadow-[2px_2px_5px_var(--color-shadow-dark),_-2px_-2px_5px_var(--color-shadow-light)] active:shadow-[inset_2px_2px_5px_var(--color-shadow-dark),_-inset_-2px_-2px_5px_var(--color-shadow-light)] transition-all">Cancelar</button>
                            <button type="submit" className="px-5 py-2 text-white font-semibold rounded-lg bg-[var(--color-primary)] shadow-[4px_4px_8px_var(--color-shadow-dark),_-4px_-4px_8px_var(--color-shadow-light)] hover:bg-[var(--color-primary-hover)] active:shadow-[inset_2px_2px_5px_var(--color-shadow-dark),_-inset_-2px_-2px_5px_var(--color-shadow-light)] transition-all">Registrarse</button>
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
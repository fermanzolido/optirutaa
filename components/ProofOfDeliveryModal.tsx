import React, { useState, useRef, useEffect } from 'react';
// Fix: Added .ts extension to the import path.
import type { Order } from '../types.ts';
// Fix: Added .tsx extension to the import path.
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card.tsx';
import { X, Camera, Edit3, Upload } from 'lucide-react';

interface ProofOfDeliveryModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (orderId: string, podData: { signature: string, photo: File | null, notes: string }) => void;
}

export const ProofOfDeliveryModal: React.FC<ProofOfDeliveryModalProps> = ({ order, isOpen, onClose, onSubmit }) => {
    const [notes, setNotes] = useState('');
    const [photo, setPhoto] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const photoInputRef = useRef<HTMLInputElement>(null);
    const [signature, setSignature] = useState(''); 

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

    // Create a preview URL when a photo is selected
    useEffect(() => {
        if (!photo) {
            setPreviewUrl(null);
            return;
        }
        const objectUrl = URL.createObjectURL(photo);
        setPreviewUrl(objectUrl);

        // Cleanup the object URL when the component unmounts or the photo changes
        return () => URL.revokeObjectURL(objectUrl);
    }, [photo]);

    if (!isOpen) return null;

    const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setPhoto(e.target.files[0]);
        }
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!signature && !photo) {
            alert('Debe proporcionar al menos una firma o una foto.');
            return;
        }
        onSubmit(order.id, { signature, photo, notes });
    };

    return (
        <div 
            role="dialog"
            aria-modal="true"
            aria-labelledby="podModalTitle"
            className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4 transition-opacity duration-300"
            onClick={onClose}
        >
            <div 
                className="bg-[var(--color-surface)] rounded-[var(--border-radius-main)] shadow-[5px_5px_10px_var(--color-shadow-dark),_-5px_-5px_10px_var(--color-shadow-light)] w-full max-w-lg scale-95 opacity-0 animate-scale-in border border-[var(--color-shadow-light)]"
                style={{ animation: 'scaleIn 0.3s forwards' }}
                onClick={e => e.stopPropagation()}
            >
                <CardHeader className="flex justify-between items-center relative">
                    <CardTitle id="podModalTitle">Registrar Prueba de Entrega (POD)</CardTitle>
                    <button 
                        onClick={onClose} 
                        className="absolute top-4 right-4 p-2 text-[var(--color-text-muted)] hover:text-[var(--color-text-strong)] transition rounded-full hover:bg-[var(--color-bg)]"
                        aria-label="Cerrar modal de prueba de entrega"
                    >
                        <X size={24} />
                    </button>
                </CardHeader>
                <CardContent className="py-6">
                    <p className="mb-4 text-[var(--color-text-strong)]">Pedido: <span className="font-bold text-[var(--color-primary)]">#{order.id}</span> para <span className="font-bold">{order.customerName}</span></p>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-strong)] mb-2">Firma del Receptor</label>
                            <div className="border-none rounded-md p-2 bg-[var(--color-surface)] shadow-[inset_3px_3px_6px_var(--color-shadow-dark),_-inset_-3px_-3px_6px_var(--color-shadow-light)] h-32 flex items-center justify-center">
                                <button type="button" onClick={() => setSignature('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==')} className={`flex items-center p-3 rounded-lg ${signature ? 'text-green-600' : 'text-[var(--color-text-main)]'} bg-[var(--color-surface)] shadow-[4px_4px_8px_var(--color-shadow-dark),_-4px_-4px_8px_var(--color-shadow-light)] active:shadow-[inset_2px_2px_5px_var(--color-shadow-dark),_-inset_-2px_-2px_5px_var(--color-shadow-light)] transition-all`}>
                                    <Edit3 className="mr-2" /> {signature ? 'Firma Capturada' : 'Click para firmar'}
                                </button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-[var(--color-text-strong)] mb-2">Foto de Entrega</label>
                            <input type="file" accept="image/*" capture="environment" ref={photoInputRef} onChange={handlePhotoChange} className="hidden" />
                            <button type="button" onClick={() => photoInputRef.current?.click()} className="w-full flex items-center justify-center px-4 py-3 border-none rounded-md text-[var(--color-text-strong)] bg-[var(--color-surface)] shadow-[4px_4px_8px_var(--color-shadow-dark),_-4px_-4px_8px_var(--color-shadow-light)] hover:shadow-[2px_2px_5px_var(--color-shadow-dark),_-2px_-2px_5px_var(--color-shadow-light)] active:shadow-[inset_2px_2px_5px_var(--color-shadow-dark),_-inset_-2px_-2px_5px_var(--color-shadow-light)] transition-all">
                                <Camera className="mr-2"/>
                                {photo ? `Archivo: ${photo.name}` : 'Tomar o Subir Foto'}
                            </button>
                            {previewUrl && (
                                <div className="mt-4">
                                    <p className="text-sm font-medium text-[var(--color-text-strong)] mb-2">Vista Previa:</p>
                                    <img 
                                        src={previewUrl} 
                                        alt="Vista previa de la entrega" 
                                        className="rounded-lg shadow-[3px_3px_6px_var(--color-shadow-dark),_-3px_-3px_6px_var(--color-shadow-light)] w-full max-h-48 object-cover"
                                    />
                                </div>
                            )}
                        </div>
                         <div>
                            <label htmlFor="notes" className="block text-sm font-medium text-[var(--color-text-strong)] mb-2">Notas Adicionales</label>
                            <textarea id="notes" value={notes} onChange={e => setNotes(e.target.value)} rows={3} className="w-full px-4 py-3 bg-[var(--color-surface)] rounded-lg shadow-[inset_3px_3px_6px_var(--color-shadow-dark),inset_-3px_-3px_6px_var(--color-shadow-light)] focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] transition" placeholder="Ej: Se dejó en recepción con el Sr. Gonzalez." />
                        </div>
                        <div className="flex justify-end pt-4 space-x-3">
                            <button type="button" onClick={onClose} className="px-5 py-2 text-[var(--color-text-strong)] font-semibold rounded-lg bg-[var(--color-surface)] shadow-[4px_4px_8px_var(--color-shadow-dark),_-4px_-4px_8px_var(--color-shadow-light)] hover:shadow-[2px_2px_5px_var(--color-shadow-dark),_-2px_-2px_5px_var(--color-shadow-light)] active:shadow-[inset_2px_2px_5px_var(--color-shadow-dark),_-inset_-2px_-2px_5px_var(--color-shadow-light)] transition-all">Cancelar</button>
                            <button type="submit" className="px-5 py-2 text-white font-semibold rounded-lg bg-[var(--color-primary)] shadow-[4px_4px_8px_var(--color-shadow-dark),_-4px_-4px_8px_var(--color-shadow-light)] hover:bg-[var(--color-primary-hover)] active:shadow-[inset_2px_2px_5px_var(--color-shadow-dark),_-inset_-2px_-2px_5px_var(--color-shadow-light)] transition-all flex items-center">
                                <Upload className="mr-2" size={18}/>
                                Enviar POD
                            </button>
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
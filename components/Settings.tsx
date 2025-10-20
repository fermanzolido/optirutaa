
import React from 'react';
// Fix: Added .tsx extension to the import path.
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card.tsx';
import { KeyRound, Info } from 'lucide-react';

export const Settings: React.FC = () => {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <KeyRound className="mr-3 text-[var(--color-primary)]" />
                    Configuración de API
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4 max-w-2xl">
                    <div className="flex items-start p-4 bg-[var(--color-surface)] rounded-lg shadow-[inset_2px_2px_5px_var(--color-shadow-dark),_-inset_-2px_-2px_5px_var(--color-shadow-light)]">
                        <Info className="h-5 w-5 text-blue-500 mr-3 mt-1 flex-shrink-0" />
                        <div>
                            <h3 className="text-lg font-semibold text-[var(--color-text-strong)]">API Key de Google Gemini</h3>
                            <p className="text-sm text-[var(--color-text-main)] mt-1">
                                Las funciones de inteligencia artificial, como la "Asignación Inteligente", están habilitadas mediante una clave de API de Google Gemini.
                                Esta clave se configura de forma segura en el entorno del servidor y no requiere ninguna acción por tu parte.
                            </p>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
};

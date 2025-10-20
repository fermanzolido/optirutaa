import React from 'react';
import type { Driver, DriverStatusLog } from '../types.ts';
import { DriverStatus } from '../types.ts';
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card.tsx';
import { History, Activity, Coffee, PowerOff } from 'lucide-react';

interface DriverHistoryProps {
  driver: Driver;
  driverStatusLogs: DriverStatusLog[];
}

const getStatusIcon = (status: DriverStatus) => {
    switch (status) {
        case DriverStatus.Online:
            return <Activity className="h-5 w-5 text-green-500" />;
        case DriverStatus.OnBreak:
            return <Coffee className="h-5 w-5 text-yellow-600" />;
        case DriverStatus.Offline:
            return <PowerOff className="h-5 w-5 text-red-500" />;
        default:
            return <Activity className="h-5 w-5 text-gray-400" />;
    }
};


export const DriverHistory: React.FC<DriverHistoryProps> = ({ driver, driverStatusLogs }) => {
    const personalLogs = driverStatusLogs
        .filter(log => log.driverId === driver.id)
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center">
                    <History className="mr-3 text-[var(--color-primary)]" />
                    Mi Historial de Actividad
                </CardTitle>
            </CardHeader>
            <CardContent>
                {personalLogs.length > 0 ? (
                    <div className="space-y-4">
                        {personalLogs.map(log => (
                            <div key={log.id} className="flex items-center p-3 bg-[var(--color-bg)] rounded-lg shadow-inner">
                                <div className="p-2 bg-[var(--color-surface)] rounded-full shadow-[2px_2px_4px_var(--color-shadow-dark),_-2px_-2px_4px_var(--color-shadow-light)] mr-4">
                                     {getStatusIcon(log.status)}
                                </div>
                                <div className="flex-grow">
                                    <p className="font-semibold text-sm text-[var(--color-text-strong)]">
                                        Cambiaste tu estado a "{log.status}"
                                    </p>
                                </div>
                                <p className="text-xs text-[var(--color-text-muted)] font-medium">
                                    {new Date(log.timestamp).toLocaleString('es-AR', {
                                        day: '2-digit',
                                        month: 'short',
                                        year: 'numeric',
                                        hour: '2-digit',
                                        minute: '2-digit'
                                    })}
                                </p>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12 text-[var(--color-text-main)]">
                        <p className="font-semibold">No hay historial de actividad</p>
                        <p className="text-sm">Tus cambios de estado aparecerán aquí.</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

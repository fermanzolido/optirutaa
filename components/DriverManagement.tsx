import React, { useState, useMemo } from 'react';
// Fix: Added .ts extension to the import path.
import type { Driver, AuditLog, DriverStatusLog } from '../types.ts';
// Fix: Added .ts extension to the import path.
import { AccountStatus, DriverStatus } from '../types.ts';
// Fix: Added .tsx extension to the import path.
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card.tsx';
import { UserCheck, UserX, Clock, UserPlus, Trash2, ChevronDown, History, Box, Fuel, Activity } from 'lucide-react';
// Fix: Added .tsx extension to the import path.
import { ConfirmationModal } from './ui/ConfirmationModal.tsx';


interface DriverManagementProps {
  drivers: Driver[];
  auditLogs: AuditLog[];
  driverStatusLogs: DriverStatusLog[];
  onApprove: (driverId: string) => void;
  onReject: (driverId: string) => void;
  onDelete: (driverId: string) => void;
}

const getDriverStatusBadge = (status: DriverStatus) => {
    let colorClass = '';
    switch (status) {
        case DriverStatus.Online: colorClass = 'text-green-600'; break;
        case DriverStatus.OnBreak: colorClass = 'text-yellow-700'; break;
        case DriverStatus.Offline: colorClass = 'text-[var(--color-text-muted)]'; break;
        default: return null;
    }
    return <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-lg bg-[var(--color-surface)] shadow-[2px_2px_4px_var(--color-shadow-dark),_-2px_-2px_4px_var(--color-shadow-light)] ${colorClass}`}>{status}</span>;
}

type Tab = 'pending' | 'active' | 'rejected';

const AuditHistory: React.FC<{ logs: AuditLog[] }> = ({ logs }) => {
    if (logs.length === 0) {
        return <p className="text-sm text-[var(--color-text-muted)] italic">No hay historial de auditoría.</p>;
    }

    return (
        <div className="space-y-3">
            {logs.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime()).map(log => (
                <div key={log.id} className="flex items-center text-sm">
                    <History size={14} className="mr-3 text-[var(--color-primary)] flex-shrink-0" />
                    <span className="font-medium text-[var(--color-text-strong)] w-40">{new Date(log.timestamp).toLocaleString()}</span>
                    <span className="text-[var(--color-text-main)]">{log.action} por administrador.</span>
                </div>
            ))}
        </div>
    );
};

const StatusHistory: React.FC<{ logs: DriverStatusLog[] }> = ({ logs }) => {
    if (logs.length === 0) {
        return <p className="text-sm text-[var(--color-text-muted)] italic">No hay historial de estado.</p>;
    }

    return (
        <div className="space-y-3">
            {logs.sort((a,b) => b.timestamp.getTime() - a.timestamp.getTime()).map(log => (
                <div key={log.id} className="flex items-center text-sm">
                    <Activity size={14} className="mr-3 text-[var(--color-primary)] flex-shrink-0" />
                    <span className="font-medium text-[var(--color-text-strong)] w-40">{new Date(log.timestamp).toLocaleString()}</span>
                    <span className="text-[var(--color-text-main)]">Cambió estado a: <span className="font-semibold">{log.status}</span></span>
                </div>
            ))}
        </div>
    );
};


const DriverDetailView: React.FC<{ driver: Driver, auditLogs: AuditLog[], statusLogs: DriverStatusLog[] }> = ({ driver, auditLogs, statusLogs }) => (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
            <h4 className="font-semibold text-[var(--color-text-strong)] mb-2">Detalles del Vehículo</h4>
            <div className="space-y-2 text-sm text-[var(--color-text-main)]">
                <div className="flex items-center"><Box size={14} className="mr-2 text-[var(--color-primary)]" /> Capacidad: <span className="font-medium text-[var(--color-text-strong)] ml-1">{driver.vehicleCapacity} kg</span></div>
                <div className="flex items-center"><Fuel size={14} className="mr-2 text-[var(--color-primary)]" /> Combustible: <span className="font-medium text-[var(--color-text-strong)] ml-1">{driver.fuelType}</span></div>
            </div>
        </div>
        <div className="space-y-4">
             <div>
                <h4 className="font-semibold text-[var(--color-text-strong)] mb-2">Historial de Estado</h4>
                <StatusHistory logs={statusLogs} />
            </div>
             <div>
                <h4 className="font-semibold text-[var(--color-text-strong)] mb-2 mt-4">Historial de Auditoría</h4>
                <AuditHistory logs={auditLogs} />
            </div>
        </div>
    </div>
);

const getVehicleType = (vehicleName: string): string => {
    const lowerCaseName = vehicleName.toLowerCase();
    if (lowerCaseName.includes('moto')) return 'Moto';
    if (lowerCaseName.includes('bicicleta')) return 'Bicicleta';
    if (lowerCaseName.includes('auto') || lowerCaseName.includes('car')) return 'Auto';
    return 'Vehículo';
};

const DriverCardMobile: React.FC<{ 
    driver: Driver;
    auditLogs: AuditLog[];
    statusLogs: DriverStatusLog[];
    isExpanded: boolean;
    onToggleExpand: () => void;
    onApprove?: () => void;
    onReject?: () => void;
    onDelete: () => void;
    tab: Tab;
}> = ({ driver, auditLogs, statusLogs, isExpanded, onToggleExpand, onApprove, onReject, onDelete, tab }) => {
    const isHistoryEnabled = tab !== 'pending';
    return (
        <div className="bg-[var(--color-surface)] rounded-xl shadow-[4px_4px_8px_var(--color-shadow-dark),_-4px_-4px_8px_var(--color-shadow-light)]">
            <div className="p-4" onClick={isHistoryEnabled ? onToggleExpand : undefined}>
                <div className="flex justify-between items-start">
                    <div>
                        <p className="font-bold text-[var(--color-text-strong)]">{driver.name}</p>
                        <p className="text-sm font-medium text-[var(--color-text-main)] mt-1">{getVehicleType(driver.vehicle)} - {driver.vehicleCapacity} kg</p>
                        <p className="text-xs text-[var(--color-text-muted)]">{driver.vehicle} ({driver.licensePlate})</p>
                    </div>
                    <div className="flex items-center gap-2">
                        {tab !== 'rejected' && getDriverStatusBadge(driver.status)}
                        {isHistoryEnabled && <ChevronDown size={20} className={`text-[var(--color-text-muted)] transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />}
                    </div>
                </div>
                <div className="mt-4 flex items-center justify-end gap-2" onClick={e => e.stopPropagation()}>
                    {tab === 'pending' && onApprove && onReject && (
                        <>
                            <button onClick={onApprove} className="p-2 text-green-600 rounded-full bg-[var(--color-bg)] shadow-[3px_3px_5px_var(--color-shadow-dark),_-3px_-3px_5px_var(--color-shadow-light)]" title="Aprobar"><UserCheck size={18} /></button>
                            <button onClick={onReject} className="p-2 text-yellow-600 rounded-full bg-[var(--color-bg)] shadow-[3px_3px_5px_var(--color-shadow-dark),_-3px_-3px_5px_var(--color-shadow-light)]" title="Rechazar"><UserX size={18} /></button>
                        </>
                    )}
                    <button onClick={onDelete} className="p-2 text-red-600 rounded-full bg-[var(--color-bg)] shadow-[3px_3px_5px_var(--color-shadow-dark),_-3px_-3px_5px_var(--color-shadow-light)]" title="Eliminar Conductor"><Trash2 size={18} /></button>
                </div>
            </div>
            {isHistoryEnabled && isExpanded && (
                <div className="px-4 pb-4 border-t border-[var(--color-border)] pt-3">
                    <DriverDetailView driver={driver} auditLogs={auditLogs} statusLogs={statusLogs} />
                </div>
            )}
        </div>
    );
};


export const DriverManagement: React.FC<DriverManagementProps> = ({ drivers, auditLogs, driverStatusLogs, onApprove, onReject, onDelete }) => {
    const [driverToDelete, setDriverToDelete] = useState<Driver | null>(null);
    const [activeTab, setActiveTab] = useState<Tab>('pending');
    const [expandedDriverId, setExpandedDriverId] = useState<string | null>(null);

    const { pendingDrivers, approvedDrivers, rejectedDrivers } = useMemo(() => ({
        pendingDrivers: drivers.filter(d => d.accountStatus === AccountStatus.Pending),
        approvedDrivers: drivers.filter(d => d.accountStatus === AccountStatus.Approved),
        rejectedDrivers: drivers.filter(d => d.accountStatus === AccountStatus.Rejected),
    }), [drivers]);
    
    const handleConfirmDelete = () => {
        if (driverToDelete) {
            onDelete(driverToDelete.id);
            setDriverToDelete(null);
        }
    };
    
    const toggleExpand = (driverId: string) => {
        setExpandedDriverId(prevId => (prevId === driverId ? null : driverId));
    };

    const TabButton: React.FC<{ tab: Tab, label: string, count: number, icon: React.ElementType }> = ({ tab, label, count, icon: Icon }) => (
        <button
            onClick={() => setActiveTab(tab)}
            className={`flex items-center px-4 py-2 text-sm font-semibold rounded-t-lg transition-all border-b-2 ${
                activeTab === tab 
                ? 'text-[var(--color-primary)] border-[var(--color-primary)]' 
                : 'text-[var(--color-text-muted)] border-transparent hover:text-[var(--color-text-strong)]'
            }`}
        >
            <Icon size={18} className="mr-2" />
            {label} ({count})
        </button>
    );

    const renderTable = (driverList: Driver[], isHistoryEnabled: boolean) => (
        <div className="overflow-x-auto hidden md:block">
            <table className="min-w-full">
                <thead className="bg-[var(--color-bg)]">
                    <tr>
                        {isHistoryEnabled && <th scope="col" className="w-12 px-6 py-3"></th>}
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Nombre</th>
                        <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Vehículo / Capacidad</th>
                        {activeTab !== 'rejected' && <th scope="col" className="px-6 py-3 text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Estado Actual</th>}
                        <th scope="col" className="px-6 py-3 text-right text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Acciones</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-[var(--color-border)]">
                    {driverList.map(driver => (
                        <React.Fragment key={driver.id}>
                            <tr className={`transition-colors ${isHistoryEnabled ? 'hover:bg-[var(--color-bg)] cursor-pointer' : ''}`} onClick={isHistoryEnabled ? () => toggleExpand(driver.id) : undefined}>
                                {isHistoryEnabled && (
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <ChevronDown size={20} className={`text-[var(--color-text-muted)] transition-transform duration-300 ${expandedDriverId === driver.id ? 'rotate-180' : ''}`} />
                                    </td>
                                )}
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-[var(--color-text-strong)]">{driver.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                                    <div className="font-medium text-[var(--color-text-strong)]">{getVehicleType(driver.vehicle)} - {driver.vehicleCapacity} kg</div>
                                    <div className="text-[var(--color-text-muted)] text-xs">{driver.vehicle} ({driver.licensePlate})</div>
                                </td>
                                {activeTab !== 'rejected' && <td className="px-6 py-4 whitespace-nowrap text-sm">{getDriverStatusBadge(driver.status)}</td>}
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2" onClick={e => e.stopPropagation()}>
                                    {activeTab === 'pending' && (
                                        <>
                                            <button onClick={() => onApprove(driver.id)} className="p-2 text-green-600 rounded-full bg-[var(--color-surface)] shadow-[3px_3px_5px_var(--color-shadow-dark),_-3px_-3px_5px_var(--color-shadow-light)] active:shadow-[inset_1px_1px_2px_var(--color-shadow-dark),_-inset_-1px_-1px_2px_var(--color-shadow-light)] transition-all" title="Aprobar"><UserCheck size={18} /></button>
                                            <button onClick={() => onReject(driver.id)} className="p-2 text-yellow-600 rounded-full bg-[var(--color-surface)] shadow-[3px_3px_5px_var(--color-shadow-dark),_-3px_-3px_5px_var(--color-shadow-light)] active:shadow-[inset_1px_1px_2px_var(--color-shadow-dark),_-inset_-1px_-1px_2px_var(--color-shadow-light)] transition-all" title="Rechazar"><UserX size={18} /></button>
                                        </>
                                    )}
                                    <button onClick={() => setDriverToDelete(driver)} className="p-2 text-red-600 rounded-full bg-[var(--color-surface)] shadow-[3px_3px_5px_var(--color-shadow-dark),_-3px_-3px_5px_var(--color-shadow-light)] active:shadow-[inset_1px_1px_2px_var(--color-shadow-dark),_-inset_-1px_-1px_2px_var(--color-shadow-light)] transition-all" title="Eliminar Conductor"><Trash2 size={18} /></button>
                                </td>
                            </tr>
                            {isHistoryEnabled && expandedDriverId === driver.id && (
                                <tr className="bg-[var(--color-bg)]">
                                    <td colSpan={activeTab === 'rejected' ? 4 : 5} className="p-4">
                                        <DriverDetailView 
                                            driver={driver} 
                                            auditLogs={auditLogs.filter(log => log.driverId === driver.id)}
                                            statusLogs={driverStatusLogs.filter(log => log.driverId === driver.id)}
                                        />
                                    </td>
                                </tr>
                            )}
                        </React.Fragment>
                    ))}
                </tbody>
            </table>
        </div>
    );

    const renderMobileList = (driverList: Driver[]) => (
        <div className="space-y-4 md:hidden">
            {driverList.map(driver => (
                <DriverCardMobile
                    key={driver.id}
                    driver={driver}
                    auditLogs={auditLogs.filter(log => log.driverId === driver.id)}
                    statusLogs={driverStatusLogs.filter(log => log.driverId === driver.id)}
                    isExpanded={expandedDriverId === driver.id}
                    onToggleExpand={() => toggleExpand(driver.id)}
                    onApprove={activeTab === 'pending' ? () => onApprove(driver.id) : undefined}
                    onReject={activeTab === 'pending' ? () => onReject(driver.id) : undefined}
                    onDelete={() => setDriverToDelete(driver)}
                    tab={activeTab}
                />
            ))}
        </div>
    );

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle>Gestión de Conductores</CardTitle>
                    <div className="border-b border-[var(--color-border)] mt-4">
                        <nav className="-mb-px flex space-x-4 overflow-x-auto no-scrollbar" aria-label="Tabs">
                            <TabButton tab="pending" label="Pendientes" count={pendingDrivers.length} icon={Clock} />
                            <TabButton tab="active" label="Activos" count={approvedDrivers.length} icon={UserPlus} />
                            <TabButton tab="rejected" label="Rechazados" count={rejectedDrivers.length} icon={UserX} />
                        </nav>
                    </div>
                </CardHeader>
                <CardContent>
                    {activeTab === 'pending' && (
                        pendingDrivers.length > 0 ? (
                            <>
                                {renderTable(pendingDrivers, false)}
                                {renderMobileList(pendingDrivers)}
                            </>
                        ) : <p className="text-center text-[var(--color-text-main)] py-8">No hay solicitudes pendientes.</p>
                    )}
                     {activeTab === 'active' && (
                        approvedDrivers.length > 0 ? (
                             <>
                                {renderTable(approvedDrivers, true)}
                                {renderMobileList(approvedDrivers)}
                            </>
                        ) : <p className="text-center text-[var(--color-text-main)] py-8">No hay conductores activos.</p>
                    )}
                     {activeTab === 'rejected' && (
                        rejectedDrivers.length > 0 ? (
                             <>
                                {renderTable(rejectedDrivers, true)}
                                {renderMobileList(rejectedDrivers)}
                            </>
                        ) : <p className="text-center text-[var(--color-text-main)] py-8">No hay conductores rechazados.</p>
                    )}
                </CardContent>
            </Card>

            {driverToDelete && (
                <ConfirmationModal
                    isOpen={!!driverToDelete}
                    onClose={() => setDriverToDelete(null)}
                    onConfirm={handleConfirmDelete}
                    title="Confirmar Eliminación"
                    message={
                        <>
                           <p>¿Estás seguro de que quieres eliminar permanentemente al conductor <strong className="text-[var(--color-text-strong)]">{driverToDelete.name}</strong>?</p>
                           <p className="mt-2 text-sm">Esta acción no se puede deshacer y su historial de cambios también se eliminará.</p>
                        </>
                    }
                />
            )}
        </>
    );
};
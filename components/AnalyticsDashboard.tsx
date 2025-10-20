
import React, { useMemo } from 'react';
// FIX: Added .ts extension to the import path.
import type { Order, Driver } from '../types.ts';
// FIX: Added .ts extension to the import path.
import { OrderStatus } from '../types.ts';
// FIX: Added .tsx extension to the import path.
import { Card, CardContent, CardHeader, CardTitle } from './ui/Card.tsx';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { TrendingUp, Map, Star, Award } from 'lucide-react';


const PIE_COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'];

// A simple function to extract a "zone" from an address for analytics
const getZoneFromAddress = (address: string): string => {
    const lowerCaseAddress = address.toLowerCase();
    if (lowerCaseAddress.includes('palermo')) return 'Palermo';
    if (lowerCaseAddress.includes('belgrano')) return 'Belgrano';
    if (lowerCaseAddress.includes('caballito')) return 'Caballito';
    if (lowerCaseAddress.includes('recoleta')) return 'Recoleta';
    if (lowerCaseAddress.includes('san nicolas') || lowerCaseAddress.includes('microcentro')) return 'Microcentro';
    if (lowerCaseAddress.includes('caba')) return 'CABA (General)';
    return 'Otra';
};


export const AnalyticsDashboard: React.FC<{ orders: Order[], drivers: Driver[] }> = ({ orders, drivers }) => {

  const tooltipStyle = {
    backgroundColor: 'var(--color-surface)',
    border: 'none',
    borderRadius: '12px',
    boxShadow: '3px 3px 6px var(--color-shadow-dark), -3px -3px 6px var(--color-shadow-light)',
    color: 'var(--color-text-strong)',
  };

  const chartTextStyle = { fill: 'var(--color-text-main)', fontSize: '12px' };

  const pieChartData = useMemo(() => {
    const statusCounts = orders.reduce((acc, order) => {
      acc[order.status] = (acc[order.status] || 0) + 1;
      return acc;
    }, {} as Record<OrderStatus, number>);
    
    return [
      { name: 'Entregados', value: statusCounts[OrderStatus.Delivered] || 0 },
      { name: 'En Progreso', value: statusCounts[OrderStatus.InProgress] || 0 },
      { name: 'Pendientes', value: statusCounts[OrderStatus.Pending] || 0 },
      { name: 'Fallidos', value: statusCounts[OrderStatus.Failed] || 0 },
    ].filter(item => item.value > 0);
  }, [orders]);
  
  const dailyTrendData = useMemo(() => {
      const dailyCounts: Record<string, number> = {};
      orders.forEach(order => {
          const date = new Date(order.createdAt).toLocaleDateString('es-AR', { day: '2-digit', month: 'short' });
          dailyCounts[date] = (dailyCounts[date] || 0) + 1;
      });
      return Object.entries(dailyCounts)
        .map(([date, count]) => ({ date, pedidos: count }))
        .sort((a, b) => {
            const [dayA, monthA] = a.date.split(' de ');
            const [dayB, monthB] = b.date.split(' de ');
            const dateA = new Date(`${monthA} ${dayA}, ${new Date().getFullYear()}`);
            const dateB = new Date(`${monthB} ${dayB}, ${new Date().getFullYear()}`);
            return dateA.getTime() - dateB.getTime();
        });
  }, [orders]);

  const deliveryZoneData = useMemo(() => {
      const zoneCounts: Record<string, number> = {};
      orders.forEach(order => {
          const zone = getZoneFromAddress(order.deliveryAddress);
          zoneCounts[zone] = (zoneCounts[zone] || 0) + 1;
      });
      return Object.entries(zoneCounts)
        .map(([zone, count]) => ({ zona: zone, pedidos: count }))
        .sort((a,b) => b.pedidos - a.pedidos);
  }, [orders]);

  const driverPerformanceData = useMemo(() => {
      return drivers.map(driver => {
          const driverOrders = orders.filter(o => o.assignedDriverId === driver.id);
          const delivered = driverOrders.filter(o => o.status === OrderStatus.Delivered).length;
          const failed = driverOrders.filter(o => o.status === OrderStatus.Failed).length;
          const ratings = driverOrders.map(o => o.rating).filter((r): r is number => r !== undefined && r > 0);
          const avgRating = ratings.length > 0 ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1) : 'N/A';
          return { id: driver.id, name: driver.name, delivered, failed, avgRating };
      }).sort((a,b) => b.delivered - a.delivered);
  }, [orders, drivers]);


  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6">
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center"><Map className="mr-2 text-[var(--color-primary)]"/>Pedidos por Zona</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
           <ResponsiveContainer width="100%" height="100%">
              <BarChart data={deliveryZoneData} layout="vertical" margin={{ top: 5, right: 20, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke={'var(--color-text-main)'} strokeOpacity={0.1} />
                <XAxis type="number" hide />
                <YAxis type="category" dataKey="zona" width={80} tick={chartTextStyle} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} cursor={{ fill: 'rgba(var(--color-primary-rgb), 0.1)' }}/>
                <Bar dataKey="pedidos" fill="var(--color-primary)" radius={[0, 4, 4, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card className="xl:col-span-2">
        <CardHeader>
          <CardTitle className="flex items-center"><TrendingUp className="mr-2 text-[var(--color-primary)]"/>Tendencia de Pedidos Diarios</CardTitle>
        </CardHeader>
        <CardContent className="h-[300px]">
           <ResponsiveContainer width="100%" height="100%">
            <LineChart data={dailyTrendData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={'var(--color-text-main)'} strokeOpacity={0.1} />
              <XAxis dataKey="date" tick={chartTextStyle} />
              <YAxis allowDecimals={false} tick={chartTextStyle} />
              <Tooltip contentStyle={tooltipStyle} />
              <Line type="monotone" dataKey="pedidos" stroke="var(--color-primary)" strokeWidth={2} dot={{ fill: 'var(--color-primary)', r: 4 }} activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
      
      <Card className="lg:col-span-2 xl:col-span-4">
          <CardHeader>
            <CardTitle className="flex items-center"><Award className="mr-2 text-[var(--color-primary)]"/>Rendimiento de Conductores</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="border-b border-[var(--color-border)]">
                  <tr>
                    <th scope="col" className="py-3 pr-3 text-left text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Conductor</th>
                    <th scope="col" className="py-3 px-3 text-center text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Entregas</th>
                    <th scope="col" className="py-3 px-3 text-center text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Fallidos</th>
                    <th scope="col" className="py-3 pl-3 text-right text-xs font-semibold text-[var(--color-text-muted)] uppercase tracking-wider">Calificación Prom.</th>
                  </tr>
                </thead>
                <tbody>
                  {driverPerformanceData.map((driver) => (
                    <tr key={driver.id} className="border-b border-[var(--color-border)] last:border-b-0">
                      <td className="py-3 pr-3 whitespace-nowrap text-sm font-medium text-[var(--color-text-strong)]">{driver.name}</td>
                      <td className="py-3 px-3 whitespace-nowrap text-sm text-center text-[var(--color-text-main)] font-semibold text-green-500">{driver.delivered}</td>
                      <td className="py-3 px-3 whitespace-nowrap text-sm text-center text-[var(--color-text-main)] font-semibold text-red-500">{driver.failed}</td>
                      <td className="py-3 pl-3 whitespace-nowrap text-sm text-right text-[var(--color-text-main)]">
                          <div className="flex items-center justify-end">
                             <Star size={14} className="mr-1.5 text-yellow-400 fill-yellow-400" />
                             <span className="font-semibold">{driver.avgRating}</span>
                          </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

    </div>
  );
};

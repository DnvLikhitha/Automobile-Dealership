import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Loader2, DollarSign, Car, TrendingUp, Calendar, Wrench,
  CheckCircle2, Clock, XCircle, Package, Users, BarChart3
} from 'lucide-react';

const SERVICE_LABELS = {
  general_checkup: 'General Checkup',
  full_service: 'Full Service',
  oil_change: 'Oil & Filter Change',
  tire_rotation: 'Tire Rotation',
  brake_inspection: 'Brake Inspection',
  engine_tune: 'Engine Tune-Up',
  ac_service: 'A/C Service',
  body_repair: 'Body Repair',
  other: 'Other / Diagnostics'
};

export default function SystemReports() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [salesData, setSalesData] = useState(null);
  const [inventoryData, setInventoryData] = useState(null);
  const [appointmentsData, setAppointmentsData] = useState(null);

  useEffect(() => {
    const fetchReports = async () => {
      try {
        const [salesRes, invRes, apptRes] = await Promise.allSettled([
          api.get('/api/reports/sales'),
          api.get('/api/reports/inventory'),
          api.get('/api/reports/appointments')
        ]);
        setSalesData(salesRes.status === 'fulfilled' ? salesRes.value.data : {});
        setInventoryData(invRes.status === 'fulfilled' ? invRes.value.data : {});
        setAppointmentsData(apptRes.status === 'fulfilled' ? apptRes.value.data : {});
      } catch (err) {
        console.error('Failed to load reports', err);
      } finally {
        setLoading(false);
      }
    };
    fetchReports();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  const conversionRate = salesData?.total_bookings
    ? ((salesData.delivered / salesData.total_bookings) * 100).toFixed(1)
    : 0;

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <header>
        <h1 className="text-4xl font-extrabold text-white mb-1">
          System <span className="text-gradient">Reports</span>
        </h1>
        <p className="text-gray-400">Comprehensive analytics and performance metrics.</p>
      </header>

      {/* ─── Sales Report ─── */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <DollarSign size={20} className="text-primary" /> Sales Report
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="glass-card p-5 border-t-4 border-t-primary">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Total Revenue</p>
            <p className="text-2xl font-black text-white">₹{salesData?.total_revenue?.toLocaleString() || 0}</p>
          </div>
          <div className="glass-card p-5 border-t-4 border-t-blue-500">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Total Bookings</p>
            <p className="text-2xl font-black text-white">{salesData?.total_bookings || 0}</p>
          </div>
          <div className="glass-card p-5 border-t-4 border-t-green-500">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Delivered</p>
            <p className="text-2xl font-black text-green-400">{salesData?.delivered || 0}</p>
          </div>
          <div className="glass-card p-5 border-t-4 border-t-amber-500">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">In Pipeline</p>
            <p className="text-2xl font-black text-amber-400">{salesData?.pending || 0}</p>
          </div>
          <div className="glass-card p-5 border-t-4 border-t-red-500">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Cancelled</p>
            <p className="text-2xl font-black text-red-400">{salesData?.cancelled || 0}</p>
          </div>
        </div>

        {/* Conversion Rate */}
        <div className="glass-card p-5 mt-4">
          <div className="flex items-center justify-between mb-3">
            <p className="text-sm font-bold text-gray-300 flex items-center gap-2">
              <TrendingUp size={16} className="text-green-400" /> Conversion Rate (Booking → Delivery)
            </p>
            <span className="text-lg font-black text-green-400">{conversionRate}%</span>
          </div>
          <div className="w-full h-3 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-1000"
              style={{ width: `${Math.min(conversionRate, 100)}%` }}
            />
          </div>
        </div>
      </section>

      {/* ─── Inventory Report ─── */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Car size={20} className="text-primary" /> Inventory Report
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Availability */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Availability Status</h3>
            <div className="space-y-3">
              {[
                { label: 'Available', count: inventoryData?.available || 0, color: 'bg-green-500', textColor: 'text-green-400' },
                { label: 'Reserved', count: inventoryData?.reserved || 0, color: 'bg-yellow-500', textColor: 'text-yellow-400' },
                { label: 'Sold', count: inventoryData?.sold || 0, color: 'bg-red-500', textColor: 'text-red-400' },
              ].map(item => {
                const total = inventoryData?.total_vehicles || 1;
                const pct = ((item.count / total) * 100).toFixed(0);
                return (
                  <div key={item.label}>
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-gray-300">{item.label}</span>
                      <span className={`font-bold ${item.textColor}`}>{item.count} ({pct}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${item.color} rounded-full transition-all duration-700`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-4 p-3 bg-primary/10 border border-primary/20 rounded-xl text-center">
              <p className="text-xs text-gray-400 uppercase">Total Vehicles</p>
              <p className="text-2xl font-black text-primary">{inventoryData?.total_vehicles || 0}</p>
            </div>
          </div>

          {/* By Type */}
          <div className="glass-card p-6">
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Vehicle Type Distribution</h3>
            {inventoryData?.by_type ? (
              <div className="space-y-3">
                {Object.entries(inventoryData.by_type).sort((a, b) => b[1] - a[1]).map(([type, count]) => {
                  const total = inventoryData.total_vehicles || 1;
                  const pct = ((count / total) * 100).toFixed(0);
                  return (
                    <div key={type}>
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-300 capitalize">{type}</span>
                        <span className="font-bold text-white">{count} ({pct}%)</span>
                      </div>
                      <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary to-primary-dark rounded-full transition-all duration-700"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-gray-500 italic text-sm">No vehicle data available.</p>
            )}
          </div>
        </div>
      </section>

      {/* ─── Appointments Report ─── */}
      <section>
        <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Wrench size={20} className="text-purple-400" /> Appointments Report
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-5">
          <div className="glass-card p-5 border-t-4 border-t-purple-500">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Total</p>
            <p className="text-2xl font-black text-white">{appointmentsData?.total_appointments || 0}</p>
          </div>
          <div className="glass-card p-5 border-t-4 border-t-amber-500">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Pending</p>
            <p className="text-2xl font-black text-amber-400">{appointmentsData?.pending || 0}</p>
          </div>
          <div className="glass-card p-5 border-t-4 border-t-blue-500">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">In Progress</p>
            <p className="text-2xl font-black text-blue-400">{appointmentsData?.in_progress || 0}</p>
          </div>
          <div className="glass-card p-5 border-t-4 border-t-green-500">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Completed</p>
            <p className="text-2xl font-black text-green-400">{appointmentsData?.completed || 0}</p>
          </div>
          <div className="glass-card p-5 border-t-4 border-t-red-500">
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-wider mb-2">Cancelled</p>
            <p className="text-2xl font-black text-red-400">{appointmentsData?.cancelled || 0}</p>
          </div>
        </div>

        {/* Service Type Breakdown */}
        <div className="glass-card p-6">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">By Service Type</h3>
          {appointmentsData?.by_service_type ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(appointmentsData.by_service_type).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center p-3 bg-white/5 rounded-xl border border-white/5">
                  <span className="text-sm text-gray-300">{SERVICE_LABELS[type] || type}</span>
                  <span className="text-sm font-bold text-white bg-purple-500/20 text-purple-300 px-3 py-1 rounded-md">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic text-sm">No appointment data available.</p>
          )}
        </div>
      </section>
    </div>
  );
}

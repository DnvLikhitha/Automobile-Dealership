import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  DollarSign, Car, TrendingUp, Package, Loader2,
  ArrowRight, Clock, CheckCircle2, XCircle, Eye,
  ChevronRight, AlertTriangle, Truck
} from 'lucide-react';
import { MiniCalendar } from '../components/ui/Calendar';

const STATUS_CONFIG = {
  inquiry: {
    label: 'Inquiry',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    icon: <Eye size={14} />,
    step: 1
  },
  test_drive_scheduled: {
    label: 'Test Drive',
    color: 'bg-amber-500/20 text-amber-400 border-amber-500/40',
    icon: <Car size={14} />,
    step: 2
  },
  booking_confirmed: {
    label: 'Confirmed',
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
    icon: <CheckCircle2 size={14} />,
    step: 3
  },
  delivered: {
    label: 'Delivered',
    color: 'bg-green-500/20 text-green-400 border-green-500/40',
    icon: <Truck size={14} />,
    step: 4
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-500/20 text-red-400 border-red-500/40',
    icon: <XCircle size={14} />,
    step: 0
  }
};

const PIPELINE_STAGES = ['inquiry', 'test_drive_scheduled', 'booking_confirmed', 'delivered'];

export default function SalesDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState({});
  const [stats, setStats] = useState(null);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [bookingsRes, vehiclesRes, salesRes, invRes] = await Promise.all([
        api.get('/api/bookings'),
        api.get('/api/vehicles'),
        api.get('/api/reports/sales'),
        api.get('/api/reports/inventory')
      ]);

      const vMap = {};
      vehiclesRes.data.forEach(v => { vMap[v.vehicle_id] = v; });

      setBookings(bookingsRes.data);
      setVehicles(vMap);
      setStats({ sales: salesRes.data, inventory: invRes.data });
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (bookingId, newStatus) => {
    setUpdating(true);
    try {
      await api.patch(`/api/bookings/${bookingId}`, { status: newStatus });
      await fetchData();
      setSelectedBooking(null);
    } catch (err) {
      console.error('Failed to update booking', err);
      alert(err.response?.data?.detail || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const getNextStatus = (current) => {
    const idx = PIPELINE_STAGES.indexOf(current);
    if (idx >= 0 && idx < PIPELINE_STAGES.length - 1) return PIPELINE_STAGES[idx + 1];
    return null;
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  const activeBookings = bookings.filter(b => b.status !== 'cancelled' && b.status !== 'delivered');
  const completedBookings = bookings.filter(b => b.status === 'delivered');
  const cancelledBookings = bookings.filter(b => b.status === 'cancelled');

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      {/* Header */}
      <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <p className="text-[#00adef] text-xs font-bold uppercase tracking-[0.3em] mb-2">Sales Portal</p>
          <h1 className="text-4xl font-black text-white uppercase mb-1">Sales Dashboard.</h1>
          <p className="text-gray-500">Welcome back, {user?.name}. Here's your pipeline.</p>
        </div>
        <button
          onClick={() => navigate('/inventory')}
          className="flex items-center gap-2 px-5 py-3 bg-primary/20 text-primary border border-primary/30 font-bold rounded-xl hover:bg-primary/30 transition-colors"
        >
          <Car size={18} /> View Inventory
        </button>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-5 border-t-4 border-t-primary">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-primary/20 rounded-lg text-primary"><DollarSign size={20} /></div>
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Revenue</span>
          </div>
          <p className="text-3xl font-black text-white">₹{stats?.sales?.total_revenue?.toLocaleString() || 0}</p>
          <p className="text-xs text-gray-500 mt-1">From {stats?.sales?.delivered || 0} deliveries</p>
        </div>

        <div className="glass-card p-5 border-t-4 border-t-amber-500">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-amber-500/20 rounded-lg text-amber-400"><Clock size={20} /></div>
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Active Pipeline</span>
          </div>
          <p className="text-3xl font-black text-white">{stats?.sales?.pending || 0}</p>
          <p className="text-xs text-gray-500 mt-1">In progress bookings</p>
        </div>

        <div className="glass-card p-5 border-t-4 border-t-green-500">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-green-500/20 rounded-lg text-green-400"><TrendingUp size={20} /></div>
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Completed</span>
          </div>
          <p className="text-3xl font-black text-white">{stats?.sales?.delivered || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Successful deliveries</p>
        </div>

        <div className="glass-card p-5 border-t-4 border-t-purple-500">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-purple-500/20 rounded-lg text-purple-400"><Package size={20} /></div>
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Stock</span>
          </div>
          <p className="text-3xl font-black text-white">{stats?.inventory?.available || 0}</p>
          <p className="text-xs text-gray-500 mt-1">Vehicles available</p>
        </div>
      </div>

      {/* Sales Pipeline Visual + Calendar */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="glass-card p-6 xl:col-span-4">
          <h3 className="text-lg font-bold text-white mb-5">Sales Pipeline</h3>
          <div className="grid grid-cols-4 gap-3">
            {PIPELINE_STAGES.map((stage, i) => {
              const config = STATUS_CONFIG[stage];
              const count = bookings.filter(b => b.status === stage).length;
              return (
                <div key={stage} className="relative">
                  <div className={`p-4 rounded-xl border ${config.color} text-center`}>
                    <div className="flex items-center justify-center gap-1.5 mb-2">
                      {config.icon}
                      <span className="text-xs font-bold uppercase tracking-wider">{config.label}</span>
                    </div>
                    <p className="text-2xl font-black">{count}</p>
                  </div>
                  {i < PIPELINE_STAGES.length - 1 && (
                    <div className="hidden lg:block absolute top-1/2 -right-3 -translate-y-1/2 z-10 text-gray-600">
                      <ChevronRight size={16} />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Active Bookings Table */}
      <div className="glass-card overflow-hidden">
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <h3 className="text-lg font-bold text-white">Active Bookings ({activeBookings.length})</h3>
          {cancelledBookings.length > 0 && (
            <span className="text-xs text-red-400 flex items-center gap-1">
              <AlertTriangle size={12} /> {cancelledBookings.length} cancelled
            </span>
          )}
        </div>

        {activeBookings.length === 0 ? (
          <div className="p-12 text-center text-gray-500 italic">
            No active bookings in the pipeline.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10 text-left">
                  <th className="px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Vehicle</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Price</th>
                  <th className="px-6 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Action</th>
                </tr>
              </thead>
              <tbody>
                {activeBookings.map(b => {
                  const v = vehicles[b.vehicle_id];
                  const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.inquiry;
                  const nextStatus = getNextStatus(b.status);

                  return (
                    <tr key={b.booking_id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          {v?.image_url ? (
                            <img src={v.image_url} alt="" className="w-12 h-9 rounded-lg object-cover" />
                          ) : (
                            <div className="w-12 h-9 rounded-lg bg-white/5 flex items-center justify-center text-lg">🚗</div>
                          )}
                          <div>
                            <p className="text-sm font-bold text-white">{v ? `${v.make} ${v.model}` : 'Unknown'}</p>
                            <p className="text-xs text-gray-500">{v?.year || ''} · {v?.type || ''}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-300">
                        {b.booking_date ? new Date(b.booking_date).toLocaleDateString() : new Date(b.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${cfg.color}`}>
                          {cfg.icon} {cfg.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm font-bold text-primary">
                        ₹{v ? Number(v.price).toLocaleString() : '—'}
                      </td>
                      <td className="px-6 py-4">
                        {nextStatus ? (
                          <button
                            onClick={() => handleStatusUpdate(b.booking_id, nextStatus)}
                            disabled={updating}
                            className="flex items-center gap-1.5 px-3 py-1.5 bg-primary/20 text-primary border border-primary/30 rounded-lg text-xs font-bold hover:bg-primary/30 transition-colors disabled:opacity-50"
                          >
                            <ArrowRight size={12} /> {STATUS_CONFIG[nextStatus]?.label}
                          </button>
                        ) : (
                          <span className="text-xs text-gray-600">—</span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Completed Deliveries */}
      {completedBookings.length > 0 && (
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <CheckCircle2 size={18} className="text-green-400" /> Completed Deliveries ({completedBookings.length})
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedBookings.map(b => {
              const v = vehicles[b.vehicle_id];
              return (
                <div key={b.booking_id} className="flex items-center gap-3 p-3 bg-green-500/5 border border-green-500/10 rounded-xl">
                  {v?.image_url ? (
                    <img src={v.image_url} alt="" className="w-14 h-10 rounded-lg object-cover" />
                  ) : (
                    <div className="w-14 h-10 rounded-lg bg-white/5 flex items-center justify-center">🚗</div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-white truncate">{v ? `${v.make} ${v.model}` : 'Vehicle'}</p>
                    <p className="text-xs text-green-400">₹{v ? Number(v.price).toLocaleString() : '—'}</p>
                  </div>
                  <CheckCircle2 size={16} className="text-green-500 shrink-0" />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

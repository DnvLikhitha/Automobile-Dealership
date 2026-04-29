import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  DollarSign, Car, Calendar, Users, Loader2,
  TrendingUp, Wrench, Clock, CheckCircle2, XCircle,
  Eye, Truck, ShieldCheck, UserCheck, AlertCircle
} from 'lucide-react';
import { MiniCalendar } from '../components/ui/Calendar';

const BOOKING_STATUS = {
  inquiry: { label: 'Inquiry', color: 'bg-blue-500/20 text-blue-400 border-blue-500/40', icon: <Eye size={14} /> },
  test_drive_scheduled: { label: 'Test Drive', color: 'bg-amber-500/20 text-amber-400 border-amber-500/40', icon: <Car size={14} /> },
  booking_confirmed: { label: 'Confirmed', color: 'bg-purple-500/20 text-purple-400 border-purple-500/40', icon: <CheckCircle2 size={14} /> },
  delivered: { label: 'Delivered', color: 'bg-green-500/20 text-green-400 border-green-500/40', icon: <Truck size={14} /> },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/20 text-red-400 border-red-500/40', icon: <XCircle size={14} /> },
};

const APPT_STATUS = {
  pending: { label: 'Pending Approval', color: 'bg-amber-500/20 text-amber-400 border-amber-500/40', icon: <Clock size={14} /> },
  approved: { label: 'Approved', color: 'bg-blue-500/20 text-blue-400 border-blue-500/40', icon: <ShieldCheck size={14} /> },
  in_progress: { label: 'In Progress', color: 'bg-purple-500/20 text-purple-400 border-purple-500/40', icon: <Wrench size={14} /> },
  completed: { label: 'Completed', color: 'bg-green-500/20 text-green-400 border-green-500/40', icon: <CheckCircle2 size={14} /> },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/20 text-red-400 border-red-500/40', icon: <XCircle size={14} /> },
};

const SERVICE_LABELS = {
  general_checkup: 'General Checkup', full_service: 'Full Service',
  oil_change: 'Oil & Filter Change', tire_rotation: 'Tire Rotation',
  brake_inspection: 'Brake Inspection', engine_tune: 'Engine Tune-Up',
  ac_service: 'A/C Service', body_repair: 'Body Repair', other: 'Other / Diagnostics'
};

export default function AdminDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ sales: {}, inventory: {} });
  const [bookings, setBookings] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [vehicles, setVehicles] = useState({});
  const [technicians, setTechnicians] = useState([]);
  const [loading, setLoading] = useState(true);
  const [approving, setApproving] = useState(null); // appointment_id being approved
  const [selectedTech, setSelectedTech] = useState({}); // { [appointment_id]: tech_id }
  const [actionLoading, setActionLoading] = useState(null);

  const fetchData = async () => {
    try {
      const [salesRes, invRes, bookingsRes, apptsRes, vehRes, techRes] = await Promise.allSettled([
        api.get('/api/reports/sales'),
        api.get('/api/reports/inventory'),
        api.get('/api/bookings'),
        api.get('/api/appointments'),
        api.get('/api/vehicles'),
        api.get('/api/auth/technicians')
      ]);

      const vMap = {};
      if (vehRes.status === 'fulfilled') {
        vehRes.value.data.forEach(v => { vMap[v.vehicle_id] = v; });
      }

      setStats({
        sales: salesRes.status === 'fulfilled' ? salesRes.value.data : {},
        inventory: invRes.status === 'fulfilled' ? invRes.value.data : {}
      });
      setBookings(bookingsRes.status === 'fulfilled' ? bookingsRes.value.data : []);
      setAppointments(apptsRes.status === 'fulfilled' ? apptsRes.value.data : []);
      setVehicles(vMap);
      setTechnicians(techRes.status === 'fulfilled' ? techRes.value.data : []);
    } catch (err) {
      console.error("Failed to load admin stats", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleApprove = async (appointmentId) => {
    const techId = selectedTech[appointmentId];
    if (!techId) {
      alert('Please select a technician before approving.');
      return;
    }
    setActionLoading(appointmentId);
    try {
      await api.patch(`/api/appointments/${appointmentId}`, {
        status: 'approved',
        technician_id: techId
      });
      await fetchData();
      setApproving(null);
    } catch (err) {
      console.error('Failed to approve appointment', err);
      alert(err.response?.data?.detail || 'Failed to approve appointment');
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancel = async (appointmentId) => {
    setActionLoading(appointmentId);
    try {
      await api.patch(`/api/appointments/${appointmentId}`, { status: 'cancelled' });
      await fetchData();
    } catch (err) {
      console.error('Failed to cancel appointment', err);
      alert(err.response?.data?.detail || 'Failed to cancel');
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-primary" size={48} /></div>;

  const pendingAppts = appointments.filter(a => a.status === 'pending');
  const approvedAppts = appointments.filter(a => a.status === 'approved');
  const inProgressAppts = appointments.filter(a => a.status === 'in_progress');
  const completedAppts = appointments.filter(a => a.status === 'completed');

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <header className="mb-8">
        <p className="text-[#00adef] text-xs font-bold uppercase tracking-[0.3em] mb-2">Control Center</p>
        <h1 className="text-4xl font-black text-white uppercase mb-2">Admin Dashboard.</h1>
        <p className="text-gray-500">Welcome back, {user?.name}. Here is your operational overview.</p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 flex items-start gap-4 border-t-4 border-t-primary">
          <div className="p-3 bg-primary/20 rounded-lg text-primary"><DollarSign size={24} /></div>
          <div>
            <p className="text-sm text-gray-400 font-medium">Total Revenue</p>
            <h3 className="text-3xl font-black text-white">₹{stats?.sales?.total_revenue?.toLocaleString() || 0}</h3>
          </div>
        </div>
        <div className="glass-card p-6 flex items-start gap-4 border-t-4 border-t-green-500">
          <div className="p-3 bg-green-500/20 rounded-lg text-green-400"><Car size={24} /></div>
          <div>
            <p className="text-sm text-gray-400 font-medium">Total Vehicles</p>
            <h3 className="text-3xl font-black text-white">{stats?.inventory?.total_vehicles || 0}</h3>
          </div>
        </div>
        <div className="glass-card p-6 flex items-start gap-4 border-t-4 border-t-purple-500">
          <div className="p-3 bg-purple-500/20 rounded-lg text-purple-400"><Calendar size={24} /></div>
          <div>
            <p className="text-sm text-gray-400 font-medium">Active Bookings</p>
            <h3 className="text-3xl font-black text-white">{stats?.sales?.pending || 0}</h3>
          </div>
        </div>
        <div className="glass-card p-6 flex items-start gap-4 border-t-4 border-t-yellow-500">
          <div className="p-3 bg-yellow-500/20 rounded-lg text-yellow-400"><Users size={24} /></div>
          <div>
            <p className="text-sm text-gray-400 font-medium">Sales Completed</p>
            <h3 className="text-3xl font-black text-white">{stats?.sales?.delivered || 0}</h3>
          </div>
        </div>
      </div>

      {/* Row 2: Recent Bookings + Inventory Breakdown + Calendar */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <div className="glass-card p-6 lg:col-span-3">
          <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
            <TrendingUp size={20} className="text-primary" /> Recent Sales Activity
          </h3>
          {bookings.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500 border border-dashed border-white/10 rounded-xl bg-white/5">
              <p className="italic">No bookings yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {bookings.slice(0, 6).map(b => {
                const v = vehicles[b.vehicle_id];
                const cfg = BOOKING_STATUS[b.status] || BOOKING_STATUS.inquiry;
                return (
                  <div key={b.booking_id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/[0.08] transition-colors">
                    <div className="flex items-center gap-3 min-w-0">
                      {v?.image_url ? (
                        <img src={v.image_url} alt="" className="w-12 h-9 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-12 h-9 rounded-lg bg-white/10 flex items-center justify-center shrink-0 text-lg">🚗</div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">{v ? `${v.make} ${v.model}` : 'Vehicle'}</p>
                        <p className="text-xs text-gray-500">
                          {b.booking_date ? new Date(b.booking_date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : '—'}
                          {b.deposit_amount ? ` · ₹${Number(b.deposit_amount).toLocaleString()}` : ''}
                        </p>
                      </div>
                    </div>
                    <span className={`shrink-0 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${cfg.color}`}>
                      {cfg.icon} {cfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="glass-card p-6">
          <h3 className="text-xl font-bold text-white mb-6">Stock Status</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5">
              <span className="text-gray-300">Available</span>
              <span className="text-white font-bold px-3 py-1 bg-green-500/20 text-green-400 rounded-md">{stats?.inventory?.available || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5">
              <span className="text-gray-300">Reserved</span>
              <span className="text-white font-bold px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-md">{stats?.inventory?.reserved || 0}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5">
              <span className="text-gray-300">Sold</span>
              <span className="text-white font-bold px-3 py-1 bg-blue-500/20 text-blue-400 rounded-md">{stats?.inventory?.sold || 0}</span>
            </div>
          </div>
        </div>


      </div>

      {/* ═══ Row 3: APPROVAL PANEL ═══ */}
      <div className="glass-card overflow-hidden border border-amber-500/20">
        <div className="p-6 border-b border-white/10 bg-amber-500/5">
          <h3 className="text-xl font-bold text-white flex items-center gap-2">
            <ShieldCheck size={20} className="text-amber-400" />
            Pending Service Approvals
            {pendingAppts.length > 0 && (
              <span className="ml-2 px-2.5 py-0.5 bg-amber-500/20 text-amber-400 text-xs font-bold rounded-full animate-pulse">
                {pendingAppts.length} awaiting
              </span>
            )}
          </h3>
          <p className="text-sm text-gray-400 mt-1">Review service requests and assign a technician to approve.</p>
        </div>

        {pendingAppts.length === 0 ? (
          <div className="p-12 text-center text-gray-500 italic">
            <CheckCircle2 size={32} className="mx-auto mb-3 text-green-500/50" />
            All caught up! No pending service requests.
          </div>
        ) : (
          <div className="divide-y divide-white/5">
            {pendingAppts.map(a => {
              const v = vehicles[a.vehicle_id];
              const isExpanded = approving === a.appointment_id;
              return (
                <div key={a.appointment_id} className="hover:bg-white/[0.03] transition-colors">
                  <div className="flex items-center justify-between px-6 py-4">
                    <div className="flex items-center gap-4 min-w-0 flex-1">
                      {v?.image_url ? (
                        <img src={v.image_url} alt="" className="w-12 h-9 rounded-lg object-cover shrink-0" />
                      ) : (
                        <div className="w-12 h-9 rounded-lg bg-white/5 flex items-center justify-center shrink-0 text-lg">🚗</div>
                      )}
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">
                          {v ? `${v.make} ${v.model}` : 'Vehicle'} — {SERVICE_LABELS[a.service_type] || a.service_type}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(a.slot_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                          {' · '}{a.slot_time ? (() => { const [h, m] = a.slot_time.split(':'); const hr = parseInt(h); return `${hr > 12 ? hr - 12 : hr || 12}:${m} ${hr >= 12 ? 'PM' : 'AM'}`; })() : '—'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border bg-amber-500/20 text-amber-400 border-amber-500/40">
                        <Clock size={12} /> Pending
                      </span>
                      {!isExpanded && (
                        <button
                          onClick={() => setApproving(a.appointment_id)}
                          className="px-3 py-1.5 bg-blue-600 text-white text-xs font-bold rounded-lg hover:bg-blue-500 transition-colors"
                        >
                          Review
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Expanded approval panel */}
                  {isExpanded && (
                    <div className="px-6 pb-5 animate-[fadeIn_0.2s_ease-out]">
                      <div className="bg-white/5 rounded-xl p-5 border border-white/10 space-y-4">
                        {/* Details grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                          <div>
                            <p className="text-xs text-gray-500 uppercase mb-1">Vehicle</p>
                            <p className="text-white font-semibold">{v ? `${v.year} ${v.make} ${v.model}` : '—'}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase mb-1">Service</p>
                            <p className="text-white font-semibold">{SERVICE_LABELS[a.service_type] || a.service_type}</p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase mb-1">Requested Date</p>
                            <p className="text-white font-semibold">
                              {new Date(a.slot_date).toLocaleDateString()}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-gray-500 uppercase mb-1">Customer Notes</p>
                            <p className="text-white font-semibold">{a.notes || '—'}</p>
                          </div>
                        </div>

                        {/* Technician Assignment */}
                        <div className="border-t border-white/10 pt-4">
                          <label className="block text-xs text-gray-400 font-bold uppercase tracking-wider mb-2">
                            <UserCheck size={14} className="inline mr-1.5 text-blue-400" />
                            Assign Technician
                          </label>
                          {technicians.length === 0 ? (
                            <p className="text-sm text-red-400 italic">No technicians registered in the system.</p>
                          ) : (
                            <select
                              value={selectedTech[a.appointment_id] || ''}
                              onChange={(e) => setSelectedTech({ ...selectedTech, [a.appointment_id]: e.target.value })}
                              className="w-full sm:w-72 bg-black/50 border border-white/10 rounded-lg px-4 py-2.5 text-white text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                            >
                              <option value="">— Select a technician —</option>
                              {technicians.map(t => (
                                <option key={t.user_id} value={t.user_id}>
                                  {t.name} ({t.email})
                                </option>
                              ))}
                            </select>
                          )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-3 pt-2">
                          <button
                            onClick={() => handleApprove(a.appointment_id)}
                            disabled={actionLoading === a.appointment_id || !selectedTech[a.appointment_id]}
                            className="flex items-center gap-1.5 px-5 py-2.5 bg-blue-600 text-white font-bold rounded-lg text-xs hover:bg-blue-500 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-[0_0_12px_rgba(59,130,246,0.3)]"
                          >
                            {actionLoading === a.appointment_id
                              ? <Loader2 size={12} className="animate-spin" />
                              : <ShieldCheck size={14} />}
                            Approve & Assign
                          </button>
                          <button
                            onClick={() => handleCancel(a.appointment_id)}
                            disabled={actionLoading === a.appointment_id}
                            className="flex items-center gap-1.5 px-4 py-2.5 bg-red-500/20 text-red-400 border border-red-500/30 font-bold rounded-lg text-xs hover:bg-red-500/30 transition-colors disabled:opacity-50"
                          >
                            <XCircle size={14} /> Reject
                          </button>
                          <button
                            onClick={() => setApproving(null)}
                            className="px-4 py-2.5 bg-white/5 border border-white/10 text-gray-400 rounded-lg text-xs hover:bg-white/10"
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Row 4: All Service Appointments + Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="text-xl font-bold text-white mb-5 flex items-center gap-2">
            <Wrench size={20} className="text-purple-400" /> All Service Appointments
          </h3>
          {appointments.filter(a => a.status !== 'pending').length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-gray-500 border border-dashed border-white/10 rounded-xl bg-white/5">
              <p className="italic">No approved appointments yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {appointments.filter(a => a.status !== 'pending').slice(0, 8).map(a => {
                const v = vehicles[a.vehicle_id];
                const cfg = APPT_STATUS[a.status] || APPT_STATUS.pending;
                const tech = technicians.find(t => t.user_id === a.technician_id);
                return (
                  <div key={a.appointment_id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-white truncate">
                        {v ? `${v.make} ${v.model}` : 'Vehicle'} — {SERVICE_LABELS[a.service_type] || a.service_type}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(a.slot_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        {tech ? ` · Assigned: ${tech.name}` : ''}
                      </p>
                    </div>
                    <span className={`shrink-0 inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${cfg.color}`}>
                      {cfg.icon} {cfg.label}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="glass-card p-6">
          <h3 className="text-xl font-bold text-white mb-6">Service Overview</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5">
              <div className="flex items-center gap-2"><Clock size={16} className="text-amber-400" /><span className="text-gray-300">Pending</span></div>
              <span className="text-white font-bold px-3 py-1 bg-amber-500/20 text-amber-400 rounded-md">{pendingAppts.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5">
              <div className="flex items-center gap-2"><ShieldCheck size={16} className="text-blue-400" /><span className="text-gray-300">Approved</span></div>
              <span className="text-white font-bold px-3 py-1 bg-blue-500/20 text-blue-400 rounded-md">{approvedAppts.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5">
              <div className="flex items-center gap-2"><Wrench size={16} className="text-purple-400" /><span className="text-gray-300">In Progress</span></div>
              <span className="text-white font-bold px-3 py-1 bg-purple-500/20 text-purple-400 rounded-md">{inProgressAppts.length}</span>
            </div>
            <div className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5">
              <div className="flex items-center gap-2"><CheckCircle2 size={16} className="text-green-400" /><span className="text-gray-300">Completed</span></div>
              <span className="text-white font-bold px-3 py-1 bg-green-500/20 text-green-400 rounded-md">{completedAppts.length}</span>
            </div>
          </div>
          <div className="mt-6 p-4 bg-primary/10 border border-primary/20 rounded-xl text-center">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Total Appointments</p>
            <p className="text-3xl font-black text-primary">{appointments.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

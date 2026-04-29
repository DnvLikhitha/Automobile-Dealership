import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Loader2, Wrench, Clock, CheckCircle2, Play, AlertCircle,
  Calendar, Car, ChevronDown, ChevronUp, ClipboardList, Save, FileText, ShieldCheck
} from 'lucide-react';
import { MiniCalendar } from '../components/ui/Calendar';

const STATUS_CONFIG = {
  approved: {
    label: 'Approved',
    color: 'bg-blue-500/20 text-blue-400 border-blue-500/40',
    icon: <ShieldCheck size={14} />,
    bgAccent: 'border-l-blue-500'
  },
  in_progress: {
    label: 'In Progress',
    color: 'bg-purple-500/20 text-purple-400 border-purple-500/40',
    icon: <Play size={14} />,
    bgAccent: 'border-l-purple-500'
  },
  completed: {
    label: 'Completed',
    color: 'bg-green-500/20 text-green-400 border-green-500/40',
    icon: <CheckCircle2 size={14} />,
    bgAccent: 'border-l-green-500'
  },
  cancelled: {
    label: 'Cancelled',
    color: 'bg-red-500/20 text-red-400 border-red-500/40',
    icon: <AlertCircle size={14} />,
    bgAccent: 'border-l-red-500'
  }
};

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

const formatTime = (t) => {
  if (!t) return '—';
  const [h, m] = t.split(':');
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? 'PM' : 'AM';
  const display = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
  return `${display}:${m} ${ampm}`;
};

export default function TechnicianDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [appointments, setAppointments] = useState([]);
  const [vehicles, setVehicles] = useState({});
  const [filter, setFilter] = useState('all');
  const [updating, setUpdating] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [completingId, setCompletingId] = useState(null);
  const [serviceForm, setServiceForm] = useState({
    diagnosis: '', parts_used: '', labour_hours: '', cost: '',
    next_service_date: '', technician_notes: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [apptRes, vehRes] = await Promise.all([
        api.get('/api/appointments'),
        api.get('/api/vehicles')
      ]);

      const vMap = {};
      vehRes.data.forEach(v => { vMap[v.vehicle_id] = v; });

      setAppointments(apptRes.data);
      setVehicles(vMap);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (appointmentId, newStatus) => {
    setUpdating(appointmentId);
    try {
      await api.patch(`/api/appointments/${appointmentId}`, { status: newStatus });
      await fetchData();
    } catch (err) {
      console.error('Failed to update appointment', err);
      alert(err.response?.data?.detail || 'Failed to update status');
    } finally {
      setUpdating(null);
    }
  };

  const handleCompleteWithRecord = async (appointment) => {
    setUpdating(appointment.appointment_id);
    try {
      // Create service record
      await api.post('/api/service-records', {
        vehicle_id: appointment.vehicle_id,
        appointment_id: appointment.appointment_id,
        diagnosis: serviceForm.diagnosis || null,
        parts_used: serviceForm.parts_used || null,
        labour_hours: parseFloat(serviceForm.labour_hours) || 0,
        cost: parseFloat(serviceForm.cost) || 0,
        next_service_date: serviceForm.next_service_date || null,
        technician_notes: serviceForm.technician_notes || null,
      });
      // Mark appointment complete
      await api.patch(`/api/appointments/${appointment.appointment_id}`, { status: 'completed' });
      await fetchData();
      setCompletingId(null);
      setServiceForm({ diagnosis: '', parts_used: '', labour_hours: '', cost: '', next_service_date: '', technician_notes: '' });
    } catch (err) {
      console.error('Failed to complete job', err);
      alert(err.response?.data?.detail || 'Failed to complete job');
    } finally {
      setUpdating(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  // Stats — technicians now only receive approved/in_progress/completed appointments
  const totalAppts = appointments.length;
  const approvedCount = appointments.filter(a => a.status === 'approved').length;
  const inProgressCount = appointments.filter(a => a.status === 'in_progress').length;
  const completedCount = appointments.filter(a => a.status === 'completed').length;

  // Today's appointments
  const today = new Date().toISOString().split('T')[0];
  const todaysAppointments = appointments.filter(a => a.slot_date === today && a.status !== 'completed');

  // Filtered list
  const filtered = filter === 'all'
    ? appointments.filter(a => a.status !== 'cancelled')
    : appointments.filter(a => a.status === filter);

  // Service type breakdown
  const serviceBreakdown = {};
  appointments.forEach(a => {
    const type = a.service_type || 'unknown';
    serviceBreakdown[type] = (serviceBreakdown[type] || 0) + 1;
  });

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <header>
        <p className="text-[#00adef] text-xs font-bold uppercase tracking-[0.3em] mb-2">Workshop</p>
        <h1 className="text-4xl font-black text-white uppercase mb-1">Technician Dashboard.</h1>
        <p className="text-gray-500">
          Welcome, {user?.name}. You have{' '}
          <span className="text-[#00adef] font-bold">{approvedCount} approved</span> and{' '}
          <span className="text-white font-bold">{inProgressCount} active</span> service jobs.
        </p>
      </header>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-5 border-t-4 border-t-primary">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-primary/20 rounded-lg text-primary"><ClipboardList size={20} /></div>
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Total Jobs</span>
          </div>
          <p className="text-3xl font-black text-white">{totalAppts}</p>
        </div>

        <div className="glass-card p-5 border-t-4 border-t-blue-500">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-blue-500/20 rounded-lg text-blue-400"><ShieldCheck size={20} /></div>
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Ready to Start</span>
          </div>
          <p className="text-3xl font-black text-white">{approvedCount}</p>
        </div>

        <div className="glass-card p-5 border-t-4 border-t-purple-500">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-purple-500/20 rounded-lg text-purple-400"><Wrench size={20} /></div>
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">In Progress</span>
          </div>
          <p className="text-3xl font-black text-white">{inProgressCount}</p>
        </div>

        <div className="glass-card p-5 border-t-4 border-t-green-500">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2.5 bg-green-500/20 rounded-lg text-green-400"><CheckCircle2 size={20} /></div>
            <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Completed</span>
          </div>
          <p className="text-3xl font-black text-white">{completedCount}</p>
        </div>
      </div>

      {/* Today's Queue + Service Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Today's Queue */}
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Calendar size={18} className="text-primary" /> Today's Service Queue
          </h3>
          {todaysAppointments.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-10 border border-dashed border-white/10 bg-white/5 rounded-xl">
              <p className="text-gray-500 italic">No appointments scheduled for today.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todaysAppointments.map(a => {
                const v = vehicles[a.vehicle_id];
                const cfg = STATUS_CONFIG[a.status] || STATUS_CONFIG.approved;
                return (
                  <div key={a.appointment_id} className={`flex items-center justify-between p-4 bg-white/5 rounded-xl border-l-4 ${cfg.bgAccent}`}>
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="shrink-0 text-gray-400">
                        <Car size={20} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">
                          {v ? `${v.make} ${v.model}` : 'Vehicle'} — {SERVICE_LABELS[a.service_type] || a.service_type}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatTime(a.slot_time)}
                          {a.notes && ` · ${a.notes.substring(0, 40)}...`}
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

        {/* Service Type Breakdown */}
        <div className="glass-card p-6">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Wrench size={18} className="text-purple-400" /> Service Breakdown
          </h3>
          <div className="space-y-3">
            {Object.entries(serviceBreakdown).sort((a, b) => b[1] - a[1]).map(([type, count]) => (
              <div key={type} className="flex justify-between items-center p-3 bg-white/5 rounded-lg border border-white/5">
                <span className="text-sm text-gray-300">{SERVICE_LABELS[type] || type}</span>
                <span className="text-sm font-bold text-white px-2.5 py-0.5 bg-purple-500/20 text-purple-300 rounded-md">
                  {count}
                </span>
              </div>
            ))}
            {Object.keys(serviceBreakdown).length === 0 && (
              <p className="text-gray-500 text-sm italic text-center py-4">No service data yet.</p>
            )}
          </div>
        </div>
      </div>

      {/* All Appointments */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        <div className="glass-card overflow-hidden xl:col-span-4">
          <div className="p-6 border-b border-white/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="text-lg font-bold text-white">All Service Jobs</h3>
            <div className="flex gap-2 flex-wrap">
              {['all', 'approved', 'in_progress', 'completed'].map(f => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider transition-all ${filter === f
                    ? 'bg-primary text-black'
                    : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10'
                    }`}
                >
                  {f === 'all' ? 'All Active' : f.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="p-12 text-center text-gray-500 italic">
              No appointments match this filter.
            </div>
          ) : (
            <div className="divide-y divide-white/5">
              {filtered.map(a => {
                const v = vehicles[a.vehicle_id];
                const cfg = STATUS_CONFIG[a.status] || STATUS_CONFIG.approved;
                const isExpanded = expandedId === a.appointment_id;

                return (
                  <div key={a.appointment_id} className="hover:bg-white/[0.03] transition-colors">
                    {/* Row */}
                    <div
                      className="flex items-center justify-between px-6 py-4 cursor-pointer"
                      onClick={() => setExpandedId(isExpanded ? null : a.appointment_id)}
                    >
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
                            {' · '}{formatTime(a.slot_time)}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${cfg.color}`}>
                          {cfg.icon} {cfg.label}
                        </span>
                        {isExpanded ? <ChevronUp size={16} className="text-gray-500" /> : <ChevronDown size={16} className="text-gray-500" />}
                      </div>
                    </div>

                    {/* Expanded Details */}
                    {isExpanded && (
                      <div className="px-6 pb-5 animate-[fadeIn_0.2s_ease-out]">
                        <div className="bg-white/5 rounded-xl p-5 border border-white/5 space-y-4">
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
                              <p className="text-xs text-gray-500 uppercase mb-1">Date & Time</p>
                              <p className="text-white font-semibold">
                                {new Date(a.slot_date).toLocaleDateString()} · {formatTime(a.slot_time)}
                              </p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-500 uppercase mb-1">Status</p>
                              <p className="text-white font-semibold capitalize">{a.status.replace('_', ' ')}</p>
                            </div>
                          </div>

                          {a.notes && (
                            <div>
                              <p className="text-xs text-gray-500 uppercase mb-1">Customer Notes</p>
                              <p className="text-sm text-gray-300 bg-black/30 p-3 rounded-lg">{a.notes}</p>
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-3 pt-2">
                            {a.status === 'approved' && (
                              <button
                                onClick={() => handleStatusUpdate(a.appointment_id, 'in_progress')}
                                disabled={updating === a.appointment_id}
                                className="flex items-center gap-1.5 px-4 py-2 bg-purple-600 text-white font-bold rounded-lg text-xs hover:bg-purple-500 transition-colors disabled:opacity-50"
                              >
                                <Play size={12} /> Start Job
                              </button>
                            )}
                            {a.status === 'in_progress' && completingId !== a.appointment_id && (
                              <button
                                onClick={() => setCompletingId(a.appointment_id)}
                                disabled={updating === a.appointment_id}
                                className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white font-bold rounded-lg text-xs hover:bg-green-500 transition-colors disabled:opacity-50"
                              >
                                <CheckCircle2 size={12} /> Mark Complete
                              </button>
                            )}
                            {a.status === 'in_progress' && completingId === a.appointment_id && (
                              <div className="w-full space-y-3 border-t border-white/10 pt-3 mt-1">
                                <div className="flex items-center gap-2 text-sm font-bold text-green-400">
                                  <FileText size={14} /> Service Record
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                                  <div>
                                    <label className="block text-xs text-gray-500 mb-1">Diagnosis</label>
                                    <textarea value={serviceForm.diagnosis} onChange={e => setServiceForm({ ...serviceForm, diagnosis: e.target.value })}
                                      rows={2} placeholder="What was found..."
                                      className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-green-500 resize-none" />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-gray-500 mb-1">Parts Used</label>
                                    <textarea value={serviceForm.parts_used} onChange={e => setServiceForm({ ...serviceForm, parts_used: e.target.value })}
                                      rows={2} placeholder="Brake pads, oil filter..."
                                      className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-green-500 resize-none" />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-gray-500 mb-1">Labour Hours</label>
                                    <input type="number" step="0.5" min="0" value={serviceForm.labour_hours} onChange={e => setServiceForm({ ...serviceForm, labour_hours: e.target.value })}
                                      placeholder="2.5"
                                      className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-green-500" />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-gray-500 mb-1">Total Cost (₹)</label>
                                    <input type="number" step="0.01" min="0" value={serviceForm.cost} onChange={e => setServiceForm({ ...serviceForm, cost: e.target.value })}
                                      placeholder="350.00"
                                      className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-green-500" />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-gray-500 mb-1">Next Service Date</label>
                                    <input type="date" value={serviceForm.next_service_date} onChange={e => setServiceForm({ ...serviceForm, next_service_date: e.target.value })}
                                      className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-green-500" />
                                  </div>
                                  <div>
                                    <label className="block text-xs text-gray-500 mb-1">Technician Notes</label>
                                    <input value={serviceForm.technician_notes} onChange={e => setServiceForm({ ...serviceForm, technician_notes: e.target.value })}
                                      placeholder="Additional notes..."
                                      className="w-full bg-black/30 border border-white/10 rounded-lg px-3 py-2 text-white text-xs focus:outline-none focus:ring-1 focus:ring-green-500" />
                                  </div>
                                </div>
                                <div className="flex gap-2">
                                  <button onClick={() => handleCompleteWithRecord(a)} disabled={updating === a.appointment_id}
                                    className="flex items-center gap-1.5 px-4 py-2 bg-green-600 text-white font-bold rounded-lg text-xs hover:bg-green-500 transition-colors disabled:opacity-50">
                                    {updating === a.appointment_id ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />} Complete & Save Record
                                  </button>
                                  <button onClick={() => setCompletingId(null)}
                                    className="px-4 py-2 bg-white/5 border border-white/10 text-gray-400 rounded-lg text-xs hover:bg-white/10">
                                    Cancel
                                  </button>
                                </div>
                              </div>
                            )}
                            {a.status === 'completed' && (
                              <span className="flex items-center gap-1.5 text-green-400 text-xs font-bold">
                                <CheckCircle2 size={14} /> Job completed successfully
                              </span>
                            )}
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


      </div>
    </div>
  );
}

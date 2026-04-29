import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Loader2, User, Mail, Phone, Shield, Calendar,
  Save, Car, Wrench, CheckCircle2, Clock, X,
  BookOpen, History
} from 'lucide-react';

const BOOKING_STATUS = {
  inquiry: { label: 'Inquiry', color: 'bg-blue-500/20 text-blue-400' },
  test_drive_scheduled: { label: 'Test Drive', color: 'bg-amber-500/20 text-amber-400' },
  booking_confirmed: { label: 'Confirmed', color: 'bg-purple-500/20 text-purple-400' },
  delivered: { label: 'Delivered', color: 'bg-green-500/20 text-green-400' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/20 text-red-400' },
};

const APPT_STATUS = {
  pending: { label: 'Pending', color: 'bg-amber-500/20 text-amber-400' },
  in_progress: { label: 'In Progress', color: 'bg-purple-500/20 text-purple-400' },
  completed: { label: 'Completed', color: 'bg-green-500/20 text-green-400' },
  cancelled: { label: 'Cancelled', color: 'bg-red-500/20 text-red-400' },
};

const SERVICE_LABELS = {
  general_checkup: 'General Checkup', full_service: 'Full Service',
  oil_change: 'Oil Change', tire_rotation: 'Tire Rotation',
  brake_inspection: 'Brake Inspection', engine_tune: 'Engine Tune-Up',
  ac_service: 'A/C Service', body_repair: 'Body Repair', other: 'Other'
};

export default function CustomerProfile() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', phone: '' });
  const [bookings, setBookings] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [serviceRecords, setServiceRecords] = useState([]);
  const [vehicles, setVehicles] = useState({});
  const [activeTab, setActiveTab] = useState('bookings');
  const [successMsg, setSuccessMsg] = useState('');

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [bookingsRes, apptsRes, vehRes, recordsRes] = await Promise.all([
        api.get('/api/bookings'),
        api.get('/api/appointments'),
        api.get('/api/vehicles'),
        api.get('/api/service-records').catch(() => ({ data: [] }))
      ]);

      const vMap = {};
      vehRes.data.forEach(v => { vMap[v.vehicle_id] = v; });

      setBookings(bookingsRes.data);
      setAppointments(apptsRes.data);
      setServiceRecords(recordsRes.data);
      setVehicles(vMap);
      setProfileForm({ name: user?.name || '', phone: user?.phone || '' });
    } catch (err) {
      console.error('Failed to load profile data', err);
    } finally {
      setLoading(false);
    }
  };

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      await api.patch('/api/auth/me', profileForm);
      const stored = JSON.parse(localStorage.getItem('user') || '{}');
      stored.name = profileForm.name;
      stored.phone = profileForm.phone;
      localStorage.setItem('user', JSON.stringify(stored));
      setEditMode(false);
      setSuccessMsg('Profile updated successfully!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-primary" size={48} /></div>;

  return (
    <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
      <header>
        <h1 className="text-4xl font-extrabold text-white mb-1">
          My <span className="text-gradient">Profile</span>
        </h1>
        <p className="text-gray-400">Manage your account and view your complete history.</p>
      </header>

      {successMsg && (
        <div className="p-3 bg-green-500/20 border border-green-500/50 rounded-lg text-green-300 text-sm flex items-center gap-2">
          <CheckCircle2 size={16} /> {successMsg}
        </div>
      )}

      {/* Profile Card */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <User size={20} className="text-primary" /> Account Details
          </h3>
          {!editMode ? (
            <button onClick={() => setEditMode(true)}
              className="text-sm text-primary hover:underline font-medium">Edit Profile</button>
          ) : (
            <button onClick={() => { setEditMode(false); setProfileForm({ name: user?.name || '', phone: user?.phone || '' }); }}
              className="text-sm text-gray-400 hover:text-white"><X size={18} /></button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase mb-1">
              <User size={12} /> Full Name
            </label>
            {editMode ? (
              <input value={profileForm.name} onChange={e => setProfileForm({...profileForm, name: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            ) : (
              <p className="text-white font-semibold">{user?.name}</p>
            )}
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase mb-1">
              <Mail size={12} /> Email
            </label>
            <p className="text-white font-semibold">{user?.email}</p>
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase mb-1">
              <Phone size={12} /> Phone
            </label>
            {editMode ? (
              <input value={profileForm.phone} onChange={e => setProfileForm({...profileForm, phone: e.target.value})}
                placeholder="Enter phone number"
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            ) : (
              <p className="text-white font-semibold">{user?.phone || '—'}</p>
            )}
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-xs font-bold text-gray-400 uppercase mb-1">
              <Shield size={12} /> Role
            </label>
            <p className="text-primary font-semibold capitalize">{user?.role?.replace('_', ' ')}</p>
          </div>
        </div>

        {editMode && (
          <div className="mt-4 flex gap-3">
            <button onClick={handleProfileSave} disabled={saving}
              className="flex items-center gap-2 px-5 py-2.5 bg-primary text-black font-bold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Changes
            </button>
          </div>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="glass-card p-4 text-center border-t-4 border-t-primary">
          <p className="text-2xl font-black text-white">{bookings.length}</p>
          <p className="text-xs text-gray-400 mt-1">Total Bookings</p>
        </div>
        <div className="glass-card p-4 text-center border-t-4 border-t-green-500">
          <p className="text-2xl font-black text-white">{bookings.filter(b => b.status === 'delivered').length}</p>
          <p className="text-xs text-gray-400 mt-1">Vehicles Owned</p>
        </div>
        <div className="glass-card p-4 text-center border-t-4 border-t-purple-500">
          <p className="text-2xl font-black text-white">{appointments.length}</p>
          <p className="text-xs text-gray-400 mt-1">Appointments</p>
        </div>
        <div className="glass-card p-4 text-center border-t-4 border-t-amber-500">
          <p className="text-2xl font-black text-white">{serviceRecords.length}</p>
          <p className="text-xs text-gray-400 mt-1">Service Records</p>
        </div>
      </div>

      {/* History Tabs */}
      <div className="glass-card overflow-hidden">
        <div className="flex border-b border-white/10">
          {[
            { id: 'bookings', label: 'Bookings', icon: <BookOpen size={14} /> },
            { id: 'appointments', label: 'Appointments', icon: <Calendar size={14} /> },
            { id: 'service', label: 'Service History', icon: <History size={14} /> },
          ].map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-6 py-3.5 text-sm font-bold transition-all ${
                activeTab === tab.id
                  ? 'text-primary border-b-2 border-primary bg-primary/5'
                  : 'text-gray-400 hover:text-white'
              }`}>
              {tab.icon} {tab.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {/* Bookings Tab */}
          {activeTab === 'bookings' && (
            bookings.length === 0 ? (
              <p className="text-gray-500 italic text-center py-8">No bookings found.</p>
            ) : (
              <div className="space-y-3">
                {bookings.map(b => {
                  const v = vehicles[b.vehicle_id];
                  const cfg = BOOKING_STATUS[b.status] || BOOKING_STATUS.inquiry;
                  return (
                    <div key={b.booking_id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                      <div className="flex items-center gap-3 min-w-0">
                        {v?.image_url ? (
                          <img src={v.image_url} alt="" className="w-14 h-10 rounded-lg object-cover shrink-0" />
                        ) : (
                          <div className="w-14 h-10 rounded-lg bg-white/10 flex items-center justify-center shrink-0">🚗</div>
                        )}
                        <div className="min-w-0">
                          <p className="text-sm font-bold text-white truncate">{v ? `${v.make} ${v.model}` : 'Vehicle'}</p>
                          <p className="text-xs text-gray-500">
                            {b.booking_date ? new Date(b.booking_date).toLocaleDateString() : '—'}
                            {b.deposit_amount ? ` · ₹${Number(b.deposit_amount).toLocaleString()}` : ''}
                          </p>
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${cfg.color}`}>{cfg.label}</span>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* Appointments Tab */}
          {activeTab === 'appointments' && (
            appointments.length === 0 ? (
              <p className="text-gray-500 italic text-center py-8">No appointments found.</p>
            ) : (
              <div className="space-y-3">
                {appointments.map(a => {
                  const v = vehicles[a.vehicle_id];
                  const cfg = APPT_STATUS[a.status] || APPT_STATUS.pending;
                  return (
                    <div key={a.appointment_id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5">
                      <div className="min-w-0">
                        <p className="text-sm font-bold text-white truncate">
                          {v ? `${v.make} ${v.model}` : 'Vehicle'} — {SERVICE_LABELS[a.service_type] || a.service_type}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(a.slot_date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
                        </p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${cfg.color}`}>{cfg.label}</span>
                    </div>
                  );
                })}
              </div>
            )
          )}

          {/* Service History Tab */}
          {activeTab === 'service' && (
            serviceRecords.length === 0 ? (
              <p className="text-gray-500 italic text-center py-8">No service records found.</p>
            ) : (
              <div className="space-y-3">
                {serviceRecords.map(r => {
                  const v = vehicles[r.vehicle_id];
                  return (
                    <div key={r.record_id} className="p-4 bg-white/5 rounded-xl border border-white/5">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-bold text-white">{v ? `${v.make} ${v.model}` : 'Vehicle'}</p>
                        <span className="text-xs text-gray-500">{new Date(r.created_at).toLocaleDateString()}</span>
                      </div>
                      {r.diagnosis && <p className="text-xs text-gray-400 mb-1"><strong className="text-gray-300">Diagnosis:</strong> {r.diagnosis}</p>}
                      {r.parts_used && <p className="text-xs text-gray-400 mb-1"><strong className="text-gray-300">Parts:</strong> {r.parts_used}</p>}
                      <div className="flex gap-4 mt-2 text-xs">
                        {r.cost > 0 && <span className="text-primary font-bold">₹{Number(r.cost).toLocaleString()}</span>}
                        {r.labour_hours > 0 && <span className="text-gray-400">{r.labour_hours}h labour</span>}
                        {r.next_service_date && <span className="text-amber-400">Next: {new Date(r.next_service_date).toLocaleDateString()}</span>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )
          )}
        </div>
      </div>
    </div>
  );
}

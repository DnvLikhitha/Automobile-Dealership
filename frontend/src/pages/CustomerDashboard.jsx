import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, BookOpen, Key } from 'lucide-react';
import { MiniCalendar } from '../components/ui/Calendar';

export default function CustomerDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const [apptsRes, vehRes] = await Promise.all([
          api.get('/api/appointments'),
          api.get('/api/vehicles')
        ]);

        const vMap = {};
        vehRes.data.forEach(v => { vMap[v.vehicle_id] = v; });

        // Show next 3 upcoming appointments as recent activity
        const upcoming = apptsRes.data
          .filter(a => a.status !== 'completed' && a.status !== 'cancelled')
          .slice(0, 3)
          .map(a => ({
            id: a.appointment_id,
            type: 'Appointment',
            title: `${vMap[a.vehicle_id]?.make || 'Vehicle'} - ${a.service_type.replace('_', ' ').toUpperCase()}`,
            date: new Date(a.slot_date).toLocaleDateString(),
            status: a.status
          }));

        setRecent(upcoming);
      } catch (err) {
        console.error("Failed to fetch activity");
      }
    };
    fetchRecent();
  }, []);

  const handleCancelAppointment = async (appointmentId) => {
    if (!window.confirm("Are you sure you want to cancel this service appointment?")) return;
    try {
      await api.patch(`/api/appointments/${appointmentId}`, { status: 'cancelled' });
      setRecent(prev => prev.filter(a => a.id !== appointmentId));
    } catch (err) {
      alert("Failed to cancel appointment. " + (err.response?.data?.detail || err.message));
    }
  };

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <header className="mb-8">
        <p className="text-[#00adef] text-xs font-bold uppercase tracking-[0.3em] mb-2">My Portal</p>
        <h1 className="text-4xl font-black text-white uppercase mb-2">My Profile.</h1>
        <p className="text-gray-500">Welcome, {user?.name}. Manage your vehicles and bookings here.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div
          onClick={() => navigate('/my-bookings')}
          className="glass-card p-6 flex flex-col items-center text-center gap-4 hover:bg-white/10 transition-colors cursor-pointer border-t-2 border-t-primary"
        >
          <BookOpen size={48} className="text-primary" />
          <h3 className="text-xl font-bold text-white">My Bookings</h3>
          <p className="text-sm text-gray-400">View and manage your test drives and purchases.</p>
        </div>

        <div
          onClick={() => navigate('/my-bookings')}
          className="glass-card p-6 flex flex-col items-center text-center gap-4 hover:bg-white/10 transition-colors cursor-pointer border-t-2 border-t-green-500"
        >
          <Key size={48} className="text-green-400" />
          <h3 className="text-xl font-bold text-white">My Garage</h3>
          <p className="text-sm text-gray-400">View vehicles you've purchased and their service history.</p>
        </div>

        <div
          onClick={() => navigate('/schedule-service')}
          className="glass-card p-6 flex flex-col items-center text-center gap-4 hover:bg-white/10 transition-colors cursor-pointer border-t-2 border-t-purple-500"
        >
          <ShieldAlert size={48} className="text-purple-400" />
          <h3 className="text-xl font-bold text-white">Schedule Service</h3>
          <p className="text-sm text-gray-400">Book maintenance and repairs for your cars.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6 mt-8">
        <div className="glass-card p-8 xl:col-span-2 min-h-[300px]">
          <h3 className="text-2xl font-bold text-white mb-6">Upcoming Appointments</h3>
          {recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-12 border border-dashed border-white/10 bg-white/5 rounded-xl">
              <p className="text-gray-400 italic">No recent activity on your account.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {recent.map(item => (
                <div key={item.id} className="flex justify-between items-center p-4 bg-white/5 rounded-lg border-l-4 border-l-purple-500">
                  <div>
                    <h4 className="font-bold text-white text-lg">{item.title}</h4>
                    <span className="text-sm text-gray-400">Scheduled for {item.date}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="px-3 py-1 bg-purple-500/20 text-purple-300 font-bold text-xs uppercase tracking-wider rounded-md">
                      {item.status.replace('_', ' ')}
                    </span>
                    <button
                      onClick={() => handleCancelAppointment(item.id)}
                      className="text-xs font-bold text-red-400 hover:text-red-300 transition-colors uppercase tracking-wider"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

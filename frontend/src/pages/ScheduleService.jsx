import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  ShieldAlert, Calendar, Clock, Car, PenTool,
  Clock2
} from 'lucide-react';

import { MiniCalendar, TimeSlotPicker } from '../components/ui/Calendar';


/* ═══════════════════════════════════════════════
   ScheduleService Main Component
   ═══════════════════════════════════════════════ */
export default function ScheduleService() {
  const navigate = useNavigate();
  const [garage, setGarage] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Selected date as Date object; time as "HH:MM" string
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');

  const [formData, setFormData] = useState({
    vehicle_id: '',
    service_type: 'general_checkup',
    notes: ''
  });

  const SERVICE_TYPES = [
    { id: 'general_checkup', name: 'General Checkup' },
    { id: 'full_service', name: 'Full Service' },
    { id: 'oil_change', name: 'Oil & Filter Change' },
    { id: 'tire_rotation', name: 'Tire Rotation' },
    { id: 'brake_inspection', name: 'Brake Inspection' },
    { id: 'engine_tune', name: 'Engine Tune-Up' },
    { id: 'ac_service', name: 'A/C Service' },
    { id: 'body_repair', name: 'Body Repair' },
    { id: 'other', name: 'Other / Diagnostics' }
  ];

  useEffect(() => {
    const fetchGarage = async () => {
      try {
        const vehiclesRes = await api.get('/api/vehicles');

        // Show all vehicles from inventory
        const allVehicles = vehiclesRes.data.map(v => ({
          vehicle_id: v.vehicle_id,
          name: `${v.year} ${v.make} ${v.model}`
        }));

        setGarage(allVehicles);

        if (allVehicles.length > 0) {
          setFormData(prev => ({ ...prev, vehicle_id: allVehicles[0].vehicle_id }));
        }
      } catch (err) {
        console.error(err);
        setError('Failed to load vehicles. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchGarage();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedDate || !selectedTime) {
      setError('Please select both a date and a time slot.');
      return;
    }

    setSubmitting(true);
    setError('');
    setSuccess('');

    // Format date as YYYY-MM-DD
    const y = selectedDate.getFullYear();
    const m = String(selectedDate.getMonth() + 1).padStart(2, '0');
    const d = String(selectedDate.getDate()).padStart(2, '0');
    const slot_date = `${y}-${m}-${d}`;

    try {
      await api.post('/api/appointments', {
        ...formData,
        slot_date,
        slot_time: selectedTime
      });
      setSuccess('Your service appointment has been successfully requested! Redirecting...');
      setTimeout(() => navigate('/customer-dashboard'), 3000);
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to schedule appointment. Time slot might be booked.');
    } finally {
      setSubmitting(false);
    }
  };

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(0, 0, 0, 0);

  if (loading) return <div className="text-center py-20 text-gray-400">Loading scheduling portal...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <header className="mb-8 border-b border-white/10 pb-6">
        <p className="text-[#00adef] text-xs font-bold uppercase tracking-[0.3em] mb-2">Service Center</p>
        <h1 className="text-4xl font-black text-white uppercase mb-2">Schedule Service.</h1>
        <p className="text-gray-500 text-sm">Book certified maintenance and repairs for your vehicles.</p>
      </header>

      {garage.length === 0 ? (
        <div className="glass-card p-12 text-center text-gray-400">
          <p className="mb-4">You must own a vehicle to schedule standard maintenance.</p>
          <button
            onClick={() => navigate('/inventory')}
            className="px-6 py-2 bg-primary text-black font-bold rounded-lg hover:bg-primary-dark transition-colors"
          >
            Browse Inventory
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">

          {error && <div className="p-4 bg-red-500/20 border border-red-500/50 text-red-300 rounded-lg">{error}</div>}
          {success && <div className="p-4 bg-green-500/20 border border-green-500/50 text-green-300 rounded-lg">{success}</div>}

          {/* Vehicle & Service Type */}
          <div className="glass-card p-6 border-t-2 space-y-5" style={{ borderTopColor: '#00adef' }}>
            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <Car size={16} className="text-[#00adef]" /> Select Vehicle
              </label>
              <select
                name="vehicle_id"
                value={formData.vehicle_id}
                onChange={handleChange}
                required
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              >
                {garage.map(v => (
                  <option key={v.vehicle_id} value={v.vehicle_id}>{v.name}</option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold uppercase tracking-widest text-gray-400 flex items-center gap-2">
                <PenTool size={16} className="text-[#00adef]" /> Service Requested
              </label>
              <select
                name="service_type"
                value={formData.service_type}
                onChange={handleChange}
                required
                className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500"
              >
                {SERVICE_TYPES.map(type => (
                  <option key={type.id} value={type.id}>{type.name}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Calendar + Time Picker Card */}
          <div className="glass-card overflow-hidden border border-white/5">
            <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-white/10">

              {/* Calendar Side */}
              <div className="p-6">
                <label className="text-sm font-bold uppercase tracking-widest text-gray-300 flex items-center gap-2 mb-4">
                  <Calendar size={16} className="text-[#00adef]" /> Select Date
                </label>
                <MiniCalendar
                  selectedDate={selectedDate}
                  onSelectDate={setSelectedDate}
                  minDate={tomorrow}
                />
                {selectedDate && (
                  <div className="mt-4 text-center">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-[#00adef]/20 border border-[#00adef]/30 text-[#00adef] text-xs font-semibold">
                      {selectedDate.toLocaleDateString('en-US', {
                        weekday: 'long', month: 'long', day: 'numeric', year: 'numeric'
                      })}
                    </span>
                  </div>
                )}
              </div>

              {/* Time Slots Side */}
              <div className="p-6">
                <label className="text-sm font-bold uppercase tracking-widest text-gray-300 flex items-center gap-2 mb-4">
                  <Clock2 size={16} className="text-[#00adef]" /> Select Time Slot
                </label>
                <TimeSlotPicker selectedTime={selectedTime} onSelectTime={setSelectedTime} />
                {selectedTime && (
                  <div className="mt-4 text-center">
                    <span className="inline-block px-4 py-1.5 rounded-full bg-[#00adef]/20 border border-[#00adef]/30 text-[#00adef] text-xs font-semibold">
                      {(() => {
                        const [h, m] = selectedTime.split(':');
                        const hour = parseInt(h, 10);
                        const ampm = hour >= 12 ? 'PM' : 'AM';
                        const display = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
                        return `${display}:${m} ${ampm}`;
                      })()}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="glass-card p-6 space-y-2">
            <label className="text-sm font-bold text-gray-300">Additional Notes / Symptoms</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              placeholder="e.g. Grinding noise when braking, or request loaner car."
              rows="3"
              className="w-full bg-black/50 border border-white/10 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-purple-500 resize-none"
            ></textarea>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={submitting || success || !selectedDate || !selectedTime}
            className="w-full py-4 font-black text-sm uppercase tracking-widest transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            style={{ backgroundColor: '#00adef', color: '#fff', borderRadius: '0' }}
          >
            {submitting ? 'Processing...' : 'Confirm Appointment'}
          </button>
        </form>
      )}
    </div>
  );
}

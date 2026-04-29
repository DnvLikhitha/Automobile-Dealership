import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useSearchParams } from 'react-router-dom';
import api from '../services/api';
import {
  Loader2, Plus, Filter, Zap, Fuel, Settings2, Gauge, Palette,
  ChevronRight, Search, X, CalendarDays, MessageSquare, CheckCircle2, Clock, Heart
} from 'lucide-react';
import { MiniCalendar, TimeSlotPicker } from '../components/ui/Calendar';
import { useWishlist } from '../context/WishlistContext';

const AVAILABILITY_COLORS = {
  available: 'bg-green-500/20 text-green-400 border border-green-500/40',
  reserved: 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40',
  sold: 'bg-red-500/20 text-red-400 border border-red-500/40',
};

const FUEL_ICONS = {
  electric: <Zap size={14} className="text-blue-400" />,
  hybrid: <Zap size={14} className="text-green-400" />,
  petrol: <Fuel size={14} className="text-orange-400" />,
  diesel: <Fuel size={14} className="text-amber-400" />,
};

export default function Inventory() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toggleWishlist, isWishlisted } = useWishlist();

  const [vehicles, setVehicles] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  // fuelFilter: filters by v.fuel_type (electric, hybrid, petrol, diesel)
  const [fuelFilter, setFuelFilter] = useState('all');
  // typeFilter: filters by v.type (sedan, suv, hatchback, coupe, convertible)
  const [typeFilter, setTypeFilter] = useState('all');
  const [availFilter, setAvailFilter] = useState('all');
  const [selectedVehicle, setSelectedVehicle] = useState(null);

  // ── Read URL query params from mega-menu navigation ────────
  useEffect(() => {
    const fuel = searchParams.get('fuel');
    const type = searchParams.get('type');
    if (fuel) setFuelFilter(fuel.toLowerCase());
    if (type) setTypeFilter(type.toLowerCase());
  }, [searchParams]);

  // Booking form state
  const [showBookingForm, setShowBookingForm] = useState(false);
  const [bookingDateObj, setBookingDateObj] = useState(null);
  const [bookingTime, setBookingTime] = useState('');
  const [bookingNotes, setBookingNotes] = useState('');
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        const response = await api.get('/api/vehicles');
        setVehicles(response.data);
        setFiltered(response.data);
      } catch (err) {
        console.error('Failed to load inventory', err);
      } finally {
        setLoading(false);
      }
    };
    fetchVehicles();
  }, []);

  useEffect(() => {
    let result = [...vehicles];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(v =>
        `${v.make} ${v.model} ${v.year}`.toLowerCase().includes(q)
      );
    }
    // Fuel type filter (from URL param or local state)
    if (fuelFilter !== 'all') result = result.filter(v => v.fuel_type?.toLowerCase() === fuelFilter);
    // Vehicle category/type filter (from URL param or local state)
    if (typeFilter !== 'all') result = result.filter(v => v.type?.toLowerCase() === typeFilter);
    if (availFilter !== 'all') result = result.filter(v => v.availability === availFilter);

    setFiltered(result);
  }, [search, fuelFilter, typeFilter, availFilter, vehicles]);

  const vehicleTypes = ['all', ...new Set(vehicles.map(v => v.type))];

  const handleBooking = async () => {
    if (!user) {
      setSelectedVehicle(null);
      navigate('/login');
      return;
    }

    setBookingLoading(true);
    try {
      let isoDateStr = null;
      if (bookingDateObj && bookingTime) {
        const y = bookingDateObj.getFullYear();
        const m = String(bookingDateObj.getMonth() + 1).padStart(2, '0');
        const d = String(bookingDateObj.getDate()).padStart(2, '0');
        isoDateStr = `${y}-${m}-${d}T${bookingTime}:00.000Z`;
      }

      await api.post('/api/bookings', {
        vehicle_id: selectedVehicle.vehicle_id,
        booking_date: isoDateStr,
        notes: bookingNotes || null,
      });
      setBookingSuccess(true);
      setTimeout(() => {
        setSelectedVehicle(null);
        setShowBookingForm(false);
        setBookingSuccess(false);
        setBookingDateObj(null);
        setBookingTime('');
        setBookingNotes('');
      }, 2500);
    } catch (err) {
      console.error('Booking failed', err);
      alert(err.response?.data?.detail || 'Failed to create booking. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="animate-spin text-primary" size={48} />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-[fadeIn_0.5s_ease-out]">
      <div className="mb-8">
        <p className="text-[#00adef] text-xs font-bold uppercase tracking-[0.3em] mb-2">Showroom</p>
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-white uppercase mb-1">Vehicle Inventory.</h1>
            <p className="text-gray-500">{filtered.length} world-class vehicles available</p>
          </div>
          {(user?.role === 'admin' || user?.role === 'sales_executive') && (
            <button
              className="flex items-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-widest transition-colors"
              style={{ backgroundColor: '#00adef', color: '#fff', borderRadius: '0' }}
            >
              <Plus size={18} /> Add Vehicle
            </button>
          )}
        </div>
      </div>

      {/* Active filter banner — shown when a filter arrives from the mega-menu */}
      {(fuelFilter !== 'all' || typeFilter !== 'all') && (
        <div className="flex items-center gap-3 px-1 flex-wrap">
          <span className="text-xs font-bold uppercase tracking-widest text-gray-500">Active Filters:</span>
          {fuelFilter !== 'all' && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-[#00adef]/15 border border-[#00adef]/40 text-[#00adef] text-xs font-bold uppercase tracking-widest">
              Fuel: {fuelFilter}
              <button onClick={() => setFuelFilter('all')} className="hover:text-white transition-colors ml-1">
                <X size={11} />
              </button>
            </span>
          )}
          {typeFilter !== 'all' && (
            <span className="flex items-center gap-1.5 px-3 py-1 bg-[#00adef]/15 border border-[#00adef]/40 text-[#00adef] text-xs font-bold uppercase tracking-widest">
              Type: {typeFilter}
              <button onClick={() => setTypeFilter('all')} className="hover:text-white transition-colors ml-1">
                <X size={11} />
              </button>
            </span>
          )}
          <button
            onClick={() => { setFuelFilter('all'); setTypeFilter('all'); }}
            className="text-xs text-gray-500 hover:text-white transition-colors underline"
          >
            Clear all
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="glass-card p-5 rounded-2xl flex flex-col sm:flex-row gap-4 items-start sm:items-center">
        {/* Search */}
        <div className="relative flex-1 min-w-[200px]">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
          <input
            type="text"
            placeholder="Search by make, model..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00adef]/50 placeholder:text-gray-600"
          />
          {search && (
            <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-white">
              <X size={14} />
            </button>
          )}
        </div>

        {/* Type Filter pills */}
        <div className="flex gap-2 flex-wrap">
          {vehicleTypes.map(type => (
            <button
              key={type}
              onClick={() => setTypeFilter(type)}
              className={`px-4 py-2 text-xs font-bold uppercase tracking-wider transition-all capitalize ${
                typeFilter === type
                  ? 'bg-[#00adef] text-white'
                  : 'bg-white/5 border border-white/10 text-gray-400 hover:bg-white/10 hover:text-white'
              }`}
              style={{ borderRadius: '0' }}
            >
              {type}
            </button>
          ))}
        </div>

        {/* Availability Filter */}
        <select
          value={availFilter}
          onChange={e => setAvailFilter(e.target.value)}
          className="bg-black/40 border border-white/10 px-4 py-2.5 text-sm text-white focus:outline-none focus:border-[#00adef]/50"
          style={{ borderRadius: '0' }}
        >
          <option value="all">All Status</option>
          <option value="available">Available</option>
          <option value="reserved">Reserved</option>
          <option value="sold">Sold</option>
        </select>
      </div>


      {/* Vehicle Grid */}
      {filtered.length === 0 ? (
        <div className="glass-card p-16 text-center text-gray-400 italic rounded-2xl">
          No vehicles match your filters. Try adjusting your search.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filtered.map(v => (
            <div
              key={v.vehicle_id}
              className="glass-card overflow-hidden group hover:scale-[1.01] hover:shadow-[0_8px_40px_rgba(0,173,239,0.12)] transition-all duration-300 cursor-pointer"
              style={{ borderRadius: '0' }}
              onClick={() => setSelectedVehicle(v)}
            >
              {/* Image */}
              <div className="h-52 bg-black/40 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent z-10" />
                {v.image_url ? (
                  <img
                    src={v.image_url}
                    alt={`${v.make} ${v.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-700">
                    <span className="text-5xl">🚗</span>
                  </div>
                )}

                {/* Availability badge */}
                <div className="absolute top-3 right-3 z-20">
                  <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${AVAILABILITY_COLORS[v.availability] || ''}`}>
                    {v.availability}
                  </span>
                </div>

                {/* Wishlist heart button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation(); // don't open the detail modal
                    if (!user) { navigate('/login'); return; }
                    toggleWishlist(v);
                  }}
                  title={isWishlisted(v.vehicle_id) ? 'Remove from wishlist' : 'Save to wishlist'}
                  className="absolute top-3 left-3 z-20 w-8 h-8 flex items-center justify-center rounded-full transition-all"
                  style={{
                    backgroundColor: isWishlisted(v.vehicle_id) ? 'rgba(239,68,68,0.85)' : 'rgba(0,0,0,0.5)',
                    backdropFilter: 'blur(4px)',
                  }}
                >
                  <Heart
                    size={15}
                    fill={isWishlisted(v.vehicle_id) ? 'white' : 'none'}
                    stroke="white"
                    strokeWidth={2}
                  />
                </button>

                <div className="absolute bottom-4 left-4 z-20">
                  <p className="text-xs text-primary uppercase tracking-widest font-semibold">{v.year} · {v.type}</p>
                  <h3 className="text-2xl font-black text-white leading-tight">
                    {v.make} <span className="font-light">{v.model}</span>
                  </h3>
                </div>
              </div>

              {/* Details */}
              <div className="p-5">
                <div className="flex justify-between items-center mb-5">
                  <span className="text-3xl font-black text-primary tracking-tight">
                    ₹{Number(v.price).toLocaleString()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm mb-5">
                  <div className="flex items-center gap-2 text-gray-300">
                    {FUEL_ICONS[v.fuel_type] || <Fuel size={14} />}
                    <span className="capitalize">{v.fuel_type || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Settings2 size={14} className="text-gray-400" />
                    <span className="capitalize">{v.transmission || 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Gauge size={14} className="text-gray-400" />
                    <span>{Number(v.mileage).toLocaleString()} mi</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-300">
                    <Palette size={14} className="text-gray-400" />
                    <span className="truncate">{v.color || 'N/A'}</span>
                  </div>
                </div>

                <button
                  className={`w-full py-2.5 flex items-center justify-center gap-2 font-bold text-xs uppercase tracking-widest transition-all duration-200 ${
                    v.availability === 'available'
                      ? 'bg-[#00adef]/15 text-[#00adef] border border-[#00adef]/40 hover:bg-[#00adef] hover:text-white'
                      : 'bg-white/5 border border-white/10 text-gray-500 cursor-default'
                  }`}
                  style={{ borderRadius: '0' }}
                >
                  {v.availability === 'available' ? 'View Details & Book' : v.availability === 'reserved' ? 'Currently Reserved' : 'Vehicle Sold'}
                  {v.availability === 'available' && <ChevronRight size={16} />}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Vehicle Detail Modal */}
      {selectedVehicle && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md"
          onClick={() => { setSelectedVehicle(null); setShowBookingForm(false); setBookingSuccess(false); }}
        >
          <div
            className="glass-card max-w-2xl w-full overflow-hidden rounded-2xl border border-white/10 animate-[fadeIn_0.2s_ease-out] max-h-[90vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            {/* Modal Image */}
            <div className="h-64 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent z-10" />
              {selectedVehicle.image_url ? (
                <img src={selectedVehicle.image_url} alt={`${selectedVehicle.make} ${selectedVehicle.model}`} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-black/40 text-6xl">🚗</div>
              )}
              <div className="absolute bottom-5 left-6 z-20">
                <p className="text-primary uppercase text-xs tracking-widest font-semibold">{selectedVehicle.year} · {selectedVehicle.type}</p>
                <h2 className="text-3xl font-black text-white">
                  {selectedVehicle.make} <span className="font-light">{selectedVehicle.model}</span>
                </h2>
              </div>
              <button
                onClick={() => { setSelectedVehicle(null); setShowBookingForm(false); setBookingSuccess(false); }}
                className="absolute top-4 right-4 z-20 p-2 bg-black/50 rounded-full hover:bg-black/80 transition-colors"
              >
                <X size={18} className="text-white" />
              </button>
            </div>

            {/* Modal Details */}
            <div className="p-7">
              <div className="flex items-center justify-between mb-6">
                <span className="text-4xl font-black text-primary">₹{Number(selectedVehicle.price).toLocaleString()}</span>
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wider ${AVAILABILITY_COLORS[selectedVehicle.availability]}`}>
                  {selectedVehicle.availability}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Fuel', value: selectedVehicle.fuel_type, icon: FUEL_ICONS[selectedVehicle.fuel_type] || <Fuel size={18}/> },
                  { label: 'Transmission', value: selectedVehicle.transmission, icon: <Settings2 size={18}/> },
                  { label: 'Mileage', value: `${Number(selectedVehicle.mileage).toLocaleString()} mi`, icon: <Gauge size={18}/> },
                  { label: 'Color', value: selectedVehicle.color, icon: <Palette size={18}/> },
                ].map(item => (
                  <div key={item.label} className="bg-white/5 border border-white/10 rounded-xl p-4 text-center">
                    <div className="flex justify-center mb-2 text-gray-400">{item.icon}</div>
                    <p className="text-xs text-gray-500 uppercase tracking-wider mb-1">{item.label}</p>
                    <p className="text-sm font-semibold text-white capitalize">{item.value || 'N/A'}</p>
                  </div>
                ))}
              </div>

              {selectedVehicle.availability === 'available' ? (
                <>
                  {/* Success State */}
                  {bookingSuccess ? (
                    <div className="w-full py-6 flex flex-col items-center gap-3 bg-green-500/10 border border-green-500/30 rounded-xl animate-[fadeIn_0.3s_ease-out]">
                      <CheckCircle2 size={40} className="text-green-400" />
                      <p className="text-green-400 font-bold text-lg">Booking Created!</p>
                      <p className="text-gray-400 text-sm">Our sales team will get back to you shortly.</p>
                    </div>
                  ) : !showBookingForm ? (
                    <button
                      className="w-full py-4 font-black text-sm uppercase tracking-widest transition-colors"
                      style={{ backgroundColor: '#00adef', color: '#fff', borderRadius: '0' }}
                      onClick={() => {
                        if (!user) {
                          setSelectedVehicle(null);
                          navigate('/login');
                        } else {
                          setShowBookingForm(true);
                        }
                      }}
                    >
                      Book a Test Drive / Enquire
                    </button>
                  ) : (
                    /* Booking Form */
                    <div className="space-y-4 border-t border-white/10 pt-5 animate-[fadeIn_0.3s_ease-out]">
                      <h3 className="text-lg font-bold text-white flex items-center gap-2">
                        <CalendarDays size={18} className="text-primary" />
                        Schedule Your Visit
                      </h3>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-black/30 border border-white/10 rounded-xl p-4">
                          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-3 text-center">
                            Select Date
                          </label>
                          <MiniCalendar selectedDate={bookingDateObj} onSelectDate={setBookingDateObj} minDate={new Date()} />
                        </div>
                        <div className="bg-black/30 border border-white/10 rounded-xl p-4">
                          <label className="block text-xs text-gray-500 uppercase tracking-wider mb-3 text-center">
                            <Clock size={12} className="inline mr-1" />
                            Select Time
                          </label>
                          <TimeSlotPicker selectedTime={bookingTime} onSelectTime={setBookingTime} />
                        </div>
                      </div>

                      <div>
                        <label className="block text-xs text-gray-500 uppercase tracking-wider mb-1.5">
                          <MessageSquare size={12} className="inline mr-1" />
                          Notes (optional)
                        </label>
                        <textarea
                          value={bookingNotes}
                          onChange={e => setBookingNotes(e.target.value)}
                          rows={3}
                          placeholder="I'm interested in a test drive, financing options..."
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-1 focus:ring-primary resize-none placeholder:text-gray-600"
                        />
                      </div>

                      <div className="flex gap-3">
                        <button
                          onClick={handleBooking}
                          disabled={bookingLoading || !bookingDateObj || !bookingTime}
                          className="flex-1 py-3.5 bg-primary text-black font-bold text-sm rounded-xl hover:bg-primary-dark transition-colors shadow-[0_0_15px_rgba(0,240,255,0.4)] disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                          {bookingLoading ? <Loader2 size={16} className="animate-spin" /> : <CheckCircle2 size={16} />}
                          {bookingLoading ? 'Submitting...' : 'Confirm Booking'}
                        </button>
                        <button
                          onClick={() => setShowBookingForm(false)}
                          className="px-5 py-3.5 bg-white/5 border border-white/10 text-gray-400 rounded-xl hover:bg-white/10 text-sm font-medium"
                        >
                          Cancel
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full py-4 text-center text-gray-500 border border-white/10 rounded-xl">
                  This vehicle is not currently available.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

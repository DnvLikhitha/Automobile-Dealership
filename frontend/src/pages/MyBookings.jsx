import { useState, useEffect } from 'react';
import api from '../services/api';
import { ShoppingBag, Key, Calendar } from 'lucide-react';

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [vehicles, setVehicles] = useState({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [bookingsRes, vehiclesRes] = await Promise.all([
          api.get('/api/bookings'),
          api.get('/api/vehicles')
        ]);
        
        // Create vehicle lookup map
        const vMap = {};
        vehiclesRes.data.forEach(v => {
          vMap[v.vehicle_id] = v;
        });
        
        setVehicles(vMap);
        setBookings(bookingsRes.data || []);
      } catch (err) {
        console.error("Failed to load bookings", err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return <div className="text-center py-20 text-gray-400">Loading your data...</div>;
  }

  const handleCancelBooking = async (bookingId) => {
    if (!window.confirm("Are you sure you want to cancel this booking/inquiry?")) return;
    try {
      await api.patch(`/api/bookings/${bookingId}`, { status: 'cancelled' });
      // Update local state to reflect cancellation
      setBookings(prev => prev.map(b => b.booking_id === bookingId ? { ...b, status: 'cancelled' } : b));
    } catch (err) {
      alert("Failed to cancel booking. " + (err.response?.data?.detail || err.message));
    }
  };

  const activeBookings = bookings.filter(b => b.status !== 'delivered' && b.status !== 'cancelled');
  const garage = bookings.filter(b => b.status === 'delivered');

  return (
    <div className="space-y-12 animate-[fadeIn_0.5s_ease-out]">
      <header className="mb-8 border-b border-white/10 pb-6">
        <h1 className="text-4xl font-extrabold text-white mb-2">My Bookings & Garage</h1>
        <p className="text-gray-400">Track your ongoing test drives, purchases, and view your owned vehicles.</p>
      </header>

      {/* Active Bookings Section */}
      <section>
        <h2 className="text-2xl font-bold flex items-center gap-3 text-primary mb-6">
          <ShoppingBag /> Active Bookings
        </h2>
        {activeBookings.length === 0 ? (
          <div className="glass-card p-8 text-center text-gray-400 italic">
            You do not have any active bookings or inquiries. <br/> Head to the Inventory to test drive your dream car!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeBookings.map(booking => {
              const car = vehicles[booking.vehicle_id];
              return (
                <div key={booking.booking_id} className="glass-card p-6 flex flex-col gap-4 border-l-4 border-l-primary">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-xl font-bold text-white">
                        {car ? `${car.year} ${car.make} ${car.model}` : 'Unknown Vehicle'}
                      </h3>
                      <p className="text-sm text-gray-400">Booking ID: {booking.booking_id.substring(0,8).toUpperCase()}</p>
                    </div>
                    <span className="px-3 py-1 bg-primary/20 text-primary text-xs font-bold rounded-full uppercase tracking-wider">
                      {booking.status.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="flex flex-col gap-2 text-sm text-gray-300 mb-4">
                    <p><strong className="text-white">Booking Date:</strong> {new Date(booking.created_at).toLocaleDateString()}</p>
                    {booking.notes && <p><strong className="text-white">Notes:</strong> {booking.notes}</p>}
                  </div>
                  <button 
                    onClick={() => handleCancelBooking(booking.booking_id)}
                    className="mt-auto py-2 px-4 w-full border border-red-500/30 text-red-400 font-bold rounded-lg hover:bg-red-500/10 transition-colors text-sm"
                  >
                    Cancel Booking
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* My Garage Section */}
      <section>
        <h2 className="text-2xl font-bold flex items-center gap-3 text-green-400 mb-6">
          <Key /> My Garage
        </h2>
        {garage.length === 0 ? (
          <div className="glass-card p-8 text-center text-gray-400 italic">
            Your garage is empty. Once your vehicle is delivered, it will appear here!
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {garage.map(booking => {
              const car = vehicles[booking.vehicle_id];
              return (
                <div key={booking.booking_id} className="glass-card flex flex-col overflow-hidden border-t-2 border-t-green-500 hover:scale-[1.02] transition-transform duration-300">
                  {car?.image_url && (
                    <img src={car.image_url} alt={car.model} className="h-48 w-full object-cover border-b border-white/5" />
                  )}
                  <div className="p-6 flex flex-col gap-2">
                    <h3 className="text-xl font-bold text-white whitespace-nowrap overflow-hidden text-ellipsis">
                      {car ? `${car.year} ${car.make} ${car.model}` : 'Unknown Vehicle'}
                    </h3>
                    <p className="text-sm text-gray-400">Color: {car?.color || 'N/A'}</p>
                    <p className="text-sm text-gray-400 mb-2">Delivered: {booking.delivery_date ? new Date(booking.delivery_date).toLocaleDateString() : 'Recently'}</p>
                    <div className="flex items-center gap-2 text-green-400 text-sm font-semibold mt-auto pt-2 border-t border-white/10">
                      <span>✓ Official Owner</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>
    </div>
  );
}

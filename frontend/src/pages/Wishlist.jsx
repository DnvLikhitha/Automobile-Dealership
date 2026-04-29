import { useWishlist } from '../context/WishlistContext';
import { useNavigate } from 'react-router-dom';
import { Heart, Trash2, ChevronRight, Zap, Fuel } from 'lucide-react';

const AVAILABILITY_COLORS = {
  available: 'bg-green-500/20 text-green-400 border border-green-500/40',
  reserved:  'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40',
  sold:      'bg-red-500/20 text-red-400 border border-red-500/40',
};

const FUEL_ICONS = {
  electric: <Zap size={13} className="text-blue-400" />,
  hybrid:   <Zap size={13} className="text-green-400" />,
  petrol:   <Fuel size={13} className="text-orange-400" />,
  diesel:   <Fuel size={13} className="text-amber-400" />,
};

const formatINR = (n) =>
  n ? `₹${Number(n).toLocaleString('en-IN')}` : '—';

export default function Wishlist() {
  const { wishlist, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();

  return (
    <div className="space-y-8 animate-[fadeIn_0.4s_ease-out]">
      {/* Header */}
      <header className="border-b border-white/10 pb-6">
        <p className="text-[#00adef] text-xs font-bold uppercase tracking-[0.3em] mb-2">My Account</p>
        <div className="flex items-end justify-between gap-4">
          <div>
            <h1 className="text-4xl font-black text-white uppercase mb-1">Saved Vehicles.</h1>
            <p className="text-gray-500">
              {wishlist.length === 0
                ? 'No vehicles saved yet.'
                : `${wishlist.length} vehicle${wishlist.length > 1 ? 's' : ''} in your wishlist.`}
            </p>
          </div>
          <button
            onClick={() => navigate('/inventory')}
            className="flex items-center gap-2 px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors"
            style={{ border: '1px solid rgba(255,255,255,0.15)', color: '#aaa' }}
          >
            Browse More <ChevronRight size={14} />
          </button>
        </div>
      </header>

      {wishlist.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <Heart size={56} className="text-white/10 mb-6" strokeWidth={1} />
          <p className="text-white font-bold text-xl mb-2">Your wishlist is empty</p>
          <p className="text-gray-500 text-sm mb-8">Click the ♡ on any vehicle to save it here.</p>
          <button
            onClick={() => navigate('/inventory')}
            className="px-8 py-3 text-sm font-bold uppercase tracking-widest"
            style={{ backgroundColor: '#00adef', color: '#fff' }}
          >
            Browse Inventory
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {wishlist.map(v => (
            <div
              key={v.vehicle_id}
              className="glass-card overflow-hidden group transition-all duration-300 hover:shadow-[0_8px_40px_rgba(0,173,239,0.12)]"
              style={{ borderRadius: '0' }}
            >
              {/* Image */}
              <div className="h-48 bg-black/40 relative overflow-hidden">
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
                  <span className={`px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${AVAILABILITY_COLORS[v.availability] || ''}`}>
                    {v.availability}
                  </span>
                </div>

                {/* Title overlay */}
                <div className="absolute bottom-3 left-4 z-20">
                  <p className="text-[10px] text-[#00adef] uppercase tracking-widest font-semibold">{v.year} · {v.type}</p>
                  <h3 className="text-xl font-black text-white leading-tight">
                    {v.make} <span className="font-light">{v.model}</span>
                  </h3>
                </div>

                {/* Remove button */}
                <button
                  onClick={(e) => { e.stopPropagation(); removeFromWishlist(v.vehicle_id); }}
                  title="Remove from wishlist"
                  className="absolute top-3 left-3 z-20 w-8 h-8 flex items-center justify-center rounded-full bg-black/60 text-red-400 hover:bg-red-500 hover:text-white transition-all"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              {/* Details */}
              <div className="p-5">
                <p className="text-2xl font-black text-[#00adef] mb-3">{formatINR(v.price)}</p>

                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    {FUEL_ICONS[v.fuel_type?.toLowerCase()] || <Fuel size={13} />}
                    <span className="capitalize">{v.fuel_type || '—'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <span>⚙</span>
                    <span>{v.transmission || '—'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <span>🎨</span>
                    <span>{v.color || '—'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-gray-400">
                    <span>📏</span>
                    <span>{v.mileage ? `${Number(v.mileage).toLocaleString()} km` : '—'}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => navigate('/inventory')}
                    className="flex-1 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors"
                    style={{ backgroundColor: '#00adef', color: '#fff' }}
                  >
                    View & Book
                  </button>
                  <button
                    onClick={() => removeFromWishlist(v.vehicle_id)}
                    className="px-3 py-2.5 border border-white/10 text-gray-500 hover:border-red-500/40 hover:text-red-400 transition-colors"
                    title="Remove"
                  >
                    <Heart size={14} fill="currentColor" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

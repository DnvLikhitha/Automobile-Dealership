import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { LayoutDashboard, Car, CalendarCheck, ClipboardList, LogOut, Wrench, Settings, User, Heart } from 'lucide-react';

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getLinks = () => {
    const baseLinks = [];

    if (user?.role === 'admin') {
      baseLinks.push({ title: 'Dashboard', path: '/admin-dashboard', icon: <LayoutDashboard size={18} /> });
      baseLinks.push({ title: 'Inventory', path: '/inventory', icon: <Car size={18} /> });
      baseLinks.push({ title: 'Manage Inventory', path: '/manage-inventory', icon: <Settings size={18} /> });
      baseLinks.push({ title: 'System Reports', path: '/reports', icon: <ClipboardList size={18} /> });
    } else if (user?.role === 'sales_executive') {
      baseLinks.push({ title: 'Dashboard', path: '/sales-dashboard', icon: <LayoutDashboard size={18} /> });
      baseLinks.push({ title: 'Inventory', path: '/inventory', icon: <Car size={18} /> });
      baseLinks.push({ title: 'Manage Inventory', path: '/manage-inventory', icon: <Settings size={18} /> });
      baseLinks.push({ title: 'Bookings', path: '/my-bookings', icon: <CalendarCheck size={18} /> });
    } else if (user?.role === 'technician') {
      baseLinks.push({ title: 'Job Cards', path: '/technician-dashboard', icon: <Wrench size={18} /> });
    } else {
      baseLinks.push({ title: 'My Dashboard', path: '/customer-dashboard', icon: <LayoutDashboard size={18} /> });
      baseLinks.push({ title: 'Browse Cars', path: '/inventory', icon: <Car size={18} /> });
      baseLinks.push({ title: 'My Bookings', path: '/my-bookings', icon: <CalendarCheck size={18} /> });
      baseLinks.push({ title: 'Schedule Service', path: '/schedule-service', icon: <Wrench size={18} /> });
      baseLinks.push({ title: 'My Wishlist', path: '/wishlist', icon: <Heart size={18} /> });
    }

    baseLinks.push({ title: 'My Profile', path: '/profile', icon: <User size={18} /> });

    return baseLinks;
  };

  const links = getLinks();

  return (
    <aside className="w-64 h-full flex flex-col fixed left-0 top-0 bottom-0 z-40"
      style={{ background: '#0d0d0d', borderRight: '1px solid rgba(255,255,255,0.07)' }}
    >
      {/* Brand area at top */}
      <div className="px-6 pt-6 pb-4 border-b border-white/8" style={{ marginTop: '52px' }}>
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-gray-500">
          {user?.role?.replace('_', ' ')}
        </p>
        <p className="text-white font-bold text-sm mt-0.5 truncate">{user?.name}</p>
      </div>

      {/* Navigation links */}
      <nav className="flex-1 py-4 overflow-y-auto">
        {links.map((item, idx) => {
          const isActive = location.pathname === item.path;
          return (
            <Link
              key={idx}
              to={item.path}
              className="flex items-center gap-3 px-6 py-3.5 text-xs font-bold uppercase tracking-widest transition-all duration-150 relative"
              style={{
                color: isActive ? '#00adef' : '#888',
                borderLeft: isActive ? '2px solid #00adef' : '2px solid transparent',
                backgroundColor: isActive ? 'rgba(0,173,239,0.07)' : 'transparent',
              }}
            >
              <span style={{ color: isActive ? '#00adef' : '#666' }}>{item.icon}</span>
              {item.title}
            </Link>
          );
        })}
      </nav>

      {/* Logout at bottom — only shown when logged in */}
      {user && (
        <div className="px-4 py-5 border-t border-white/8">
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center gap-2 py-2.5 text-xs font-bold uppercase tracking-widest transition-colors"
            style={{ color: '#ef4444', border: '1px solid rgba(239,68,68,0.25)', borderRadius: '2px' }}
            onMouseEnter={e => e.currentTarget.style.backgroundColor = 'rgba(239,68,68,0.08)'}
            onMouseLeave={e => e.currentTarget.style.backgroundColor = 'transparent'}
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      )}
    </aside>
  );
}

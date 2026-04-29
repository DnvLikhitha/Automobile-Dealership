import { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Link, useNavigate, useLocation } from 'react-router-dom';
import Scene3D from './components/3d/Scene3D';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Inventory from './pages/Inventory';
import AdminDashboard from './pages/AdminDashboard';
import CustomerDashboard from './pages/CustomerDashboard';
import SalesDashboard from './pages/SalesDashboard';
import TechnicianDashboard from './pages/TechnicianDashboard';
import MyBookings from './pages/MyBookings';
import ScheduleService from './pages/ScheduleService';
import SystemReports from './pages/SystemReports';
import ManageInventory from './pages/ManageInventory';
import CustomerProfile from './pages/CustomerProfile';
import Wishlist from './pages/Wishlist';
import { WishlistProvider, useWishlist } from './context/WishlistContext';

const HERO_SLIDES = [
  {
    image: '/hero-1.png',
    eyebrow: 'Premium Dealership',
    headline: 'DRIVE\nYOUR DREAM.',
    tagline: 'Discover the finest selection of luxury and performance vehicles.',
  },
  {
    image: '/hero-2.png',
    eyebrow: 'Expert Service',
    headline: 'FEEL\nTHE POWER.',
    tagline: 'Certified technicians. Genuine parts. Complete peace of mind.',
  },
];



const SERVICES = [
  {
    icon: '🔧',
    title: 'Preventive Maintenance',
    desc: 'Oil changes, filter replacements, fluid top-ups and full multi-point inspections to keep your vehicle performing at its peak.',
  },
  {
    icon: '🛞',
    title: 'Tyre & Brake Service',
    desc: 'Tyre rotations, balancing, wheel alignment and complete brake system inspections by our certified technicians.',
  },
  {
    icon: '❄️',
    title: 'A/C & Climate Control',
    desc: 'Full air-conditioning service, refrigerant recharge and cabin filter replacement for year-round comfort.',
  },
  {
    icon: '⚙️',
    title: 'Engine & Transmission',
    desc: 'Comprehensive engine diagnostics, tune-ups and transmission servicing with OEM-grade parts.',
  },
  {
    icon: '🚗',
    title: 'Test Drive Booking',
    desc: 'Schedule a personalised test drive at your convenience. Experience your dream car before you buy.',
  },
  {
    icon: '📋',
    title: 'Service Records',
    desc: 'Full digital service history maintained for every vehicle — accessible from your customer dashboard anytime.',
  },
];

const WHY_US = [
  { title: 'Certified Experts', desc: 'All our technicians are factory-trained and certified for the brands we carry.' },
  { title: 'Genuine Parts', desc: 'We use only OEM and manufacturer-approved parts for every service and repair.' },
  { title: 'Transparent Pricing', desc: 'No hidden charges. You receive a detailed estimate before any work begins.' },
  { title: 'Digital Dashboard', desc: 'Track your bookings, service history and vehicle status online — 24/7.' },
];

const BRANDS = ['Mercedes-Benz', 'BMW', 'Porsche', 'Tesla', 'Range Rover', 'Audi'];

function LandingPage() {
  const [activeSlide, setActiveSlide] = useState(0);
  const [transitioning, setTransitioning] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setTransitioning(true);
      setTimeout(() => {
        setActiveSlide((prev) => (prev + 1) % HERO_SLIDES.length);
        setTransitioning(false);
      }, 500);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const slide = HERO_SLIDES[activeSlide];

  return (
    <div className="w-full bg-black text-white">
      {/* ───── HERO ───── */}
      <section className="relative w-full h-screen overflow-hidden bg-black">
        {/* Background Images */}
        {HERO_SLIDES.map((s, i) => (
          <div
            key={i}
            className="absolute inset-0 transition-opacity duration-1000 ease-in-out"
            style={{ opacity: i === activeSlide && !transitioning ? 1 : 0 }}
          >
            <img src={s.image} alt="" className="w-full h-full object-cover opacity-55" />
          </div>
        ))}
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

        {/* Hero Content */}
        <div className="relative z-10 flex flex-col justify-end h-full px-10 md:px-20 lg:px-28 pb-36">
          <div className={`max-w-2xl transition-all duration-700 ${transitioning ? 'opacity-0 translate-y-4' : 'opacity-100 translate-y-0'}`}>
            <p className="text-[#00adef] text-sm font-bold uppercase tracking-[0.3em] mb-4">{slide.eyebrow}</p>
            <h1 className="text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-white leading-[0.88] tracking-tight mb-6 uppercase">
              {slide.headline.split('\n').map((line, i) => <span key={i} className="block">{line}</span>)}
            </h1>
            <p className="text-base md:text-lg text-gray-300 font-light mb-10 max-w-md">{slide.tagline}</p>
            <div className="flex flex-wrap gap-4">
              <Link to="/inventory" className="btn-outline-dark">Browse Inventory</Link>
              <Link to="/login" className="btn-primary">Client Portal</Link>
            </div>
          </div>
        </div>

        {/* Slide indicators */}
        <div className="absolute bottom-16 right-12 z-20 flex gap-2">
          {HERO_SLIDES.map((_, i) => (
            <button
              key={i}
              onClick={() => { if (i !== activeSlide) { setTransitioning(true); setTimeout(() => { setActiveSlide(i); setTransitioning(false); }, 400); } }}
              className={`w-8 h-0.5 transition-all duration-300 ${i === activeSlide ? 'bg-[#00adef]' : 'bg-white/30'}`}
            />
          ))}
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-1 animate-bounce">
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/40">Scroll</span>
          <svg className="w-4 h-4 text-white/40" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" d="m19 9-7 7-7-7" />
          </svg>
        </div>
      </section>

      {/* ───── BRANDS MARQUEE ───── */}
      <section className="bg-[#0d0d0d] border-y border-white/10 py-5 overflow-hidden">
        {/* Double the list so it loops seamlessly */}
        <div className="flex" style={{ animation: 'marquee 22s linear infinite' }}>
          {[...BRANDS, ...BRANDS, ...BRANDS].map((b, i) => (
            <span key={i} className="shrink-0 flex items-center gap-6 px-8">
              <span className="text-xs font-black uppercase tracking-[0.3em] text-white">
                {b}
              </span>
              <span className="text-[#00adef] text-lg leading-none select-none">·</span>
            </span>
          ))}
        </div>
      </section>

      {/* ───── SERVICES ───── */}
      <section className="py-24 px-10 md:px-20 max-w-7xl mx-auto">
        <div className="mb-14">
          <p className="text-[#00adef] text-xs font-bold uppercase tracking-[0.3em] mb-3">What We Offer</p>
          <h2 className="text-4xl md:text-5xl font-black uppercase mb-4">Our Services.</h2>
          <p className="text-gray-400 max-w-xl">From routine maintenance to complex repairs, our certified team handles everything with precision and care.</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {SERVICES.map((s, i) => (
            <div
              key={i}
              className="group p-8 bg-[#111] border border-white/8 hover:border-[#00adef]/40 transition-all duration-300 hover:bg-[#111]/80"
              style={{ borderRadius: '0' }}
            >
              <span className="text-3xl mb-4 block">{s.icon}</span>
              <h3 className="text-base font-black uppercase tracking-wider text-white mb-3 group-hover:text-[#00adef] transition-colors">{s.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
        <div className="mt-10 text-center">
          <Link to="/schedule-service" className="btn-primary">Book a Service</Link>
        </div>
      </section>

      {/* ───── WHY CHOOSE US ───── */}
      <section className="py-24 px-10 md:px-20 bg-[#0a0a0a] border-t border-white/8">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div>
            <p className="text-[#00adef] text-xs font-bold uppercase tracking-[0.3em] mb-3">Why AutoX</p>
            <h2 className="text-4xl md:text-5xl font-black uppercase mb-6">The AutoX<br />Difference.</h2>
            <p className="text-gray-400 leading-relaxed mb-10">
              We are not just a dealership — we are your long-term automotive partner. From the moment you browse our inventory to every service visit, we ensure an exceptional experience.
            </p>
            <Link to="/inventory" className="btn-outline-dark">Explore Inventory</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {WHY_US.map((w, i) => (
              <div key={i} className="p-6 border border-white/8 bg-[#111]" style={{ borderRadius: '0' }}>
                <div className="w-8 h-0.5 bg-[#00adef] mb-4" />
                <h4 className="text-sm font-black uppercase tracking-wider text-white mb-2">{w.title}</h4>
                <p className="text-xs text-gray-500 leading-relaxed">{w.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── PROCESS ───── */}
      <section className="py-24 px-10 md:px-20 max-w-7xl mx-auto">
        <div className="mb-14 text-center">
          <p className="text-[#00adef] text-xs font-bold uppercase tracking-[0.3em] mb-3">Simple Steps</p>
          <h2 className="text-4xl md:text-5xl font-black uppercase">How It Works.</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-0">
          {[
            { step: '01', title: 'Browse', desc: 'Explore our premium inventory of luxury vehicles filtered by brand, type, or fuel.' },
            { step: '02', title: 'Book', desc: 'Schedule a test drive or reserve a vehicle in seconds from your dashboard.' },
            { step: '03', title: 'Experience', desc: 'Visit our showroom or have our executive contact you for a personalised session.' },
            { step: '04', title: 'Own', desc: 'Complete the paperwork, drive away in your dream car. We handle the rest.' },
          ].map((p, i) => (
            <div key={i} className="relative p-8 border border-white/8 bg-[#0d0d0d] border-l-0 first:border-l" style={{ borderRadius: '0' }}>
              <p className="text-5xl font-black text-white/5 mb-4 leading-none">{p.step}</p>
              <div className="w-6 h-0.5 bg-[#00adef] mb-4" />
              <h4 className="text-sm font-black uppercase tracking-wider text-white mb-2">{p.title}</h4>
              <p className="text-xs text-gray-500 leading-relaxed">{p.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ───── FINAL CTA ───── */}
      <section className="py-28 px-10 md:px-20 text-center bg-black border-t border-white/8">
        <p className="text-[#00adef] text-xs font-bold uppercase tracking-[0.3em] mb-4">Ready to Start?</p>
        <h2 className="text-4xl md:text-6xl font-black uppercase mb-6">Your Dream Car<br />Awaits.</h2>
        <p className="text-gray-400 max-w-lg mx-auto mb-10">Join over 1,200 satisfied customers who found their perfect vehicle at AutoX.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link to="/inventory" className="btn-primary">Browse Vehicles</Link>
          <Link to="/login" className="btn-outline-dark">Sign In</Link>
        </div>
      </section>

      {/* ───── FOOTER ───── */}
      <footer className="bg-[#0a0a0a] border-t border-white/8 py-10 px-10 md:px-20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div>
            <p className="text-xl font-black text-white tracking-[0.2em] uppercase">AUTO<span className="text-[#00adef]">X</span></p>
            <p className="text-xs text-gray-600 mt-1">Premium Automobile Dealership & Service</p>
          </div>
          <div className="flex gap-8 text-xs text-gray-500 uppercase tracking-widest">
            <Link to="/inventory" className="hover:text-white transition-colors">Inventory</Link>
            <Link to="/schedule-service" className="hover:text-white transition-colors">Services</Link>
            <Link to="/login" className="hover:text-white transition-colors">Login</Link>
          </div>
          <p className="text-xs text-gray-700">© {new Date().getFullYear()} AutoX. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}

/* ─── MB-style Mega Menu data ─────────────────────────── */
const NAV_ITEMS = [
  {
    label: 'Inventory',
    menu: {
      title: 'Inventory',
      sections: [
        {
          items: [{ label: 'All Vehicles', path: '/inventory' }],
        },
        {
          heading: 'By Fuel Type',
          items: [
            { label: 'Electric',  path: '/inventory?fuel=electric' },
            { label: 'Hybrid',    path: '/inventory?fuel=hybrid' },
            { label: 'Petrol',    path: '/inventory?fuel=petrol' },
            { label: 'Diesel',    path: '/inventory?fuel=diesel' },
          ],
        },
        {
          heading: 'By Category',
          items: [
            { label: 'Sedan',            path: '/inventory?type=sedan' },
            { label: 'SUV / Crossover',  path: '/inventory?type=suv' },
            { label: 'Hatchback',        path: '/inventory?type=hatchback' },
            { label: 'Coupe',            path: '/inventory?type=coupe' },
            { label: 'Convertible',      path: '/inventory?type=convertible' },
          ],
        },
      ],
    },
  },
  {
    label: 'Services',
    menu: {
      title: 'Services',
      requiresAuth: true,   // <-- ALL links in this menu need login
      sections: [
        {
          items: [{ label: 'All Services', path: '/schedule-service' }],
        },
        {
          heading: 'Maintenance',
          items: [
            { label: 'General Checkup',    path: '/schedule-service' },
            { label: 'Oil & Filter Change', path: '/schedule-service' },
            { label: 'Tyre Rotation',      path: '/schedule-service' },
            { label: 'Brake Inspection',   path: '/schedule-service' },
          ],
        },
        {
          heading: 'Repairs',
          items: [
            { label: 'Engine Tune-Up', path: '/schedule-service' },
            { label: 'A/C Service',    path: '/schedule-service' },
            { label: 'Body Repair',    path: '/schedule-service' },
          ],
        },
      ],
    },
  },
  {
    label: 'Bookings',
    path: '/my-bookings',
    requiresAuth: true,
  },
];
/* Small heart + count badge shown in the navbar */
function WishlistBadge() {
  const { wishlist } = useWishlist();
  const count = wishlist.length;
  return (
    <span className="relative inline-flex items-center">
      <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
      </svg>
      {count > 0 && (
        <span
          className="absolute -top-1.5 -right-1.5 w-3.5 h-3.5 rounded-full flex items-center justify-center text-[8px] font-black text-white"
          style={{ backgroundColor: '#ef4444', lineHeight: 1 }}
        >
          {count > 9 ? '9+' : count}
        </span>
      )}
    </span>
  );
}

function Navigation() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isLanding = location.pathname === '/';
  const [scrolled, setScrolled] = useState(false);
  const [openMenu, setOpenMenu] = useState(null); // label of open mega-menu

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // Close menu on route change
  useEffect(() => { setOpenMenu(null); }, [location.pathname]);

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/admin-dashboard';
    if (user.role === 'sales_executive') return '/sales-dashboard';
    if (user.role === 'technician') return '/technician-dashboard';
    return '/customer-dashboard';
  };

  const handleNavClick = (item) => {
    if (item.requiresAuth && !user) {
      // redirect to login, then return to intended page
      navigate('/login');
      setOpenMenu(null);
      return;
    }
    if (item.path) { navigate(item.path); setOpenMenu(null); }
    else setOpenMenu(openMenu === item.label ? null : item.label);
  };

  const navBg = isLanding && !scrolled ? 'bg-transparent' : 'bg-[#000000]';

  return (
    <>
      {/* ── Backdrop when mega-menu is open ── */}
      {openMenu && (
        <div
          className="fixed inset-0 z-40 bg-black/30 backdrop-blur-[2px]"
          onClick={() => setOpenMenu(null)}
        />
      )}

      <nav
        className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 border-b ${
          openMenu ? 'border-transparent' : 'border-white/8'
        } ${navBg}`}
      >
        <div className="flex items-stretch h-[52px]">

          {/* ── LEFT: Nav Items ─────────────────────────── */}
          <div className="flex items-stretch">
            {NAV_ITEMS.map((item) => {
              const isActive = openMenu === item.label;
              return (
                <button
                  key={item.label}
                  onClick={() => handleNavClick(item)}
                  className={`relative px-5 h-full flex items-center text-xs font-bold uppercase tracking-widest transition-colors ${
                    isActive
                      ? 'text-white bg-white/10'
                      : 'text-gray-300 hover:text-white hover:bg-white/5'
                  }`}
                  style={{
                    borderBottom: isActive ? '2px solid #00adef' : '2px solid transparent',
                  }}
                >
                  {item.label}
                </button>
              );
            })}
          </div>

          {/* ── CENTER: Brand Logo ───────────────────────── */}
          <div className="flex-1 flex items-center justify-center">
            <Link
              to="/"
              onClick={() => setOpenMenu(null)}
              className="flex flex-col items-center gap-0.5 group"
            >
              {/* Mercedes-star SVG style ring */}
              <div
                className="w-9 h-9 rounded-full border-2 border-white/60 group-hover:border-[#00adef] transition-colors flex items-center justify-center"
              >
                {/* 3-pointed star */}
                <svg viewBox="0 0 24 24" className="w-5 h-5" fill="white">
                  <path d="M12 2 L14.2 9.5 L22 9.5 L16 14.5 L18.2 22 L12 17.5 L5.8 22 L8 14.5 L2 9.5 L9.8 9.5 Z" />
                </svg>
              </div>
              <span className="text-[9px] font-black text-white tracking-[0.2em] uppercase opacity-80 group-hover:opacity-100 group-hover:text-[#00adef] transition-colors">
                AutoX
              </span>
            </Link>
          </div>

          {/* ── RIGHT: Icons + Login ─────────────────────── */}
          <div className="flex items-center">
            {/* Search icon */}
            <button
              className="px-4 h-full flex items-center text-gray-400 hover:text-white transition-colors"
              title="Search"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
              </svg>
            </button>

            {/* Wishlist icon with count badge */}
            <button
              onClick={() => {
                if (!user) { navigate('/login'); return; }
                navigate('/wishlist');
                setOpenMenu(null);
              }}
              className="px-4 h-full flex items-center relative text-gray-400 hover:text-white transition-colors"
              title={user ? 'My Wishlist' : 'Login to use Wishlist'}
            >
              <WishlistBadge />
            </button>

            {/* Vertical divider */}
            <div className="w-px h-6 bg-white/15 mx-1" />

            {/* User / Login */}
            {user ? (
              <div className="flex items-center h-full">
                <Link
                  to={getDashboardPath()}
                  className="px-4 h-full flex flex-col items-center justify-center text-right hover:bg-white/5 transition-colors"
                >
                  <span className="text-[9px] text-gray-500 uppercase tracking-wider leading-none">
                    {user.role?.replace('_', ' ')}
                  </span>
                  <span className="text-xs font-bold text-white leading-none mt-0.5 max-w-[90px] truncate">
                    {user.name}
                  </span>
                </Link>
                <button
                  onClick={() => { logout(); navigate('/'); setOpenMenu(null); }}
                  className="px-4 h-full flex items-center text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-white transition-colors border-l border-white/8"
                >
                  Logout
                </button>
              </div>
            ) : (
              <Link
                to="/login"
                className="px-5 h-full flex flex-col items-center justify-center hover:bg-white/5 transition-colors border-l border-white/8"
              >
                <svg className="w-4 h-4 text-gray-400 mb-0.5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
                <span className="text-[10px] font-bold text-white uppercase tracking-wider">Login</span>
              </Link>
            )}
          </div>
        </div>

        {/* ── MEGA MENU DRAWER ──────────────────────────────── */}
        {NAV_ITEMS.map((item) => {
          if (!item.menu || openMenu !== item.label) return null;
          return (
            <div
              key={item.label}
              className="absolute top-full left-0 z-50 w-80 bg-white shadow-2xl overflow-y-auto animate-[slideDown_0.2s_ease-out]"
              style={{ maxHeight: 'calc(100vh - 52px)' }}
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-7 py-6 border-b border-gray-100">
                <h2 className="text-2xl font-light text-gray-900">{item.menu.title}</h2>
                <button
                  onClick={() => setOpenMenu(null)}
                  className="text-gray-400 hover:text-gray-900 transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" d="M6 18 18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Drawer sections */}
              <div className="px-7 py-4">
                {item.menu.sections.map((section, si) => (
                  <div key={si} className={si > 0 ? 'mt-5 pt-5 border-t border-gray-100' : ''}>
                    {section.heading && (
                      <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-3">
                        {section.heading}
                      </p>
                    )}
                    {section.items.map((link, li) => {
                      // For menus that require auth, clicking without login → redirect
                      const needsAuth = item.menu?.requiresAuth && !user;
                      return needsAuth ? (
                        <button
                          key={li}
                          onClick={() => { setOpenMenu(null); navigate('/login'); }}
                          className="block w-full text-left py-2 text-sm text-gray-400 hover:text-[#00adef] transition-colors font-light"
                        >
                          {link.label}
                          <span className="ml-2 text-[9px] text-gray-400 uppercase tracking-wider border border-gray-300 px-1">Login required</span>
                        </button>
                      ) : (
                        <Link
                          key={li}
                          to={link.path}
                          onClick={() => setOpenMenu(null)}
                          className="block py-2 text-sm text-gray-700 hover:text-[#00adef] transition-colors font-light"
                        >
                          {link.label}
                        </Link>
                      );
                    })}
                  </div>
                ))}
              </div>

              {/* Bottom CTA — Book a Service (requires login) */}
              <div className="mx-7 mb-6 mt-2">
                {user ? (
                  <Link
                    to="/schedule-service"
                    onClick={() => setOpenMenu(null)}
                    className="w-full flex items-center justify-between px-5 py-3 bg-[#00adef] hover:bg-[#007ab8] transition-colors text-sm font-bold text-white uppercase tracking-widest"
                  >
                    <span>Book a Service</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                      <path strokeLinecap="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                    </svg>
                  </Link>
                ) : (
                  <button
                    onClick={() => { setOpenMenu(null); navigate('/login'); }}
                    className="w-full flex items-center justify-between px-5 py-3 bg-[#f0f0f0] hover:bg-[#e0e0e0] transition-colors text-sm font-semibold text-gray-700"
                  >
                    <span>Book a Service</span>
                    <span className="text-[10px] font-bold uppercase tracking-widest text-[#00adef] border border-[#00adef]/40 px-2 py-0.5">Login First</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </nav>
    </>
  );
}


function PlaceholderPage({ title }) {
  return (
    <div className="flex items-center justify-center min-h-[80vh]">
      <div className="glass-card p-12 text-center w-full max-w-2xl">
        <h2 className="text-3xl font-bold text-white mb-4">{title}</h2>
        <p className="text-gray-400 mb-8">Coming soon...</p>
        <Link to="/" className="btn-primary">Back to Home</Link>
      </div>
    </div>
  );
}

function AppContent() {
  const location = useLocation();
  const isLanding = location.pathname === '/';

  return (
    <>
      {!isLanding && <Scene3D />}
      <div className="relative z-10 font-sans">
        <Navigation />
        <Layout>
          <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/inventory" element={<Inventory />} />
            <Route path="/admin-dashboard" element={<AdminDashboard />} />
            <Route path="/customer-dashboard" element={<CustomerDashboard />} />
            <Route path="/sales-dashboard" element={<SalesDashboard />} />
            <Route path="/technician-dashboard" element={<TechnicianDashboard />} />
            <Route path="/my-bookings" element={<MyBookings />} />
            <Route path="/schedule-service" element={<ScheduleService />} />
            <Route path="/reports" element={<SystemReports />} />
            <Route path="/manage-inventory" element={<ManageInventory />} />
            <Route path="/wishlist" element={<Wishlist />} />
            <Route path="/profile" element={<CustomerProfile />} />
          </Routes>
        </Layout>
      </div>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <WishlistProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </WishlistProvider>
    </AuthProvider>
  );
}

export default App;

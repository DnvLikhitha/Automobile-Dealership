import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Car, Wrench, User, Loader2 } from 'lucide-react';

// ⚠️  DEV-ONLY: Quick-login helpers. Never shown in production.
// These credentials are for local development and grading demos only.
const DEV_LOGINS = [
  { role: 'admin',           label: 'Admin',      email: 'admin@autox.com',    icon: ShieldCheck },
  { role: 'sales_executive', label: 'Sales',      email: 'sales@autox.com',    icon: Car },
  { role: 'technician',      label: 'Technician', email: 'tech@autox.com',     icon: Wrench },
  { role: 'customer',        label: 'Customer',   email: 'customer@autox.com', icon: User },
];

export default function Login() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState('customer');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDevPanel, setShowDevPanel] = useState(false);  // collapsed by default

  const { login, register } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      let userData;
      if (isLogin) {
        userData = await login(email, password);
      } else {
        userData = await register(name, email, password, role);
      }
      if (userData.role === 'admin') navigate('/admin-dashboard');
      else if (userData.role === 'sales_executive') navigate('/sales-dashboard');
      else if (userData.role === 'technician') navigate('/technician-dashboard');
      else navigate('/customer-dashboard');
    } catch (err) {
      setError(err.response?.data?.detail || 'An error occurred during authentication.');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = (item) => {
    setEmail(item.email);
    setPassword('password123');
    setError('');
    setShowDevPanel(false);
  };

  const inputCls = 'w-full bg-[#111] border border-white/10 px-4 py-3 text-white text-sm focus:outline-none focus:border-[#00adef] transition-colors placeholder:text-gray-600';

  return (
    <div className="flex justify-center items-center min-h-[82vh] py-8 px-4">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[#00adef] text-xs font-bold uppercase tracking-[0.3em] mb-2">
            {isLogin ? 'Welcome Back' : 'New Account'}
          </p>
          <h1 className="text-4xl font-black text-white uppercase tracking-tight">
            {isLogin ? 'Sign In.' : 'Register.'}
          </h1>
          <p className="text-gray-500 text-sm mt-2">
            {isLogin ? 'Access your AutoX portal' : 'Join our premium platform'}
          </p>
        </div>

        {/* Main Card */}
        <div className="bg-[#111111] border border-white/8 p-8">
          {error && (
            <div className="mb-5 p-3 bg-red-500/10 border border-red-500/30 text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* ── DEV-ONLY credential helper ── */}
          {import.meta.env.DEV && (
            <div className="mb-5 border border-yellow-500/30 bg-yellow-500/5">
              <button
                type="button"
                onClick={() => setShowDevPanel(p => !p)}
                className="w-full flex items-center justify-between px-4 py-2.5 text-left"
              >
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-yellow-500/80">
                  🛠 Dev Quick-Login
                </span>
                <span className="text-yellow-500/60 text-xs">{showDevPanel ? '▲ hide' : '▼ show'}</span>
              </button>
              {showDevPanel && (
                <div className="px-4 pb-4 grid grid-cols-2 gap-2">
                  {DEV_LOGINS.map((item) => {
                    const Icon = item.icon;
                    const isSelected = email === item.email;
                    return (
                      <button
                        key={item.role}
                        type="button"
                        onClick={() => handleQuickLogin(item)}
                        className="flex items-center gap-2 p-2.5 text-left border text-xs font-bold uppercase tracking-wider transition-all"
                        style={{
                          borderColor: isSelected ? '#00adef' : 'rgba(234,179,8,0.2)',
                          backgroundColor: isSelected ? 'rgba(0,173,239,0.1)' : '#0d0d0d',
                          color: isSelected ? '#00adef' : '#a0a0a0',
                        }}
                      >
                        <Icon size={14} />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-1.5">Full Name</label>
                <input
                  type="text" required value={name}
                  onChange={(e) => setName(e.target.value)}
                  className={inputCls} placeholder="John Doe"
                />
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-1.5">Role</label>
                <select
                  value={role} onChange={(e) => setRole(e.target.value)}
                  className={inputCls} style={{ appearance: 'none' }}
                >
                  <option value="customer" className="bg-[#111]">Customer</option>
                  <option value="admin" className="bg-[#111]">Admin</option>
                  <option value="sales_executive" className="bg-[#111]">Sales Executive</option>
                  <option value="technician" className="bg-[#111]">Technician</option>
                </select>
              </div>
            )}

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-1.5">Email</label>
              <input
                type="email" required value={email}
                onChange={(e) => setEmail(e.target.value)}
                className={inputCls} placeholder="name@example.com"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 mb-1.5">Password</label>
              <input
                type="password" required value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={inputCls} placeholder="••••••••"
              />
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full py-3.5 text-sm font-bold uppercase tracking-widest transition-colors flex justify-center items-center gap-2 disabled:opacity-60 mt-2"
              style={{ backgroundColor: '#00adef', color: '#fff' }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.backgroundColor = '#007ab8'; }}
              onMouseLeave={e => e.currentTarget.style.backgroundColor = '#00adef'}
            >
              {loading ? <Loader2 className="animate-spin" size={18} /> : (isLogin ? 'Sign In' : 'Create Account')}
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-white/8 text-center">
            <p className="text-gray-600 text-xs">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <button
                onClick={() => { setIsLogin(!isLogin); setError(''); }}
                className="text-[#00adef] hover:underline font-bold"
              >
                {isLogin ? 'Register' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

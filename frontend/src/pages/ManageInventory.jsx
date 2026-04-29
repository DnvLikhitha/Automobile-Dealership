import { useState, useEffect } from 'react';
import api from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Loader2, Plus, Pencil, Trash2, X, Save, Car,
  Search, Filter
} from 'lucide-react';

const VEHICLE_TYPES = ['sedan', 'suv', 'hatchback', 'truck', 'coupe', 'convertible', 'van', 'electric'];
const FUEL_TYPES = ['petrol', 'diesel', 'electric', 'hybrid', 'cng'];
const TRANSMISSIONS = ['manual', 'automatic'];
const AVAILABILITY = ['available', 'reserved', 'sold'];

const emptyForm = {
  make: '', model: '', year: new Date().getFullYear(), price: '',
  type: 'sedan', color: '', mileage: 0, fuel_type: 'petrol',
  transmission: 'automatic', image_url: '', description: '', availability: 'available'
};

export default function ManageInventory() {
  const { user } = useAuth();
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(null);
  const [search, setSearch] = useState('');
  const [error, setError] = useState('');

  useEffect(() => { fetchVehicles(); }, []);

  const fetchVehicles = async () => {
    try {
      const res = await api.get('/api/vehicles');
      setVehicles(res.data);
    } catch (err) {
      console.error('Failed to fetch vehicles', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    try {
      const payload = { ...form, price: parseFloat(form.price), year: parseInt(form.year), mileage: parseInt(form.mileage) || 0 };
      if (editingId) {
        await api.put(`/api/vehicles/${editingId}`, payload);
      } else {
        const { availability, ...createPayload } = payload;
        await api.post('/api/vehicles', createPayload);
      }
      await fetchVehicles();
      resetForm();
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save vehicle');
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (v) => {
    setForm({
      make: v.make, model: v.model, year: v.year, price: v.price,
      type: v.type, color: v.color || '', mileage: v.mileage || 0,
      fuel_type: v.fuel_type || 'petrol', transmission: v.transmission || 'automatic',
      image_url: v.image_url || '', description: v.description || '',
      availability: v.availability || 'available'
    });
    setEditingId(v.vehicle_id);
    setShowForm(true);
    setError('');
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this vehicle?')) return;
    setDeleting(id);
    try {
      await api.delete(`/api/vehicles/${id}`);
      await fetchVehicles();
    } catch (err) {
      alert(err.response?.data?.detail || 'Failed to delete');
    } finally {
      setDeleting(null);
    }
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setShowForm(false);
    setError('');
  };

  const filtered = vehicles.filter(v =>
    `${v.make} ${v.model}`.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex justify-center items-center h-64"><Loader2 className="animate-spin text-primary" size={48} /></div>;

  return (
    <div className="space-y-6 animate-[fadeIn_0.5s_ease-out]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-4xl font-extrabold text-white mb-1">
            Manage <span className="text-gradient">Inventory</span>
          </h1>
          <p className="text-gray-400">{vehicles.length} vehicles in stock</p>
        </div>
        <button
          onClick={() => { resetForm(); setShowForm(true); }}
          className="flex items-center gap-2 px-5 py-3 bg-primary text-black font-bold rounded-xl hover:bg-primary-dark transition-colors"
        >
          <Plus size={18} /> Add Vehicle
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500" />
        <input
          type="text"
          placeholder="Search vehicles..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-white/5 border border-white/10 rounded-xl pl-11 pr-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-primary"
        />
      </div>

      {/* Add/Edit Form Modal */}
      {showForm && (
        <div className="glass-card p-6 border border-primary/30">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-xl font-bold text-white">
              {editingId ? 'Edit Vehicle' : 'Add New Vehicle'}
            </h3>
            <button onClick={resetForm} className="text-gray-400 hover:text-white"><X size={20} /></button>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200 text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Make *</label>
              <input required value={form.make} onChange={e => setForm({...form, make: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. Tesla" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Model *</label>
              <input required value={form.model} onChange={e => setForm({...form, model: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="e.g. Model S" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Year *</label>
              <input required type="number" min="1900" max="2030" value={form.year} onChange={e => setForm({...form, year: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Price (₹) *</label>
              <input required type="number" step="0.01" min="0" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="85000" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Type *</label>
              <select value={form.type} onChange={e => setForm({...form, type: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                {VEHICLE_TYPES.map(t => <option key={t} value={t} className="bg-gray-900 text-white">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Color</label>
              <input value={form.color} onChange={e => setForm({...form, color: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="Midnight Silver" />
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Fuel Type</label>
              <select value={form.fuel_type} onChange={e => setForm({...form, fuel_type: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                {FUEL_TYPES.map(f => <option key={f} value={f} className="bg-gray-900 text-white">{f.charAt(0).toUpperCase() + f.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Transmission</label>
              <select value={form.transmission} onChange={e => setForm({...form, transmission: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                {TRANSMISSIONS.map(t => <option key={t} value={t} className="bg-gray-900 text-white">{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Mileage</label>
              <input type="number" min="0" value={form.mileage} onChange={e => setForm({...form, mileage: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary" />
            </div>
            {editingId && (
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Availability</label>
                <select value={form.availability} onChange={e => setForm({...form, availability: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary">
                  {AVAILABILITY.map(a => <option key={a} value={a} className="bg-gray-900 text-white">{a.charAt(0).toUpperCase() + a.slice(1)}</option>)}
                </select>
              </div>
            )}
            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Image URL</label>
              <input value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary"
                placeholder="https://images.unsplash.com/..." />
            </div>
            <div className="sm:col-span-2 lg:col-span-3">
              <label className="block text-xs font-bold text-gray-400 uppercase mb-1">Description</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})} rows={2}
                className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2.5 text-white text-sm focus:outline-none focus:ring-2 focus:ring-primary resize-none"
                placeholder="Optional vehicle description..." />
            </div>
            <div className="sm:col-span-2 lg:col-span-3 flex gap-3">
              <button type="submit" disabled={saving}
                className="flex items-center gap-2 px-6 py-2.5 bg-primary text-black font-bold rounded-lg hover:bg-primary-dark transition-colors disabled:opacity-50">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                {editingId ? 'Update Vehicle' : 'Add Vehicle'}
              </button>
              <button type="button" onClick={resetForm}
                className="px-6 py-2.5 bg-white/5 border border-white/10 text-gray-300 rounded-lg hover:bg-white/10 transition-colors">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Vehicles Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10 text-left">
                <th className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Vehicle</th>
                <th className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Details</th>
                <th className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Price</th>
                <th className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                <th className="px-5 py-3 text-xs font-bold text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(v => {
                const statusColor = v.availability === 'available' ? 'bg-green-500/20 text-green-400'
                  : v.availability === 'reserved' ? 'bg-yellow-500/20 text-yellow-400'
                  : 'bg-red-500/20 text-red-400';
                return (
                  <tr key={v.vehicle_id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-3">
                        {v.image_url ? (
                          <img src={v.image_url} alt="" className="w-14 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-14 h-10 rounded-lg bg-white/5 flex items-center justify-center text-lg">🚗</div>
                        )}
                        <div>
                          <p className="text-sm font-bold text-white">{v.make} {v.model}</p>
                          <p className="text-xs text-gray-500">{v.year} · {v.color || '—'}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 text-xs text-gray-400">
                      <span className="capitalize">{v.type}</span> · {v.fuel_type || '—'} · {v.transmission || '—'}
                    </td>
                    <td className="px-5 py-3 text-sm font-bold text-primary">₹{Number(v.price).toLocaleString()}</td>
                    <td className="px-5 py-3">
                      <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase ${statusColor}`}>
                        {v.availability}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <div className="flex gap-2 justify-end">
                        <button onClick={() => handleEdit(v)}
                          className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-white/10 text-gray-400 hover:text-primary transition-colors">
                          <Pencil size={14} />
                        </button>
                        {user?.role === 'admin' && (
                          <button onClick={() => handleDelete(v.vehicle_id)} disabled={deleting === v.vehicle_id}
                            className="p-2 bg-white/5 border border-white/10 rounded-lg hover:bg-red-500/10 text-gray-400 hover:text-red-400 transition-colors disabled:opacity-50">
                            {deleting === v.vehicle_id ? <Loader2 size={14} className="animate-spin" /> : <Trash2 size={14} />}
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filtered.length === 0 && (
          <div className="p-12 text-center text-gray-500 italic">No vehicles found.</div>
        )}
      </div>
    </div>
  );
}

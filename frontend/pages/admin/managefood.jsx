import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { HiPencil, HiTrash } from 'react-icons/hi';
import Topbar from './components/topbar';
import { API_URL } from '../../components/api';
import { confirmDelete, showSuccess } from '../../components/alert';

// Noto Sans Tamil — loaded once when this module is imported
if (typeof document !== 'undefined' && !document.getElementById('noto-tamil-font')) {
  const link = document.createElement('link');
  link.id = 'noto-tamil-font';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;700;900&display=swap';
  document.head.appendChild(link);
}

const EMPTY_FORM = {
  nameEnglish: '', nameTamil: '', price: '', quantity: '', category: '', varieties: []
};

// ── Auto-translate via your own backend (avoids CORS) ────────────────────────
async function translateToTamil(englishName) {
  const response = await fetch(`${API_URL}/api/admin/food/translate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: englishName.trim() })
  });
  if (!response.ok) throw new Error('Translation request failed');
  const data = await response.json();
  if (!data.tamil) throw new Error('Empty translation response');
  return data.tamil;
}

export default function ManageFood() {
  const [foods, setFoods]           = useState([]);
  const [categories, setCategories] = useState([]);
  const [varieties, setVarieties]   = useState([]);
  const [formData, setFormData]     = useState(EMPTY_FORM);
  const [editId, setEditId]         = useState(null);
  const [translating, setTranslating] = useState(false);

  // Debounce ref — cancel pending translation if user keeps typing
  const debounceRef = useRef(null);

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [foodRes, catRes, varRes] = await Promise.all([
        axios.get(`${API_URL}/api/admin/food`),
        axios.get(`${API_URL}/api/admin/category`),
        axios.get(`${API_URL}/api/admin/variety`)
      ]);
      setFoods(foodRes.data);
      setCategories(catRes.data);
      setVarieties(varRes.data);
    } catch (err) { toast.error('Failed to load data'); }
  };

  // ── Handle English name input: update state + debounce translation ──────────
  const handleNameChange = useCallback((e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, nameEnglish: value, nameTamil: '' }));

    // Clear any pending translation
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) { setTranslating(false); return; }

    // Wait 600ms after user stops typing before calling API
    debounceRef.current = setTimeout(async () => {
      setTranslating(true);
      try {
        const tamil = await translateToTamil(value);
        setFormData(prev => ({ ...prev, nameTamil: tamil }));
      } catch (err) {
        toast.error('Translation failed — you can type it manually');
      } finally {
        setTranslating(false);
      }
    }, 600);
  }, []);

  const handleVarietyToggle = (id) => {
    setFormData(prev => ({
      ...prev,
      varieties: prev.varieties.includes(id)
        ? prev.varieties.filter(v => v !== id)
        : [...prev.varieties, id]
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nameTamil.trim()) {
      toast.error('Waiting for Tamil translation — please try again in a moment');
      return;
    }
    try {
      if (editId) {
        await axios.put(`${API_URL}/api/admin/food/update/${editId}`, formData);
        toast.success('Food item updated');
      } else {
        await axios.post(`${API_URL}/api/admin/food/add`, formData);
        toast.success('Food item added');
      }
      resetForm();
      fetchData();
    } catch (err) { toast.error('Operation failed'); }
  };

  const resetForm = () => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setFormData(EMPTY_FORM);
    setEditId(null);
    setTranslating(false);
  };

  const handleDelete = async (id) => {
    if (await confirmDelete('Delete Food Item?', 'This will remove the item from the menu.')) {
      try {
        await axios.delete(`${API_URL}/api/admin/food/delete/${id}`);
        showSuccess('Deleted!', 'Item removed.');
        fetchData();
      } catch (err) { toast.error('Delete failed'); }
    }
  };

  const handleEditClick = (food) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    setEditId(food._id);
    setFormData({
      nameEnglish: food.nameEnglish || '',
      nameTamil:   food.nameTamil   || '',
      price:       food.price,
      quantity:    food.quantity,
      category:    food.category?._id || '',
      varieties:   food.varieties.map(v => v._id || v)
    });
    setTranslating(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const inputCls = 'w-full border-2 border-gray-100 px-4 py-2 rounded-sm outline-none focus:border-brand-primary';

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />
      <div className="max-w-6xl mx-auto p-8">
        <h2 className="text-2xl font-black text-brand-primary uppercase tracking-tighter mb-8">
          Manage Food Items
        </h2>

        {/* ── Entry Form ───────────────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="bg-brand-white p-8 rounded-sm shadow-sm border border-gray-100 mb-10">

          {/* Row 1: Food Name (single field) + Price + Quantity */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* Food Name — with auto-translate preview */}
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                Food Name
              </label>
              <input
                type="text"
                className={inputCls}
                placeholder="e.g. Idli"
                value={formData.nameEnglish}
                onChange={handleNameChange}
                required
              />
              {/* Tamil translation preview — shown below the input */}
              <div className="mt-1.5 min-h-[20px] flex items-center gap-1.5">
                {translating ? (
                  <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest animate-pulse">
                    Translating…
                  </span>
                ) : formData.nameTamil ? (
                  <>
                    <span
                      lang="ta"
                      style={{ fontFamily: "'Noto Sans Tamil', sans-serif" }}
                      className="text-[13px] font-bold text-brand-primary leading-tight"
                    >
                      {formData.nameTamil}
                    </span>
                    {/* Allow manual correction */}
                    <button
                      type="button"
                      className="text-[9px] text-gray-300 uppercase font-bold hover:text-gray-400 cursor-pointer ml-auto"
                      onClick={() => setFormData(prev => ({ ...prev, nameTamil: '' }))}
                      title="Clear Tamil name"
                    >
                      ✕ clear
                    </button>
                  </>
                ) : formData.nameEnglish ? (
                  <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">
                    Type to translate…
                  </span>
                ) : null}
              </div>
              {/* Hidden editable fallback — lets user correct Tamil if needed */}
              {!translating && formData.nameTamil === '' && formData.nameEnglish && (
                <input
                  type="text"
                  lang="ta"
                  style={{ fontFamily: "'Noto Sans Tamil', sans-serif" }}
                  className={`${inputCls} mt-2 text-sm`}
                  placeholder="Tamil name (type manually if needed)"
                  value={formData.nameTamil}
                  onChange={(e) => setFormData(prev => ({ ...prev, nameTamil: e.target.value }))}
                />
              )}
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Price</label>
              <input type="number" className={inputCls} value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Quantity</label>
              <input type="text" className={inputCls} value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} required />
            </div>
          </div>

          {/* Row 2: Category + Varieties */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Category</label>
              <select className={`${inputCls} cursor-pointer`} value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Varieties</label>
              <div className="flex flex-wrap gap-2">
                {varieties.map(v => (
                  <button key={v._id} type="button" onClick={() => handleVarietyToggle(v._id)}
                    className={`px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase cursor-pointer transition-all border ${formData.varieties.includes(v._id) ? 'bg-brand-primary text-white border-brand-primary' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Submit */}
          <div className="mt-8 flex gap-4 items-center">
            <button type="submit"
              disabled={translating}
              className="bg-brand-primary text-brand-white px-10 py-3 rounded-sm font-black text-[11px] uppercase tracking-[0.2em] cursor-pointer hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-wait">
              {editId ? 'Update Item' : 'Add Food Item'}
            </button>
            {editId && (
              <button type="button" onClick={resetForm} className="text-gray-400 font-bold text-[11px] uppercase cursor-pointer hover:text-gray-600">
                Cancel
              </button>
            )}
          </div>
        </form>

        {/* ── Food Table ───────────────────────────────────────────────────── */}
        <div className="bg-brand-white rounded-sm shadow-sm overflow-hidden border border-gray-100">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-[10px] font-black uppercase tracking-widest text-brand-primary">
              <tr>
                <th className="px-6 py-4">Item Details</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Varieties</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {foods.map((food) => (
                <tr key={food._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <span className="bg-brand-primary/10 text-brand-primary text-[10px] font-black px-2 py-1 rounded-sm border border-brand-primary/20 shrink-0">
                        #{food.itemcode}
                      </span>
                      <div>
                        {/* Primary: Tamil */}
                        <p lang="ta" style={{ fontFamily: "'Noto Sans Tamil', sans-serif" }}
                          className="font-black text-brand-primary text-sm leading-tight">
                          {food.nameTamil || '—'}
                        </p>
                        {/* Secondary: English + price + qty */}
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">
                          {food.nameEnglish} • ₹{food.price} • {food.quantity}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-[9px] font-bold bg-gray-100 text-brand-primary px-2 py-1 rounded-sm uppercase tracking-tighter border border-gray-200">
                      {food.category?.name || 'No Category'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1 max-w-[200px]">
                      {food.varieties?.map(v => (
                        <span key={v._id} className="text-[8px] font-bold text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded-sm uppercase bg-white">
                          {v.name}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button onClick={() => handleEditClick(food)} className="text-blue-600 cursor-pointer p-2 hover:bg-blue-50 rounded-sm transition-all"><HiPencil /></button>
                      <button onClick={() => handleDelete(food._id)} className="text-red-600 cursor-pointer p-2 hover:bg-red-50 rounded-sm transition-all"><HiTrash /></button>
                    </div>
                  </td>
                </tr>
              ))}
              {foods.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-300 text-sm font-bold uppercase tracking-widest">
                    No food items yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}
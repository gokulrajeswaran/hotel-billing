import React, { useState, useEffect, useRef, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { HiPencil, HiTrash, HiSearch, HiX } from 'react-icons/hi';
import Topbar from '../components/topbar';
import { API_URL } from '../../../components/api';
import { confirmDelete, showSuccess } from '../../../components/alert';

if (typeof document !== 'undefined' && !document.getElementById('noto-tamil-font')) {
  const link = document.createElement('link');
  link.id = 'noto-tamil-font';
  link.rel = 'stylesheet';
  link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;700;900&display=swap';
  document.head.appendChild(link);
}

const EMPTY_FORM = {
  itemcode: '', nameEnglish: '', nameTamil: '', price: '', quantity: '', category: '',
  varieties: [], varietyPrices: []
};

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
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [varieties, setVarieties] = useState([]);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [editId, setEditId] = useState(null);
  const [translating, setTranslating] = useState(false);

  // Search / filter state
  const [filterCategory, setFilterCategory] = useState('');
  const [filterVariety, setFilterVariety] = useState('');
  const [filterSearch, setFilterSearch] = useState('');

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

  const handleNameChange = useCallback((e) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, nameEnglish: value, nameTamil: '' }));
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!value.trim()) { setTranslating(false); return; }
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

  // Toggle variety selection and manage varietyPrices array in sync
  const handleVarietyToggle = (id) => {
    setFormData(prev => {
      const isSelected = prev.varieties.includes(id);
      if (isSelected) {
        return {
          ...prev,
          varieties: prev.varieties.filter(v => v !== id),
          varietyPrices: prev.varietyPrices.filter(vp => vp.variety !== id)
        };
      } else {
        return {
          ...prev,
          varieties: [...prev.varieties, id],
          varietyPrices: [...prev.varietyPrices, { variety: id, price: '' }]
        };
      }
    });
  };

  // Update price for a specific variety
  const handleVarietyPriceChange = (varietyId, value) => {
    setFormData(prev => ({
      ...prev,
      varietyPrices: prev.varietyPrices.map(vp =>
        vp.variety === varietyId ? { ...vp, price: value } : vp
      )
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.nameTamil.trim()) {
      toast.error('Waiting for Tamil translation — please try again in a moment');
      return;
    }
    // Validate all selected varieties have a price
    for (const vp of formData.varietyPrices) {
      if (vp.price === '' || vp.price === null || isNaN(Number(vp.price))) {
        const vName = varieties.find(v => v._id === vp.variety)?.name || 'a variety';
        toast.error(`Please enter a price for variety: ${vName}`);
        return;
      }
    }
    try {
      const payload = {
        ...formData,
        varietyPrices: formData.varietyPrices.map(vp => ({
          variety: vp.variety,
          price: Number(vp.price)
        }))
      };
      if (editId) {
        await axios.put(`${API_URL}/api/admin/food/update/${editId}`, payload);
        toast.success('Food item updated');
      } else {
        await axios.post(`${API_URL}/api/admin/food/add`, payload);
        toast.success('Food item added');
      }
      resetForm();
      fetchData();
    } catch (err) { toast.error(err.response?.data?.message || 'Operation failed'); }
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

    // Rebuild varietyPrices from populated data
    const vpMap = {};
    (food.varietyPrices || []).forEach(vp => {
      const vid = vp.variety?._id || vp.variety;
      vpMap[vid] = vp.price;
    });
    const varietyIds = food.varieties.map(v => v._id || v);
    const varietyPrices = varietyIds.map(vid => ({
      variety: vid,
      price: vpMap[vid] !== undefined ? vpMap[vid] : ''
    }));

    setFormData({
      itemcode: food.itemcode || '',
      nameEnglish: food.nameEnglish || '',
      nameTamil: food.nameTamil || '',
      price: food.price,
      quantity: food.quantity,
      category: food.category?._id || '',
      varieties: varietyIds,
      varietyPrices
    });
    setTranslating(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Filtered foods for the table
  const filteredFoods = foods.filter(food => {
    const matchesSearch = !filterSearch ||
      food.nameEnglish?.toLowerCase().includes(filterSearch.toLowerCase()) ||
      food.nameTamil?.includes(filterSearch) ||
      String(food.itemcode).includes(filterSearch);
    const matchesCategory = !filterCategory || food.category?._id === filterCategory;
    const matchesVariety = !filterVariety ||
      food.varieties?.some(v => (v._id || v) === filterVariety);
    return matchesSearch && matchesCategory && matchesVariety;
  });

  const inputCls = 'w-full border-2 border-gray-100 px-4 py-2 rounded-sm outline-none focus:border-brand-primary';

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />
      <div className="max-w-6xl mx-auto p-8">
        <h2 className="text-2xl font-black text-brand-primary uppercase tracking-tighter mb-8">
          Manage Food Items
        </h2>

        {/* ── Entry Form ── */}
        <form onSubmit={handleSubmit} className="bg-brand-white p-8 rounded-sm shadow-sm border border-gray-100 mb-10">

          {/* Row 1 */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                Item Code <span className="text-red-400">*</span>
              </label>
              <input type="text" className={inputCls} placeholder="e.g. 101"
                value={formData.itemcode}
                onChange={(e) => setFormData({ ...formData, itemcode: e.target.value })}
                required disabled={!!editId} />
              {editId && <p className="text-[9px] text-gray-300 font-bold uppercase mt-1">Code cannot be changed</p>}
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Food Name</label>
              <input type="text" className={inputCls} placeholder="e.g. Idli"
                value={formData.nameEnglish} onChange={handleNameChange} required />
              <div className="mt-1.5 min-h-[20px] flex items-center gap-1.5">
                {translating ? (
                  <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest animate-pulse">Translating…</span>
                ) : formData.nameTamil ? (
                  <>
                    <span lang="ta" style={{ fontFamily: "'Noto Sans Tamil', sans-serif" }}
                      className="text-[13px] font-bold text-brand-primary leading-tight">{formData.nameTamil}</span>
                    <button type="button"
                      className="text-[9px] text-gray-300 uppercase font-bold hover:text-gray-400 cursor-pointer ml-auto"
                      onClick={() => setFormData(prev => ({ ...prev, nameTamil: '' }))}>✕ clear</button>
                  </>
                ) : formData.nameEnglish ? (
                  <span className="text-[10px] text-gray-300 font-bold uppercase tracking-widest">Type to translate…</span>
                ) : null}
              </div>
              {!translating && formData.nameTamil === '' && formData.nameEnglish && (
                <input type="text" lang="ta"
                  style={{ fontFamily: "'Noto Sans Tamil', sans-serif" }}
                  className={`${inputCls} mt-2 text-sm`}
                  placeholder="Tamil name (type manually if needed)"
                  value={formData.nameTamil}
                  onChange={(e) => setFormData(prev => ({ ...prev, nameTamil: e.target.value }))} />
              )}
            </div>

            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                Base Price <span className="text-gray-300">(no varieties)</span>
              </label>
              <input type="number" className={inputCls} value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })} required />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Quantity</label>
              <input type="text" className={inputCls} value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })} required />
            </div>
          </div>

          {/* Row 2: Category + Varieties with prices */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Category</label>
              <select className={`${inputCls} cursor-pointer`} value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })} required>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">
                Varieties &amp; Prices
              </label>
              <div className="flex flex-col gap-2">
                {/* Variety toggle buttons */}
                <div className="flex flex-wrap gap-2">
                  {varieties.map(v => (
                    <button key={v._id} type="button" onClick={() => handleVarietyToggle(v._id)}
                      className={`px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase cursor-pointer transition-all border
                        ${formData.varieties.includes(v._id)
                          ? 'bg-brand-primary text-white border-brand-primary'
                          : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                      {v.name}
                    </button>
                  ))}
                </div>
                {/* Price inputs for selected varieties */}
                {formData.varieties.length > 0 && (
                  <div className="mt-2 bg-gray-50 border border-gray-100 rounded-sm p-3">
                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">Set price per variety</p>
                    <div className="grid grid-cols-2 gap-2">
                      {formData.varieties.map(vid => {
                        const vName = varieties.find(v => v._id === vid)?.name || '';
                        const vp = formData.varietyPrices.find(vp => vp.variety === vid);
                        return (
                          <div key={vid} className="flex items-center gap-2 bg-white border border-gray-100 rounded-sm px-3 py-1.5">
                            <span className="text-[10px] font-black text-brand-primary uppercase w-16 shrink-0">{vName}</span>
                            <span className="text-gray-300 text-xs">₹</span>
                            <input
                              type="number"
                              className="flex-1 outline-none text-sm font-bold border-b border-gray-200 focus:border-brand-primary bg-transparent min-w-0"
                              placeholder="0.00"
                              value={vp?.price ?? ''}
                              onChange={(e) => handleVarietyPriceChange(vid, e.target.value)}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-4 items-center">
            <button type="submit" disabled={translating}
              className="bg-brand-primary text-brand-white px-10 py-3 rounded-sm font-black text-[11px] uppercase tracking-[0.2em] cursor-pointer hover:brightness-110 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-wait">
              {editId ? 'Update Item' : 'Add Food Item'}
            </button>
            {editId && (
              <button type="button" onClick={resetForm}
                className="text-gray-400 font-bold text-[11px] uppercase cursor-pointer hover:text-gray-600">Cancel</button>
            )}
          </div>
        </form>

        {/* ── Search / Filter Bar ── */}
        <div className="bg-white rounded-sm border border-gray-100 shadow-sm p-4 mb-4 flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 flex-1 min-w-[180px]">
            <HiSearch className="text-gray-300 shrink-0" />
            <input
              type="text"
              placeholder="Search by name or code…"
              value={filterSearch}
              onChange={e => setFilterSearch(e.target.value)}
              className="w-full outline-none text-sm font-bold text-gray-700 placeholder-gray-300"
            />
            {filterSearch && (
              <button onClick={() => setFilterSearch('')} className="text-gray-300 hover:text-gray-500">
                <HiX size={14} />
              </button>
            )}
          </div>
          <select
            value={filterCategory}
            onChange={e => setFilterCategory(e.target.value)}
            className="border border-gray-100 px-3 py-1.5 rounded-sm text-[11px] font-bold text-gray-500 outline-none cursor-pointer">
            <option value="">All Categories</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
          <select
            value={filterVariety}
            onChange={e => setFilterVariety(e.target.value)}
            className="border border-gray-100 px-3 py-1.5 rounded-sm text-[11px] font-bold text-gray-500 outline-none cursor-pointer">
            <option value="">All Varieties</option>
            {varieties.map(v => <option key={v._id} value={v._id}>{v.name}</option>)}
          </select>
          {(filterSearch || filterCategory || filterVariety) && (
            <button
              onClick={() => { setFilterSearch(''); setFilterCategory(''); setFilterVariety(''); }}
              className="text-[10px] font-bold text-red-400 uppercase hover:text-red-600 flex items-center gap-1">
              <HiX size={12} /> Clear Filters
            </button>
          )}
          <span className="text-[10px] font-bold text-gray-300 uppercase ml-auto">
            {filteredFoods.length} of {foods.length} items
          </span>
        </div>

        {/* ── Food Table ── */}
        <div className="bg-brand-white rounded-sm shadow-sm overflow-hidden border border-gray-100">
          <table className="w-full text-left">
            <thead className="bg-gray-100 text-[10px] font-black uppercase tracking-widest text-brand-primary">
              <tr>
                <th className="px-6 py-4">Item Details</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Varieties &amp; Prices</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredFoods.map((food) => {
                // Build variety→price map from populated data
                const vpMap = {};
                (food.varietyPrices || []).forEach(vp => {
                  const vid = vp.variety?._id || vp.variety;
                  vpMap[String(vid)] = vp.price;
                });

                return (
                  <tr key={food._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <span className="bg-brand-primary/10 text-brand-primary text-[10px] font-black px-2 py-1 rounded-sm border border-brand-primary/20 shrink-0">
                          #{food.itemcode}
                        </span>
                        <div>
                          <p lang="ta" style={{ fontFamily: "'Noto Sans Tamil', sans-serif" }}
                            className="font-black text-brand-primary text-sm leading-tight">
                            {food.nameTamil || '—'}
                          </p>
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
                      <div className="flex flex-wrap gap-1 max-w-[220px]">
                        {food.varieties?.length === 0 && (
                          <span className="text-[9px] text-gray-300 font-bold">No varieties</span>
                        )}
                        {food.varieties?.map(v => {
                          const vid = v._id || v;
                          const vPrice = vpMap[String(vid)];
                          return (
                            <div key={vid} className="flex items-center gap-1 bg-gray-50 border border-gray-200 px-2 py-0.5 rounded-sm">
                              <span className="text-[9px] font-bold text-gray-500 uppercase">{v.name}</span>
                              {vPrice !== undefined && (
                                <span className="text-[9px] font-black text-brand-primary">₹{vPrice}</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button onClick={() => handleEditClick(food)}
                          className="text-blue-600 cursor-pointer p-2 hover:bg-blue-50 rounded-sm transition-all"><HiPencil /></button>
                        <button onClick={() => handleDelete(food._id)}
                          className="text-red-600 cursor-pointer p-2 hover:bg-red-50 rounded-sm transition-all"><HiTrash /></button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filteredFoods.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-10 text-center text-gray-300 text-sm font-bold uppercase tracking-widest">
                    {foods.length === 0 ? 'No food items yet.' : 'No items match your filters.'}
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

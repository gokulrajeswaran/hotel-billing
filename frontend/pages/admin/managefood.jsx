import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { HiPlus, HiPencil, HiTrash } from 'react-icons/hi';
import Topbar from './components/topbar';
import { API_URL } from '../../components/api';
import { confirmDelete, showSuccess } from '../../components/alert';

export default function ManageFood() {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [varieties, setVarieties] = useState([]);
  
  const [formData, setFormData] = useState({
    name: '', price: '', quantity: '', category: '', varieties: []
  });
  const [editId, setEditId] = useState(null);

  useEffect(() => {
    fetchData();
  }, []);

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
    } catch (err) { toast.error("Failed to load data"); }
  };

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
    try {
      if (editId) {
        await axios.put(`${API_URL}/api/admin/food/update/${editId}`, formData);
        toast.success("Food item updated");
      } else {
        await axios.post(`${API_URL}/api/admin/food/add`, formData);
        toast.success("Food item added");
      }
      resetForm();
      fetchData();
    } catch (err) { toast.error("Operation failed"); }
  };

  const resetForm = () => {
    setFormData({ name: '', price: '', quantity: '', category: '', varieties: [] });
    setEditId(null);
  };

  const handleDelete = async (id) => {
    if (await confirmDelete("Delete Food Item?", "This will remove the item from the menu.")) {
      try {
        await axios.delete(`${API_URL}/api/admin/food/delete/${id}`);
        showSuccess("Deleted!", "Item removed.");
        fetchData();
      } catch (err) { toast.error("Delete failed"); }
    }
  };

  // Helper to pre-fill form for editing
  const handleEditClick = (food) => {
    setEditId(food._id);
    setFormData({
      name: food.name,
      price: food.price,
      quantity: food.quantity,
      category: food.category?._id || '',
      // Map variety objects to just their IDs for the form state
      varieties: food.varieties.map(v => v._id || v) 
    });
    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Topbar />
      <div className="max-w-6xl mx-auto p-8">
        <h2 className="text-2xl font-black text-brand-primary uppercase tracking-tighter mb-8">Manage Food Items</h2>

        {/* Entry Form */}
        <form onSubmit={handleSubmit} className="bg-brand-white p-8 rounded-sm shadow-sm border border-gray-100 mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Food Name</label>
              <input type="text" className="w-full border-2 border-gray-100 px-4 py-2 rounded-sm outline-none focus:border-brand-primary" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Price</label>
              <input type="number" className="w-full border-2 border-gray-100 px-4 py-2 rounded-sm outline-none focus:border-brand-primary" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} required />
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Quantity</label>
              <input type="text" className="w-full border-2 border-gray-100 px-4 py-2 rounded-sm outline-none focus:border-brand-primary" value={formData.quantity} onChange={(e) => setFormData({...formData, quantity: e.target.value})} required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Category</label>
              <select className="w-full border-2 border-gray-100 px-4 py-2 rounded-sm outline-none focus:border-brand-primary cursor-pointer" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required>
                <option value="">Select Category</option>
                {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-2">Varieties</label>
              <div className="flex flex-wrap gap-2">
                {varieties.map(v => (
                  <button key={v._id} type="button" onClick={() => handleVarietyToggle(v._id)} className={`px-3 py-1.5 rounded-sm text-[10px] font-bold uppercase cursor-pointer transition-all border ${formData.varieties.includes(v._id) ? 'bg-brand-primary text-white border-brand-primary' : 'bg-gray-50 text-gray-400 border-gray-200'}`}>
                    {v.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 flex gap-4">
            <button type="submit" className="bg-brand-primary text-brand-white px-10 py-3 rounded-sm font-black text-[11px] uppercase tracking-[0.2em] cursor-pointer hover:brightness-110 active:scale-95 transition-all">
              {editId ? 'Update Item' : 'Add Food Item'}
            </button>
            {editId && <button type="button" onClick={resetForm} className="text-gray-400 font-bold text-[11px] uppercase cursor-pointer">Cancel</button>}
          </div>
        </form>

        {/* Table List */}
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
                      <span className="bg-brand-primary/10 text-brand-primary text-[10px] font-black px-2 py-1 rounded-sm border border-brand-primary/20">
                        #{food.itemcode}
                      </span>
                      <div>
                        <p className="font-black text-brand-primary uppercase text-sm leading-tight">{food.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">₹{food.price} • {food.quantity}</p>
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
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
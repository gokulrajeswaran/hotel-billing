import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { HiSearch, HiPlus, HiPencil, HiTrash } from 'react-icons/hi';
import Topbar from './components/topbar';
import { API_URL } from '../../components/api';
import { confirmDelete, showSuccess } from '../../components/alert';

const ManageVariety = () => {
    const [varieties, setVarieties] = useState([]);
    const [name, setName] = useState('');
    const [editId, setEditId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => { fetchVarieties(); }, []);

    const fetchVarieties = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/admin/variety`);
            setVarieties(res.data);
        } catch (err) { toast.error("Failed to load varieties"); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await axios.put(`${API_URL}/api/admin/variety/update/${editId}`, { name });
                toast.success("Variety updated");
            } else {
                await axios.post(`${API_URL}/api/admin/variety/add`, { name });
                toast.success("Variety added");
            }
            setName('');
            setEditId(null);
            fetchVarieties();
        } catch (err) { toast.error(err.response?.data?.message || "Error saving variety"); }
    };

    const handleDelete = async (id) => {
        if (await confirmDelete("Delete Variety?", "This entry will be permanently removed.")) {
            try {
                await axios.delete(`${API_URL}/api/admin/variety/delete/${id}`);
                showSuccess("Deleted!", "Variety has been removed.");
                fetchVarieties();
            } catch (err) { toast.error("Delete failed"); }
        }
    };

    const filteredVarieties = varieties.filter(v =>
        v.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <Topbar />
            <div className="max-w-4xl mx-auto p-8">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-black text-brand-primary uppercase tracking-tighter">
                        Manage Varieties
                    </h2>
                </div>

                {/* Form Section */}
                <form onSubmit={handleSubmit} className="bg-brand-white p-6 rounded-sm shadow-sm border border-gray-100 flex gap-4 mb-8 items-end">
                    <div className="flex-1">
                        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2">Variety Name</label>
                        <input
                            type="text"
                            className="w-full px-4 py-2 border-2 border-gray-200 rounded-sm focus:border-brand-primary outline-none transition-all text-sm"
                            placeholder="e.g. spicy, regular, family pack..."
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            required
                        />
                    </div>
                    <button 
                        type="submit" 
                        className="bg-brand-primary text-brand-white px-8 py-2.5 rounded-sm text-[11px] font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 cursor-pointer transition-all flex items-center gap-2 h-[42px]"
                    >
                        {editId ? <><HiPencil /> Update</> : <><HiPlus /> Add Variety</>}
                    </button>
                    {editId && (
                        <button 
                            type="button"
                            onClick={() => { setEditId(null); setName(''); }} 
                            className="text-gray-400 text-[10px] font-bold uppercase cursor-pointer hover:text-brand-primary h-[42px] px-2"
                        >
                            Cancel
                        </button>
                    )}
                </form>

                {/* Search Bar */}
                <div className="relative mb-4">
                    <HiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-sm text-sm outline-none focus:ring-1 focus:ring-brand-primary transition-all"
                        placeholder="Search varieties..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Varieties Table */}
                <div className="bg-brand-white shadow-sm rounded-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-100 text-[10px] uppercase tracking-widest text-brand-primary">
                            <tr>
                                <th className="px-6 py-4">Variety Name</th>
                                <th className="px-6 py-4 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredVarieties.map((v) => (
                                <tr key={v._id} className="hover:bg-gray-50/50 transition-colors group">
                                    <td className="px-6 py-4 text-sm font-bold text-brand-primary capitalize">
                                        {v.name}
                                    </td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-6">
                                        <button 
                                            onClick={() => { setEditId(v._id); setName(v.name); }} 
                                            className="text-blue-600 flex items-center gap-1 text-[10px] font-black uppercase hover:underline cursor-pointer tracking-wider"
                                        >
                                            <HiPencil /> Edit
                                        </button>
                                        <button 
                                            onClick={() => handleDelete(v._id)} 
                                            className="text-red-600 flex items-center gap-1 text-[10px] font-black uppercase hover:underline cursor-pointer tracking-wider"
                                        >
                                            <HiTrash /> Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredVarieties.length === 0 && (
                        <div className="p-12 text-center text-gray-400 text-sm">
                            No varieties found.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageVariety;
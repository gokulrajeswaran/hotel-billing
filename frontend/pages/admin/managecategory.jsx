import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Topbar from './components/topbar';
import { API_URL } from '../../components/api';
import { confirmDelete, showSuccess } from '../../components/alert';

const ManageCategory = () => {
    const [categories, setCategories] = useState([]);
    const [name, setName] = useState('');
    const [editId, setEditId] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => { fetchCategories(); }, []);

    const fetchCategories = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/admin/category`);
            setCategories(res.data);
        } catch (err) { toast.error("Failed to load categories"); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (editId) {
                await axios.put(`${API_URL}/api/admin/category/update/${editId}`, { name });
                toast.success("Category updated");
            } else {
                await axios.post(`${API_URL}/api/admin/category/add`, { name });
                toast.success("Category added");
            }
            setName('');
            setEditId(null);
            fetchCategories();
        } catch (err) { toast.error(err.response?.data?.message || "Error saving category"); }
    };

    const handleDelete = async (id) => {
        if (await confirmDelete("Delete Category?", "This will remove all linked associations.")) {
            try {
                // Ensure the path matches your backend route exactly
                await axios.delete(`${API_URL}/api/admin/category/delete/${id}`);
                showSuccess("Deleted!", "Category has been removed.");
                fetchCategories();
            } catch (err) { toast.error("Delete failed"); }
        }
    };

    const filteredCategories = categories.filter(cat =>
        cat.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <Topbar />
            <div className="max-w-4xl mx-auto p-8">
                <h2 className="text-2xl font-black text-brand-primary uppercase mb-6 tracking-tighter">
                    Manage Categories
                </h2>

                {/* Input Form */}
                <form onSubmit={handleSubmit} className="bg-brand-white p-6 rounded-sm shadow-sm border border-gray-100 flex gap-4 mb-8">
                    <input
                        type="text"
                        className="flex-1 px-4 py-2 border-2 border-gray-200 rounded-sm focus:border-brand-primary outline-none transition-all"
                        placeholder="Category Name..."
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required
                    />
                    <button
                        type="submit"
                        className="bg-brand-primary text-brand-white px-8 py-2 rounded-sm text-xs font-bold uppercase tracking-widest hover:brightness-110 active:scale-95 cursor-pointer transition-all"
                    >
                        {editId ? 'Update' : 'Add Category'}
                    </button>
                    {editId && (
                        <button
                            type="button"
                            onClick={() => { setEditId(null); setName(''); }}
                            className="text-gray-400 text-xs font-bold uppercase cursor-pointer hover:text-brand-primary transition-colors"
                        >
                            Cancel
                        </button>
                    )}
                </form>

                {/* Search Bar */}
                <div className="mb-4">
                    <input
                        type="text"
                        className="w-full px-4 py-2 bg-white border border-gray-200 rounded-sm text-sm outline-none focus:ring-1 focus:ring-brand-primary transition-all"
                        placeholder="Search categories..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                {/* Categories Table */}
                <div className="bg-brand-white shadow-sm rounded-sm border border-gray-100 overflow-hidden">
                    <table className="w-full text-left">
                        <thead className="bg-gray-100 text-[10px] uppercase tracking-widest text-brand-primary">
                            <tr>
                                <th className="px-6 py-3">Category Name</th>
                                <th className="px-6 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredCategories.map((cat) => (
                                <tr key={cat._id} className="hover:bg-gray-50/50 transition-colors">
                                    <td className="px-6 py-4 text-sm font-bold text-brand-primary capitalize">
                                        {cat.name}
                                    </td>
                                    <td className="px-6 py-4 text-right flex justify-end gap-6">
                                        <button
                                            onClick={() => { setEditId(cat._id); setName(cat.name); }}
                                            className="text-blue-600 text-[10px] font-black uppercase hover:underline cursor-pointer tracking-wider"
                                        >
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(cat._id)}
                                            className="text-red-600 text-[10px] font-black uppercase hover:underline cursor-pointer tracking-wider"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {filteredCategories.length === 0 && (
                        <div className="p-10 text-center text-gray-400 text-sm">
                            No categories found matching "{searchTerm}"
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ManageCategory;
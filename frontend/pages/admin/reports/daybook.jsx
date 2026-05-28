import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Topbar from '../components/topbar';
import { API_URL } from '../../../components/api';

const DayBook = () => {
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [data, setData] = useState([]);
    const [summary, setSummary] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchReport = async () => {
        if (!date) { toast.error('Please select a date'); return; }
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/reports/daybook`, {
                params: { date }
            });
            setData(res.data.bills || res.data);
            setSummary(res.data.summary || null);
        } catch (err) {
            toast.error('Failed to load day book');
        } finally {
            setLoading(false);
        }
    };

    const totalAmount = summary?.totalAmount ?? data.reduce((sum, row) => sum + (row.totalAmount || 0), 0);
    const totalBills = summary?.totalBills ?? data.length;

    return (
        <div className="min-h-screen bg-gray-50">
            <Topbar />
            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-black text-gray-800 uppercase tracking-wide">
                        Day Book
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Complete transaction log for a selected day</p>
                </div>

                {/* Filter */}
                <div className="bg-white rounded-sm shadow p-5 mb-6 border-l-4 border-brand-primary">
                    <div className="flex flex-wrap gap-4 items-end">
                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">Select Date</label>
                            <input
                                type="date"
                                value={date}
                                onChange={e => setDate(e.target.value)}
                                className="border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
                            />
                        </div>
                        <button
                            onClick={fetchReport}
                            disabled={loading}
                            className="bg-brand-primary text-white text-[11px] font-black px-6 py-2 rounded-sm uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Loading...' : 'View Day Book'}
                        </button>
                    </div>
                </div>

                {/* Summary Cards */}
                {data.length > 0 && (
                    <div className="grid grid-cols-2 gap-4 mb-6">
                        <div className="bg-white rounded-sm shadow p-5 border-t-4 border-brand-primary">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Total Bills</p>
                            <p className="text-3xl font-black text-gray-800 mt-1">{totalBills}</p>
                        </div>
                        <div className="bg-white rounded-sm shadow p-5 border-t-4 border-green-500">
                            <p className="text-[11px] font-bold uppercase tracking-wider text-gray-500">Total Collection</p>
                            <p className="text-3xl font-black text-gray-800 mt-1">₹{Number(totalAmount).toFixed(2)}</p>
                        </div>
                    </div>
                )}

                {/* Table */}
                <div className="bg-white rounded-sm shadow overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-brand-primary text-white">
                            <tr>
                                <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-wider">#</th>
                                <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-wider">Bill No</th>
                                <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-wider">Time</th>
                                <th className="px-5 py-3 text-center text-[11px] font-black uppercase tracking-wider">Items</th>
                                <th className="px-5 py-3 text-right text-[11px] font-black uppercase tracking-wider">Amount (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-gray-400 text-sm">
                                        {loading ? 'Fetching data...' : 'No transactions found. Select a date and click View Day Book.'}
                                    </td>
                                </tr>
                            ) : (
                                data.map((row, idx) => (
                                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-5 py-3 text-gray-500">{idx + 1}</td>
                                        <td className="px-5 py-3 font-mono font-bold text-brand-primary">{row.billNo}</td>
                                        <td className="px-5 py-3 text-gray-600">
                                            {row.time || (row.createdAt ? new Date(row.createdAt).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : '—')}
                                        </td>
                                        <td className="px-5 py-3 text-center text-gray-700">{row.itemCount ?? (row.items?.length ?? '—')}</td>
                                        <td className="px-5 py-3 text-right font-bold text-gray-800">
                                            ₹{Number(row.totalAmount).toFixed(2)}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                        {data.length > 0 && (
                            <tfoot className="bg-gray-100 border-t-2 border-brand-primary">
                                <tr>
                                    <td colSpan={4} className="px-5 py-3 text-[11px] font-black uppercase tracking-wider text-gray-700">
                                        Total
                                    </td>
                                    <td className="px-5 py-3 text-right font-black text-gray-800">₹{Number(totalAmount).toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </div>
    );
};

export default DayBook;

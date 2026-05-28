import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Topbar from '../components/topbar';
import { API_URL } from '../../../components/api';

const BillwiseCollectionSummary = () => {
    const [fromDate, setFromDate] = useState(new Date().toISOString().split('T')[0]);
    const [toDate, setToDate] = useState(new Date().toISOString().split('T')[0]);
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchReport = async () => {
        if (!fromDate || !toDate) { toast.error('Please select both dates'); return; }
        if (fromDate > toDate) { toast.error('From date cannot be after To date'); return; }
        setLoading(true);
        try {
            const res = await axios.get(`${API_URL}/api/reports/billwise-collection`, {
                params: { fromDate, toDate }
            });
            setData(res.data);
        } catch (err) {
            toast.error('Failed to load report');
        } finally {
            setLoading(false);
        }
    };

    const totalAmount = data.reduce((sum, row) => sum + (row.totalAmount || 0), 0);

    return (
        <div className="min-h-screen bg-gray-50">
            <Topbar />
            <div className="max-w-6xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-black text-gray-800 uppercase tracking-wide">
                        Bill Wise Collection Summary
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">View individual bill details and collections for a date range</p>
                </div>

                {/* Filters */}
                <div className="bg-white rounded-sm shadow p-5 mb-6 border-l-4 border-brand-primary">
                    <div className="flex flex-wrap gap-4 items-end">
                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">From Date</label>
                            <input
                                type="date"
                                value={fromDate}
                                onChange={e => setFromDate(e.target.value)}
                                className="border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
                            />
                        </div>
                        <div>
                            <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-600 mb-1">To Date</label>
                            <input
                                type="date"
                                value={toDate}
                                onChange={e => setToDate(e.target.value)}
                                className="border border-gray-300 rounded-sm px-3 py-2 text-sm focus:outline-none focus:border-brand-primary"
                            />
                        </div>
                        <button
                            onClick={fetchReport}
                            disabled={loading}
                            className="bg-brand-primary text-white text-[11px] font-black px-6 py-2 rounded-sm uppercase tracking-wider hover:opacity-90 active:scale-95 transition-all disabled:opacity-50"
                        >
                            {loading ? 'Loading...' : 'Generate Report'}
                        </button>
                    </div>
                </div>

                {/* Table */}
                <div className="bg-white rounded-sm shadow overflow-hidden">
                    <table className="w-full text-sm">
                        <thead className="bg-brand-primary text-white">
                            <tr>
                                <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-wider">#</th>
                                <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-wider">Bill No</th>
                                <th className="px-5 py-3 text-left text-[11px] font-black uppercase tracking-wider">Date</th>
                                <th className="px-5 py-3 text-center text-[11px] font-black uppercase tracking-wider">Items</th>
                                <th className="px-5 py-3 text-right text-[11px] font-black uppercase tracking-wider">Total Amount (₹)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-12 text-gray-400 text-sm">
                                        {loading ? 'Fetching data...' : 'No data found. Select a date range and click Generate Report.'}
                                    </td>
                                </tr>
                            ) : (
                                data.map((row, idx) => (
                                    <tr key={idx} className={idx % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                                        <td className="px-5 py-3 text-gray-500">{idx + 1}</td>
                                        <td className="px-5 py-3 font-mono font-bold text-brand-primary">{row.billNo}</td>
                                        <td className="px-5 py-3 text-gray-700">{row.date}</td>
                                        <td className="px-5 py-3 text-center text-gray-700">{row.itemCount ?? '—'}</td>
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
                                        Total ({data.length} bills)
                                    </td>
                                    <td className="px-5 py-3 text-right font-black text-gray-800">₹{totalAmount.toFixed(2)}</td>
                                </tr>
                            </tfoot>
                        )}
                    </table>
                </div>
            </div>
        </div>
    );
};

export default BillwiseCollectionSummary;

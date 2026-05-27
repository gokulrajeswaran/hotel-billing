import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import { HiPlus, HiTrash, HiSave, HiPrinter, HiSearch } from 'react-icons/hi';
import Topbar from './components/topbar';
import { API_URL } from '../../components/api';

const AdminDashboard = () => {
    const [allFoods, setAllFoods] = useState([]);
    const [billItems, setBillItems] = useState([]);
    const [searchCode, setSearchCode] = useState('');
    const [selectedFood, setSelectedFood] = useState(null);
    const [qty, setQty] = useState(1);
    
    // For Bill Retrieval & State
    const [searchDate, setSearchDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchBillNo, setSearchBillNo] = useState('');
    const [currentBillNo, setCurrentBillNo] = useState('New');

    useEffect(() => {
        fetchFoods();
    }, []);

    const fetchFoods = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/admin/food`);
            setAllFoods(res.data);
        } catch (err) {
            toast.error("Failed to load food items");
        }
    };

    const addToBill = () => {
        if (!selectedFood) return toast.error("Select an item first");
        const newItem = {
            foodId: selectedFood._id,
            name: selectedFood.name,
            rate: selectedFood.price,
            qty: parseFloat(qty),
            amount: selectedFood.price * qty
        };
        setBillItems([...billItems, newItem]);
        setSelectedFood(null); 
        setSearchCode(''); 
        setQty(1);
    };

    const handleSaveBill = async () => {
        if (billItems.length === 0) return toast.error("Bill is empty");
        try {
            const res = await axios.post(`${API_URL}/api/admin/sales/save`, {
                items: billItems,
                totalAmount: billItems.reduce((acc, i) => acc + i.amount, 0)
            });
            toast.success(`Bill #${res.data.billNo} Saved & Printing...`);
            printBill(res.data); 
            setBillItems([]);
            setCurrentBillNo('New');
        } catch (err) {
            toast.error("Error saving bill");
        }
    };

    const handleRebillSearch = async () => {
        if (!searchBillNo) return toast.error("Enter a Bill Number");
        try {
            const res = await axios.get(`${API_URL}/api/admin/sales/find?date=${searchDate}&billNo=${searchBillNo}`);
            // Show the old bill in the UI
            setBillItems(res.data.items);
            setCurrentBillNo(res.data.billNo);
            toast.success(`Bill #${res.data.billNo} Retrieved`);
        } catch (err) {
            toast.error("Bill not found for this date");
        }
    };

    const printBill = (data) => {
        const printWindow = window.open('', '_blank', 'width=400,height=600');
        printWindow.document.write(`
            <html>
                <style>
                    body { font-family: 'Courier New', monospace; padding: 10px; font-size: 12px; }
                    .center { text-align: center; }
                    table { width: 100%; border-collapse: collapse; margin-top: 10px; }
                    th { border-bottom: 1px dashed #000; text-align: left; }
                    .total { font-size: 16px; font-weight: bold; margin-top: 10px; border-top: 1px solid #000; padding-top: 5px; }
                </style>
                <body>
                    <div class="center">
                        <h2 style="margin:0">YOUR RESTAURANT</h2>
                        <p>Virudhunagar, Tamil Nadu</p>
                        <hr/>
                    </div>
                    <p>Bill: ${data.billNo} <br/> Date: ${new Date(data.date).toLocaleString()}</p>
                    <table>
                        <thead>
                            <tr><th>ITEM</th><th>QTY</th><th>AMT</th></tr>
                        </thead>
                        <tbody>
                            ${data.items.map(i => `
                                <tr>
                                    <td style="text-transform:uppercase">${i.name}</td>
                                    <td>${i.qty}</td>
                                    <td>${i.amount.toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                    <div class="total center">TOTAL: ₹${data.totalAmount.toFixed(2)}</div>
                    <hr/>
                    <p class="center">THANK YOU! VISIT AGAIN</p>
                </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.focus();
        printWindow.print();
        printWindow.close();
    };

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-gray-200">
            <Topbar />
            
            <div className="flex-1 flex gap-1 p-1 overflow-hidden">
                
                {/* LEFT COLUMN: Entry & Directory */}
                <div className="w-[60%] flex flex-col gap-1 overflow-hidden">
                    
                    {/* Top Entry Box */}
                    <div className="bg-white p-3 shadow-sm border-t-4 border-brand-primary">
                        <div className="grid grid-cols-12 gap-2 items-end">
                            <div className="col-span-2">
                                <label className="text-[9px] font-bold text-gray-500 uppercase">Item Code</label>
                                <input 
                                    type="text" 
                                    className="w-full border border-gray-300 p-1.5 text-sm font-bold outline-none focus:border-brand-primary"
                                    value={searchCode}
                                    onChange={(e) => {
                                        setSearchCode(e.target.value);
                                        const found = allFoods.find(f => f.itemcode === parseInt(e.target.value));
                                        if (found) setSelectedFood(found);
                                    }}
                                />
                            </div>
                            <div className="col-span-5">
                                <label className="text-[9px] font-bold text-gray-500 uppercase">Food Name</label>
                                <input 
                                    type="text" 
                                    readOnly
                                    className="w-full bg-gray-50 border border-gray-300 p-1.5 text-sm font-bold uppercase outline-none"
                                    value={selectedFood?.name || ''}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="text-[9px] font-bold text-gray-500 uppercase">Qty</label>
                                <input 
                                    type="number" 
                                    className="w-full border border-gray-300 p-1.5 text-sm font-bold outline-none"
                                    value={qty}
                                    onChange={(e) => setQty(e.target.value)}
                                />
                            </div>
                            <div className="col-span-3">
                                <button 
                                    onClick={addToBill}
                                    className="w-full bg-brand-primary text-white py-2 text-[11px] font-black uppercase flex items-center justify-center gap-1 cursor-pointer hover:bg-opacity-90"
                                >
                                    <HiPlus /> Add Item
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Directory List */}
                    <div className="bg-white flex-1 overflow-hidden flex flex-col shadow-sm">
                        <div className="bg-gray-100 p-2 border-b text-[10px] font-black text-brand-primary uppercase grid grid-cols-12">
                            <span className="col-span-2">Code</span>
                            <span className="col-span-8">Product Description</span>
                            <span className="col-span-2 text-right">Rate</span>
                        </div>
                        <div className="overflow-y-auto flex-1 divide-y divide-gray-100">
                            {allFoods.map((f) => (
                                <div 
                                    key={f._id} 
                                    onClick={() => { setSelectedFood(f); setSearchCode(f.itemcode); }}
                                    className="grid grid-cols-12 text-[11px] font-bold p-2 cursor-pointer hover:bg-blue-600 hover:text-white transition-all uppercase"
                                >
                                    <span className="col-span-2">{f.itemcode}</span>
                                    <span className="col-span-8">{f.name}</span>
                                    <span className="col-span-2 text-right">{f.price.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Active Bill & Controls */}
                <div className="w-[40%] bg-white border border-gray-300 shadow-sm flex flex-col">
                    
                    {/* Bill Search / Re-bill Header */}
                    <div className="p-2 bg-gray-50 border-b flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1">
                            <input 
                                type="date" 
                                className="text-[10px] border border-gray-300 p-1 outline-none"
                                value={searchDate}
                                onChange={(e) => setSearchDate(e.target.value)}
                            />
                            <input 
                                type="number" 
                                placeholder="Bill No" 
                                className="w-16 text-[10px] border border-gray-300 p-1 outline-none"
                                value={searchBillNo}
                                onChange={(e) => setSearchBillNo(e.target.value)}
                            />
                            <button 
                                onClick={handleRebillSearch}
                                className="bg-gray-800 text-white p-1.5 cursor-pointer hover:bg-black"
                            >
                                <HiSearch size={14} />
                            </button>
                        </div>
                        <div className="text-[10px] font-black text-red-600 uppercase">
                            Bill No: {currentBillNo}
                        </div>
                    </div>

                    {/* Bill Items Table */}
                    <div className="flex-1 overflow-y-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-200 sticky top-0 text-[10px] font-black text-brand-primary uppercase">
                                <tr>
                                    <th className="p-2">Items</th>
                                    <th className="p-2 text-right">Price</th>
                                    <th className="p-2 text-center">Qty</th>
                                    <th className="p-2 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="text-[11px] font-bold divide-y divide-gray-100">
                                {billItems.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="p-2 uppercase">{item.name}</td>
                                        <td className="p-2 text-right">{item.rate.toFixed(2)}</td>
                                        <td className="p-2 text-center">{item.qty}</td>
                                        <td className="p-2 text-right font-black">₹{item.amount.toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Footer / Summary */}
                    <div className="p-3 bg-gray-100 border-t border-gray-300">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[12px] font-black text-brand-primary uppercase">Grand Total</span>
                            <div className="bg-white border-2 border-brand-primary px-4 py-1 text-xl font-black text-brand-primary">
                                ₹{billItems.reduce((acc, i) => acc + i.amount, 0).toFixed(2)}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <button 
                                onClick={() => { setBillItems([]); setCurrentBillNo('New'); }}
                                className="bg-gray-700 text-white text-[10px] font-bold py-3 uppercase cursor-pointer flex items-center justify-center gap-1"
                            >
                                <HiTrash /> Clear
                            </button>
                            <button 
                                onClick={handleSaveBill}
                                className="bg-blue-700 text-white text-[10px] font-bold py-3 uppercase cursor-pointer flex items-center justify-center gap-1"
                            >
                                <HiSave /> F2 - Save & Print
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
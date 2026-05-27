import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Dexie from 'dexie';
import { HiPlus, HiTrash, HiSave, HiSearch, HiCloudUpload, HiCloudDownload } from 'react-icons/hi';
import Topbar from './components/topbar';
import { API_URL } from '../../components/api';

const db = new Dexie('RestaurantPOS_DB');
db.version(1).stores({
    offlineSales: '++id, billNo, totalAmount, date, status'
});

const AdminDashboard = () => {
    const [allFoods, setAllFoods] = useState([]);
    const [billItems, setBillItems] = useState([]);
    const [searchCode, setSearchCode] = useState('');
    const [selectedFood, setSelectedFood] = useState(null);
    const [qty, setQty] = useState(1);
    const [searchDate, setSearchDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchBillNo, setSearchBillNo] = useState('');
    const [currentBillNo, setCurrentBillNo] = useState('New');
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [pendingSync, setPendingSync] = useState(0);

    useEffect(() => {
        fetchFoods();
        const handleOnline = () => { setIsOnline(true); syncOfflineData(); };
        const handleOffline = () => { setIsOnline(false); };
        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);
        syncOfflineData();
        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, []);

    const fetchFoods = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/admin/food`);
            setAllFoods(res.data);
        } catch (err) {
            toast.error("Failed to load food items");
        }
    };

    const syncOfflineData = async () => {
        // 1. Get all pending items from IndexedDB
        const offlineData = await db.offlineSales.toArray();
        setPendingSync(offlineData.length);

        // 2. Only attempt sync if we are online and have data
        if (navigator.onLine && offlineData.length > 0) {
            toast.loading(`Syncing ${offlineData.length} bills...`, { id: 'sync' });

            let successCount = 0;

            for (const sale of offlineData) {
                try {
                    const response = await axios.post(`${API_URL}/api/admin/sales/save`, {
                        items: sale.items,
                        totalAmount: sale.totalAmount,
                        offlineDate: sale.date
                    });

                    // 3. ONLY delete from IndexedDB if the server confirmed receipt
                    if (response.status === 200 || response.status === 201) {
                        await db.offlineSales.delete(sale.id);
                        successCount++;
                    }
                } catch (err) {
                    console.error(`Failed to sync bill created at ${sale.date}:`, err);
                    // We don't delete here, so it stays in DB for the next sync attempt
                }
            }

            // 4. Update UI state after the loop
            const remaining = await db.offlineSales.count();
            setPendingSync(remaining);

            if (remaining === 0) {
                toast.success(`Synced ${successCount} bills successfully!`, { id: 'sync' });
            } else {
                toast.error(`Sync partial: ${remaining} bills remaining.`, { id: 'sync' });
            }
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
        setSelectedFood(null); setSearchCode(''); setQty(1);
    };

    const handleSaveBill = async () => {
        if (billItems.length === 0) return toast.error("Bill is empty");
        const saleData = {
            items: billItems,
            totalAmount: billItems.reduce((acc, i) => acc + i.amount, 0),
            date: new Date(),
            billNo: `OFF-${Date.now().toString().slice(-4)}`
        };
        if (isOnline) {
            try {
                const res = await axios.post(`${API_URL}/api/admin/sales/save`, saleData);
                toast.success(`Bill #${res.data.billNo} Saved Online`);
                printBill(res.data);
            } catch (err) {
                saveOfflineFallback(saleData);
            }
        } else {
            saveOfflineFallback(saleData);
        }
        setBillItems([]);
        setCurrentBillNo('New');
    };

    const saveOfflineFallback = async (saleData) => {
        await db.offlineSales.add({ ...saleData, status: 'pending' });
        setPendingSync(prev => prev + 1);
        toast.error("Saved Locally (Offline)");
        printBill(saleData);
    };

    const handleRebillSearch = async () => {
        if (!searchBillNo) return toast.error("Enter a Bill Number");
        try {
            const res = await axios.get(`${API_URL}/api/admin/sales/find?date=${searchDate}&billNo=${searchBillNo}`);
            setBillItems(res.data.items);
            setCurrentBillNo(res.data.billNo);
            toast.success(`Bill #${res.data.billNo} Retrieved`);
        } catch (err) {
            toast.error("Bill not found online");
        }
    };

    const printBill = (data) => {
        const printWindow = window.open('', '_blank', 'width=400,height=600');
        printWindow.document.write(`<html><style>body { font-family: 'Courier New', monospace; padding: 10px; font-size: 12px; }.center { text-align: center; }table { width: 100%; border-collapse: collapse; margin-top: 10px; }th { border-bottom: 1px dashed #000; text-align: left; }.total { font-size: 16px; font-weight: bold; border-top: 1px solid #000; padding-top: 5px; }</style><body><div class="center"><h2>YOUR RESTAURANT</h2><hr/></div><p>Bill: ${data.billNo} <br/> Date: ${new Date(data.date).toLocaleString()}</p><table><thead><tr><th>ITEM</th><th>QTY</th><th>AMT</th></tr></thead><tbody>${data.items.map(i => `<tr><td>${i.name}</td><td>${i.qty}</td><td>${i.amount.toFixed(2)}</td></tr>`).join('')}</tbody></table><div class="total center">TOTAL: ₹${data.totalAmount.toFixed(2)}</div><hr/><p class="center">THANK YOU!</p></body></html>`);
        printWindow.document.close();
        printWindow.print();
        printWindow.close();
    };

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-gray-200">
            <Topbar />

            {/* Connectivity Ribbon - Fixed alignment with items-center */}
            <div className={`text-[10px] font-bold px-3 py-1 flex items-center justify-between text-white transition-colors duration-300 ${isOnline ? 'bg-green-600' : 'bg-red-600'}`}>
                <div className="flex items-center gap-1.5">
                    {isOnline ? <HiCloudUpload size={14} /> : <HiCloudDownload size={14} />}
                    <span className="leading-none">{isOnline ? "CONNECTED TO INTERNET" : "OFFLINE MODE - LOCAL SAVING ACTIVE"}</span>
                </div>
                {pendingSync > 0 && <span className="animate-pulse">{pendingSync} BILLS WAITING TO SYNC</span>}
            </div>

            <div className="flex-1 flex gap-1 p-1 overflow-hidden">
                <div className="w-[60%] flex flex-col gap-1 overflow-hidden">
                    <div className="bg-white p-3 shadow-sm border-t-4 border-brand-primary">
                        <div className="grid grid-cols-12 gap-2 items-end">
                            <div className="col-span-2">
                                <label className="text-[9px] font-bold text-gray-500 uppercase">Item Code</label>
                                <input type="text" className="w-full border p-1.5 text-sm font-bold outline-none" value={searchCode} onChange={(e) => {
                                    setSearchCode(e.target.value);
                                    const found = allFoods.find(f => f.itemcode === parseInt(e.target.value));
                                    if (found) setSelectedFood(found);
                                }} />
                            </div>
                            <div className="col-span-5">
                                <label className="text-[9px] font-bold text-gray-500 uppercase">Food Name</label>
                                <input type="text" readOnly className="w-full bg-gray-50 border p-1.5 text-sm font-bold uppercase" value={selectedFood?.name || ''} />
                            </div>
                            <div className="col-span-2">
                                <label className="text-[9px] font-bold text-gray-500 uppercase">Qty</label>
                                <input type="number" className="w-full border p-1.5 text-sm font-bold" value={qty} onChange={(e) => setQty(e.target.value)} />
                            </div>
                            <div className="col-span-3">
                                {/* Add Item Button - Fixed alignment */}
                                <button onClick={addToBill} className="w-full bg-brand-primary text-white py-2 text-[11px] font-black uppercase flex items-center justify-center gap-2 hover:bg-opacity-90 active:scale-95 transition-all">
                                    <HiPlus size={16} />
                                    <span className="leading-none">Add Item</span>
                                </button>
                            </div>
                        </div>
                    </div>
                    <div className="bg-white flex-1 overflow-hidden flex flex-col shadow-sm">
                        <div className="bg-gray-100 p-2 border-b text-[10px] font-black text-brand-primary uppercase grid grid-cols-12">
                            <span className="col-span-2">Code</span><span className="col-span-8">Product Description</span><span className="col-span-2 text-right">Rate</span>
                        </div>
                        <div className="overflow-y-auto flex-1">
                            {allFoods.map((f) => (
                                <div key={f._id} onClick={() => { setSelectedFood(f); setSearchCode(f.itemcode); }} className="grid grid-cols-12 text-[11px] font-bold p-2 cursor-pointer hover:bg-blue-600 hover:text-white uppercase transition-colors">
                                    <span className="col-span-2">{f.itemcode}</span><span className="col-span-8">{f.name}</span><span className="col-span-2 text-right">{f.price.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="w-[40%] bg-white border shadow-sm flex flex-col">
                    <div className="p-2 bg-gray-50 border-b flex justify-between items-center">
                        <div className="flex gap-1">
                            <input type="date" className="text-[10px] border p-1 outline-none" value={searchDate} onChange={(e) => setSearchDate(e.target.value)} />
                            <input type="number" className="w-16 text-[10px] border p-1 outline-none" value={searchBillNo} onChange={(e) => setSearchBillNo(e.target.value)} />
                            <button onClick={handleRebillSearch} className="bg-gray-800 text-white p-1.5 flex items-center justify-center active:bg-black">
                                <HiSearch size={14} />
                            </button>
                        </div>
                        <div className="text-[10px] font-black text-red-600">BILL NO: {currentBillNo}</div>
                    </div>
                    <div className="flex-1 overflow-y-auto">
                        <table className="w-full text-left text-[11px]">
                            <thead className="bg-gray-200 sticky top-0 font-black uppercase">
                                <tr><th className="p-2">Items</th><th className="p-2 text-right">Price</th><th className="p-2 text-center">Qty</th><th className="p-2 text-right">Total</th></tr>
                            </thead>
                            <tbody className="divide-y font-bold">
                                {billItems.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50"><td className="p-2 uppercase">{item.name}</td><td className="p-2 text-right">{item.rate.toFixed(2)}</td><td className="p-2 text-center">{item.qty}</td><td className="p-2 text-right">₹{item.amount.toFixed(2)}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-3 bg-gray-100 border-t">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[12px] font-black text-gray-600">GRAND TOTAL</span>
                            <div className="bg-white border-2 border-brand-primary px-4 py-1 text-xl font-black text-brand-primary">₹{billItems.reduce((acc, i) => acc + i.amount, 0).toFixed(2)}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {/* Clear Button - Fixed alignment */}
                            <button onClick={() => { setBillItems([]); setCurrentBillNo('New'); }} className="bg-gray-700 text-white py-3 text-[10px] uppercase font-bold flex items-center justify-center gap-2 hover:bg-gray-800 active:bg-black transition-all">
                                <HiTrash size={14} />
                                <span className="leading-none">Clear</span>
                            </button>
                            {/* Save & Print Button - Fixed alignment */}
                            <button onClick={handleSaveBill} className="bg-blue-700 text-white py-3 text-[10px] uppercase font-bold flex items-center justify-center gap-2 hover:bg-blue-800 active:bg-blue-900 transition-all">
                                <HiSave size={14} />
                                <span className="leading-none">F2 - Save & Print</span>
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
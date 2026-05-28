import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Dexie from 'dexie';
import { HiPlus, HiTrash, HiSave, HiSearch, HiCloudUpload, HiCloudDownload } from 'react-icons/hi';
import Topbar from './components/topbar';
import { API_URL } from '../../components/api';

// Noto Sans Tamil font — injected once into the main app
if (typeof document !== 'undefined' && !document.getElementById('noto-tamil-font')) {
    const link = document.createElement('link');
    link.id = 'noto-tamil-font';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;700;900&display=swap';
    document.head.appendChild(link);
}

const db = new Dexie('RestaurantPOS_DB');
db.version(1).stores({
    offlineSales: '++id, billNo, totalAmount, date, status'
});

// ── Normalize any item shape → always has nameTamil + nameEnglish ────────────
// Handles: old {name}, new {nameEnglish, nameTamil}, or mixed
const normalizeItem = (item, foodsLookup = {}) => {
    // Try to enrich from the live foods list using foodId
    const liveFood = item.foodId ? foodsLookup[item.foodId] : null;
    return {
        ...item,
        nameEnglish: item.nameEnglish || liveFood?.nameEnglish || item.name || '',
        nameTamil: item.nameTamil || liveFood?.nameTamil || item.name || '',
    };
};

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
    const [searchName, setSearchName] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);

    // Keep a live id→food map for enriching retrieved bills
    const [foodsMap, setFoodsMap] = useState({});

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
            // Build id → food map for quick lookup
            const map = {};
            res.data.forEach(f => { map[f._id] = f; });
            setFoodsMap(map);
        } catch (err) {
            toast.error('Failed to load food items');
        }
    };

    const syncOfflineData = async () => {
        const offlineData = await db.offlineSales.toArray();
        setPendingSync(offlineData.length);
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
                    if (response.status === 200 || response.status === 201) {
                        await db.offlineSales.delete(sale.id);
                        successCount++;
                    }
                } catch (err) {
                    console.error(`Failed to sync bill created at ${sale.date}:`, err);
                }
            }
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
        if (!selectedFood) return toast.error('Select an item first');
        const newItem = {
            foodId: selectedFood._id,
            nameEnglish: selectedFood.nameEnglish,
            nameTamil: selectedFood.nameTamil,
            rate: selectedFood.price,
            qty: parseFloat(qty),
            amount: selectedFood.price * parseFloat(qty)
        };
        setBillItems(prev => [...prev, newItem]);
        setSelectedFood(null);
        setSearchCode('');
        setSearchName('');
        setShowDropdown(false);
        setQty(1);
    };

    const handleSaveBill = async () => {
        if (billItems.length === 0) return toast.error('Bill is empty');
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
                // Use local billItems (already normalized) for print, not server response
                printBill({ ...res.data, items: billItems });
            } catch (err) {
                saveOfflineFallback(saleData);
            }
        } else {
            saveOfflineFallback(saleData);
        }
        setBillItems([]);
        setCurrentBillNo('New');
        setSearchName('');
        setShowDropdown(false);
    };

    const saveOfflineFallback = async (saleData) => {
        await db.offlineSales.add({ ...saleData, status: 'pending' });
        setPendingSync(prev => prev + 1);
        toast.error('Saved Locally (Offline)');
        printBill(saleData);
    };

    const handleRebillSearch = async () => {
        if (!searchBillNo) return toast.error('Enter a Bill Number');
        try {
            const res = await axios.get(`${API_URL}/api/admin/sales/find?date=${searchDate}&billNo=${searchBillNo}`);
            // Enrich every item using the live foodsMap so Tamil names are always fresh
            const enriched = res.data.items.map(item => normalizeItem(item, foodsMap));
            setBillItems(enriched);
            setCurrentBillNo(res.data.billNo);
            toast.success(`Bill #${res.data.billNo} Retrieved`);
        } catch (err) {
            toast.error('Bill not found online');
        }
    };

    // ── Print bill — waits for Noto Sans Tamil to load before printing ────────
    const printBill = (data) => {
        const printWindow = window.open('', '_blank', 'width=320,height=700');
        const rows = data.items.map(i => {
            const tamil = i.nameTamil || i.name || '';
            const english = i.nameEnglish || i.name || '';
            const showEng = english && english !== tamil;
            return `
            <tr>
                <td class="item-cell">
                    <span class="item-tamil">${tamil}</span>
                    ${showEng ? `<span class="item-english">${english}</span>` : ''}
                </td>
                <td class="num">${i.qty}</td>
                <td class="num">${Number(i.rate).toFixed(2)}</td>
                <td class="num">${Number(i.amount).toFixed(2)}</td>
            </tr>`;
        }).join('');

        printWindow.document.write(`<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Bill ${data.billNo}</title>
  <link id="tamil-font" rel="stylesheet"
    href="https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;700&display=swap" />
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Courier New', Courier, monospace;
      font-size: 12px;
      width: 300px;
      padding: 12px;
      color: #000;
    }

    /* ── Header ── */
    .header { text-align: center; margin-bottom: 8px; }
    .header h1 { font-size: 16px; font-weight: bold; letter-spacing: 2px; }
    .header p  { font-size: 10px; color: #444; margin-top: 2px; }
    .divider-dashed { border: none; border-top: 1px dashed #000; margin: 6px 0; }
    .divider-solid  { border: none; border-top: 1px solid  #000; margin: 6px 0; }

    /* ── Bill meta ── */
    .meta { font-size: 10px; margin-bottom: 4px; }
    .meta span { display: block; }

    /* ── Items table ── */
    table { width: 100%; border-collapse: collapse; }
    thead tr th {
      font-size: 10px;
      font-weight: bold;
      text-transform: uppercase;
      padding: 3px 2px;
      border-bottom: 1px dashed #000;
    }
    .th-item  { text-align: left;  width: 45%; }
    .th-qty   { text-align: right; width: 10%; }
    .th-rate  { text-align: right; width: 22%; }
    .th-amt   { text-align: right; width: 23%; }

    tbody tr td { padding: 4px 2px; vertical-align: top; }
    .item-cell  { text-align: left; }
    .item-tamil {
      display: block;
      font-family: 'Noto Sans Tamil', sans-serif;
      font-size: 12px;
      font-weight: 700;
      line-height: 1.4;
    }
    .item-english {
      display: block;
      font-size: 9px;
      color: #555;
      text-transform: uppercase;
      line-height: 1.3;
    }
    .num { text-align: right; vertical-align: middle; }
    tbody tr:last-child td { border-bottom: 1px dashed #000; }

    /* ── Total ── */
    .total-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin: 6px 0 4px;
    }
    .total-label { font-size: 11px; font-weight: bold; }
    .total-value { font-size: 16px; font-weight: bold; }

    /* ── Footer ── */
    .footer { text-align: center; font-size: 10px; margin-top: 8px; }
    .footer .thanks {
      font-family: 'Noto Sans Tamil', sans-serif;
      font-size: 11px;
      font-weight: 700;
    }

    @media print {
      body { width: 100%; padding: 0; }
    }
  </style>
</head>
<body>

  <div class="header">
    <h1>YOUR RESTAURANT</h1>
    <p>உங்கள் உணவகம்</p>
  </div>

  <hr class="divider-dashed" />

  <div class="meta">
    <span>Bill No : <strong>${data.billNo}</strong></span>
    <span>Date     : ${new Date(data.date).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
    <span>Time     : ${new Date(data.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}</span>
  </div>

  <hr class="divider-dashed" />

  <table>
    <thead>
      <tr>
        <th class="th-item">Item</th>
        <th class="th-qty">Qty</th>
        <th class="th-rate">Rate</th>
        <th class="th-amt">Amt</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>

  <div class="total-row">
    <span class="total-label">GRAND TOTAL</span>
    <span class="total-value">&#8377;${Number(data.totalAmount).toFixed(2)}</span>
  </div>

  <hr class="divider-solid" />

  <div class="footer">
    <p class="thanks">நன்றி !!</p>
    <p>Thank you, Visit Again!</p>
  </div>

</body>
</html>`);

        printWindow.document.close();

        // Wait for Noto Sans Tamil to load before printing
        // so Tamil characters actually render in the printout
        const fontLink = printWindow.document.getElementById('tamil-font');
        if (fontLink) {
            fontLink.onload = () => {
                setTimeout(() => { printWindow.print(); printWindow.close(); }, 300);
            };
            // Fallback: if font doesn't load in 3s, print anyway
            setTimeout(() => { printWindow.print(); printWindow.close(); }, 3000);
        } else {
            setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
        }
    };

    return (
        <div className="h-screen flex flex-col overflow-hidden bg-gray-200">
            <Topbar />

            {/* Connectivity Ribbon */}
            <div className={`text-[10px] font-bold px-3 py-1 flex items-center justify-between text-white transition-colors duration-300 ${isOnline ? 'bg-green-600' : 'bg-red-600'}`}>
                <div className="flex items-center gap-1.5">
                    {isOnline ? <HiCloudUpload size={14} /> : <HiCloudDownload size={14} />}
                    <span className="leading-none">{isOnline ? 'CONNECTED TO INTERNET' : 'OFFLINE MODE - LOCAL SAVING ACTIVE'}</span>
                </div>
                {pendingSync > 0 && <span className="animate-pulse">{pendingSync} BILLS WAITING TO SYNC</span>}
            </div>

            <div className="flex-1 flex gap-1 p-1 overflow-hidden">

                {/* ── Left: food search + food list ───────────────────────── */}
                <div className="w-[60%] flex flex-col gap-1 overflow-hidden">

                    {/* Item entry bar */}
                    <div className="bg-white p-3 shadow-sm border-t-4 border-brand-primary">
                        <div className="grid grid-cols-12 gap-2 items-end">
                            <div className="col-span-2">
                                <label className="text-[9px] font-bold text-gray-500 uppercase">Item Code</label>
                                <input
                                    type="text"
                                    className="w-full border p-1.5 text-sm font-bold outline-none focus:border-brand-primary"
                                    value={searchCode}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setSearchCode(val);
                                        const found = allFoods.find(f => String(f.itemcode) === val.trim());
                                        if (found) {
                                            setSelectedFood(found);
                                            setSearchName(found.nameEnglish);
                                            setShowDropdown(false);
                                        } else {
                                            setSelectedFood(null);
                                            setSearchName('');
                                        }
                                    }}
                                />
                            </div>
                            <div className="col-span-5 relative">
                                <label className="text-[9px] font-bold text-gray-500 uppercase">Food Name</label>
                                <input
                                    type="text"
                                    className="w-full border p-1.5 text-sm font-bold outline-none focus:border-brand-primary"
                                    placeholder="Search food name…"
                                    value={searchName}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setSearchName(val);
                                        setSelectedFood(null);
                                        setSearchCode('');
                                        setShowDropdown(val.trim().length > 0);
                                    }}
                                    onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
                                    onFocus={() => searchName.trim().length > 0 && setShowDropdown(true)}
                                />
                                {showDropdown && (() => {
                                    const q = searchName.trim().toLowerCase();
                                    const matches = allFoods.filter(f =>
                                        f.nameEnglish?.toLowerCase().includes(q) ||
                                        f.nameTamil?.includes(searchName.trim())
                                    );
                                    return matches.length > 0 ? (
                                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 shadow-lg z-50 max-h-48 overflow-y-auto">
                                            {matches.map(f => (
                                                <div
                                                    key={f._id}
                                                    onMouseDown={() => {
                                                        setSelectedFood(f);
                                                        setSearchCode(String(f.itemcode));
                                                        setSearchName(f.nameEnglish);
                                                        setShowDropdown(false);
                                                    }}
                                                    className="px-3 py-2 cursor-pointer hover:bg-blue-600 hover:text-white flex items-center gap-3 text-[11px] font-bold"
                                                >
                                                    <span className="text-gray-400 w-8 shrink-0">{f.itemcode}</span>
                                                    <div className="flex flex-col">
                                                        <span lang="ta" style={{ fontFamily: "'Noto Sans Tamil', sans-serif" }} className="leading-tight">
                                                            {f.nameTamil}
                                                        </span>
                                                        <span className="text-[9px] uppercase leading-tight opacity-60">{f.nameEnglish}</span>
                                                    </div>
                                                    <span className="ml-auto">₹{f.price.toFixed(2)}</span>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <div className="absolute top-full left-0 right-0 bg-white border border-gray-200 shadow-lg z-50 px-3 py-2 text-[11px] text-gray-400 font-bold">
                                            No items found
                                        </div>
                                    );
                                })()}
                            </div>
                            <div className="col-span-2">
                                <label className="text-[9px] font-bold text-gray-500 uppercase">Qty</label>
                                <input type="number" className="w-full border p-1.5 text-sm font-bold" value={qty} onChange={(e) => setQty(e.target.value)} />
                            </div>
                            <div className="col-span-3">
                                <button onClick={addToBill} className="w-full bg-brand-primary text-white py-2 text-[11px] font-black uppercase flex items-center justify-center gap-2 hover:bg-opacity-90 active:scale-95 transition-all">
                                    <HiPlus size={16} />
                                    <span className="leading-none">Add Item</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Food catalogue */}
                    <div className="bg-white flex-1 overflow-hidden flex flex-col shadow-sm">
                        <div className="bg-gray-100 p-2 border-b text-[10px] font-black text-brand-primary uppercase grid grid-cols-12">
                            <span className="col-span-2">Code</span>
                            <span className="col-span-8">Product Description</span>
                            <span className="col-span-2 text-right">Rate</span>
                        </div>
                        <div className="overflow-y-auto flex-1">
                            {allFoods.map((f) => (
                                <div key={f._id}
                                    onClick={() => { setSelectedFood(f); setSearchCode(String(f.itemcode)); setSearchName(f.nameEnglish); setShowDropdown(false); }}
                                    className="grid grid-cols-12 text-[11px] font-bold p-2 cursor-pointer hover:bg-blue-600 hover:text-white transition-colors">
                                    <span className="col-span-2">{f.itemcode}</span>
                                    <div className="col-span-8 flex flex-col justify-center">
                                        <span lang="ta" style={{ fontFamily: "'Noto Sans Tamil', sans-serif" }} className="leading-tight">
                                            {f.nameTamil}
                                        </span>
                                        <span className="text-[9px] uppercase leading-tight opacity-60">
                                            {f.nameEnglish}
                                        </span>
                                    </div>
                                    <span className="col-span-2 text-right">{f.price.toFixed(2)}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* ── Right: bill panel ────────────────────────────────────── */}
                <div className="w-[40%] bg-white border shadow-sm flex flex-col">

                    {/* Rebill search */}
                    <div className="p-2 bg-gray-50 border-b flex justify-between items-center">
                        <div className="flex gap-1">
                            <input type="date" className="text-[10px] border p-1 outline-none" value={searchDate} onChange={(e) => setSearchDate(e.target.value)} />
                            <input type="number" className="w-16 text-[10px] border p-1 outline-none" placeholder="Bill #" value={searchBillNo} onChange={(e) => setSearchBillNo(e.target.value)} />
                            <button onClick={handleRebillSearch} className="bg-gray-800 text-white p-1.5 flex items-center justify-center active:bg-black">
                                <HiSearch size={14} />
                            </button>
                        </div>
                        <div className="text-[10px] font-black text-red-600">BILL NO: {currentBillNo}</div>
                    </div>

                    {/* Bill items */}
                    <div className="flex-1 overflow-y-auto">
                        <table className="w-full text-left text-[11px]">
                            <thead className="bg-gray-200 sticky top-0 font-black uppercase">
                                <tr>
                                    <th className="p-2">Items</th>
                                    <th className="p-2 text-right">Price</th>
                                    <th className="p-2 text-center">Qty</th>
                                    <th className="p-2 text-right">Total</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y font-bold">
                                {billItems.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50">
                                        <td className="p-2">
                                            <span lang="ta" style={{ fontFamily: "'Noto Sans Tamil', sans-serif" }} className="block leading-tight text-[12px]">
                                                {item.nameTamil || item.nameEnglish || item.name || '—'}
                                            </span>
                                            {(item.nameEnglish || item.name) && (
                                                <span className="text-[9px] text-gray-400 uppercase leading-tight block">
                                                    {item.nameEnglish || item.name}
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-2 text-right">{Number(item.rate).toFixed(2)}</td>
                                        <td className="p-2 text-center">{item.qty}</td>
                                        <td className="p-2 text-right">₹{Number(item.amount).toFixed(2)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Total + actions */}
                    <div className="p-3 bg-gray-100 border-t">
                        <div className="flex justify-between items-center mb-4">
                            <span className="text-[12px] font-black text-gray-600">GRAND TOTAL</span>
                            <div className="bg-white border-2 border-brand-primary px-4 py-1 text-xl font-black text-brand-primary">
                                ₹{billItems.reduce((acc, i) => acc + i.amount, 0).toFixed(2)}
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            <button
                                onClick={() => { setBillItems([]); setCurrentBillNo('New'); }}
                                className="bg-gray-700 text-white py-3 text-[10px] uppercase font-bold flex items-center justify-center gap-2 hover:bg-gray-800 active:bg-black transition-all">
                                <HiTrash size={14} />
                                <span className="leading-none">Clear</span>
                            </button>
                            <button
                                onClick={handleSaveBill}
                                className="bg-blue-700 text-white py-3 text-[10px] uppercase font-bold flex items-center justify-center gap-2 hover:bg-blue-800 active:bg-blue-900 transition-all">
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
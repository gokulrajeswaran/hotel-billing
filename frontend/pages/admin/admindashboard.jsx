import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-hot-toast';
import Dexie from 'dexie';
import { HiPlus, HiTrash, HiSave, HiSearch, HiCloudUpload, HiCloudDownload, HiX } from 'react-icons/hi';
import Topbar from './components/topbar';
import { API_URL } from '../../components/api';

if (typeof document !== 'undefined' && !document.getElementById('noto-tamil-font')) {
    const link = document.createElement('link');
    link.id = 'noto-tamil-font';
    link.rel = 'stylesheet';
    link.href = 'https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;700;900&display=swap';
    document.head.appendChild(link);
}

const db = new Dexie('RestaurantPOS_DB');
db.version(1).stores({ offlineSales: '++id, billNo, totalAmount, date, status' });

const normalizeItem = (item, foodsLookup = {}) => {
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
    const [selectedVariety, setSelectedVariety] = useState(null);
    const [qty, setQty] = useState(1);
    const [searchDate, setSearchDate] = useState(new Date().toISOString().split('T')[0]);
    const [searchBillNo, setSearchBillNo] = useState('');
    const [currentBillNo, setCurrentBillNo] = useState('New');
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [pendingSync, setPendingSync] = useState(0);
    const [searchName, setSearchName] = useState('');
    const [foodsMap, setFoodsMap] = useState({});

    // Single filter drives both the name input display and the catalogue list
    const [listFilter, setListFilter] = useState('');

    useEffect(() => {
        fetchFoods();
        const handleOnline = () => { setIsOnline(true); syncOfflineData(); };
        const handleOffline = () => setIsOnline(false);
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
            if (remaining === 0) toast.success(`Synced ${successCount} bills successfully!`, { id: 'sync' });
            else toast.error(`Sync partial: ${remaining} bills remaining.`, { id: 'sync' });
        }
    };

    const getEffectivePrice = (food, variety) => {
        if (!variety) return food.price;
        const vp = (food.varietyPrices || []).find(
            vp => String(vp.variety?._id || vp.variety) === String(variety._id)
        );
        return vp?.price ?? food.price;
    };

    // Selecting a food clears the filter so the full list is restored
    const selectFood = (food) => {
        setSelectedFood(food);
        setSelectedVariety(null);
        setSearchCode(String(food.itemcode));
        setSearchName(food.nameEnglish);
        setListFilter(''); // clear filter — show full catalogue with this row highlighted
    };

    const clearSelection = () => {
        setSelectedFood(null);
        setSelectedVariety(null);
        setSearchCode('');
        setSearchName('');
        setListFilter('');
    };

    const addToBill = () => {
        if (!selectedFood) return toast.error('Select an item first');
        if (selectedFood.varieties?.length > 0 && !selectedVariety) {
            return toast.error('Please select a variety for this item');
        }
        const rate = getEffectivePrice(selectedFood, selectedVariety);
        const newItem = {
            foodId: selectedFood._id,
            nameEnglish: selectedFood.nameEnglish,
            nameTamil: selectedFood.nameTamil,
            varietyId: selectedVariety?._id || null,
            varietyName: selectedVariety?.name || null,
            rate,
            qty: parseFloat(qty),
            amount: rate * parseFloat(qty)
        };
        setBillItems(prev => [...prev, newItem]);
        clearSelection();
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
                printBill({ ...res.data, items: billItems });
            } catch (err) {
                saveOfflineFallback(saleData);
            }
        } else {
            saveOfflineFallback(saleData);
        }
        setBillItems([]);
        setCurrentBillNo('New');
        clearSelection();
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
            const enriched = res.data.items.map(item => normalizeItem(item, foodsMap));
            setBillItems(enriched);
            setCurrentBillNo(res.data.billNo);
            toast.success(`Bill #${res.data.billNo} Retrieved`);
        } catch (err) {
            toast.error('Bill not found online');
        }
    };

    const printBill = (data) => {
        const printWindow = window.open('', '_blank', 'width=320,height=700');
        const rows = data.items.map(i => {
            const tamil = i.nameTamil || i.name || '';
            const english = i.nameEnglish || i.name || '';
            const showEng = english && english !== tamil;
            const varietyLabel = i.varietyName ? `<span class="item-variety">${i.varietyName.toUpperCase()}</span>` : '';
            return `
            <tr>
                <td class="item-cell">
                    <span class="item-tamil">${tamil}</span>
                    ${showEng ? `<span class="item-english">${english}</span>` : ''}
                    ${varietyLabel}
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
    body { font-family: 'Courier New', Courier, monospace; font-size: 12px; width: 300px; padding: 12px; color: #000; }
    .header { text-align: center; margin-bottom: 8px; }
    .header h1 { font-size: 16px; font-weight: bold; letter-spacing: 2px; }
    .header p { font-size: 10px; color: #444; margin-top: 2px; }
    .divider-dashed { border: none; border-top: 1px dashed #000; margin: 6px 0; }
    .divider-solid { border: none; border-top: 1px solid #000; margin: 6px 0; }
    .meta { font-size: 10px; margin-bottom: 4px; }
    .meta span { display: block; }
    table { width: 100%; border-collapse: collapse; }
    thead tr th { font-size: 10px; font-weight: bold; text-transform: uppercase; padding: 3px 2px; border-bottom: 1px dashed #000; }
    .th-item { text-align: left; width: 45%; }
    .th-qty { text-align: right; width: 10%; }
    .th-rate { text-align: right; width: 22%; }
    .th-amt { text-align: right; width: 23%; }
    tbody tr td { padding: 4px 2px; vertical-align: top; }
    .item-cell { text-align: left; }
    .item-tamil { display: block; font-family: 'Noto Sans Tamil', sans-serif; font-size: 12px; font-weight: 700; line-height: 1.4; }
    .item-english { display: block; font-size: 9px; color: #555; text-transform: uppercase; line-height: 1.3; }
    .item-variety { display: inline-block; font-size: 8px; font-weight: bold; background: #eee; padding: 0 3px; border-radius: 2px; margin-top: 1px; }
    .num { text-align: right; vertical-align: middle; }
    tbody tr:last-child td { border-bottom: 1px dashed #000; }
    .total-row { display: flex; justify-content: space-between; align-items: center; margin: 6px 0 4px; }
    .total-label { font-size: 11px; font-weight: bold; }
    .total-value { font-size: 16px; font-weight: bold; }
    .footer { text-align: center; font-size: 10px; margin-top: 8px; }
    .footer .thanks { font-family: 'Noto Sans Tamil', sans-serif; font-size: 11px; font-weight: 700; }
    @media print { body { width: 100%; padding: 0; } }
  </style>
</head>
<body>
  <div class="header">
    <h1>MUGAN HOTEL</h1>
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
    <tbody>${rows}</tbody>
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
        const fontLink = printWindow.document.getElementById('tamil-font');
        if (fontLink) {
            fontLink.onload = () => setTimeout(() => { printWindow.print(); printWindow.close(); }, 300);
            setTimeout(() => { printWindow.print(); printWindow.close(); }, 3000);
        } else {
            setTimeout(() => { printWindow.print(); printWindow.close(); }, 500);
        }
    };

    // Catalogue is filtered by whatever is typed in Code or Name inputs
    const filteredFoodList = listFilter.trim()
        ? allFoods.filter(f =>
            f.nameEnglish?.toLowerCase().includes(listFilter.toLowerCase()) ||
            f.nameTamil?.includes(listFilter) ||
            String(f.itemcode).includes(listFilter)
        )
        : allFoods;

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

                {/* ── Left: food search + food list ── */}
                <div className="w-[60%] flex flex-col gap-1 overflow-hidden">

                    {/* Item entry bar */}
                    <div className="bg-white p-3 shadow-sm border-t-4 border-brand-primary">
                        <div className="grid grid-cols-12 gap-2 items-end">

                            {/* Item Code */}
                            <div className="col-span-2">
                                <label className="text-[9px] font-bold text-gray-500 uppercase">Item Code</label>
                                <input
                                    type="text"
                                    className="w-full border p-1.5 text-sm font-bold outline-none focus:border-brand-primary"
                                    value={searchCode}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setSearchCode(val);
                                        setSearchName('');
                                        setListFilter(val); // filter catalogue by code as you type
                                        setSelectedFood(null);
                                        setSelectedVariety(null);
                                        // Exact match → select immediately, clear filter
                                        const found = allFoods.find(f => String(f.itemcode) === val.trim());
                                        if (found) {
                                            setSelectedFood(found);
                                            setSelectedVariety(null);
                                            setSearchName(found.nameEnglish);
                                            setListFilter('');
                                        }
                                    }}
                                />
                            </div>

                            {/* Food Name */}
                            <div className="col-span-4">
                                <label className="text-[9px] font-bold text-gray-500 uppercase">Food Name</label>
                                <input
                                    type="text"
                                    className="w-full border p-1.5 text-sm font-bold outline-none focus:border-brand-primary"
                                    placeholder="Search food name…"
                                    value={searchName}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        setSearchName(val);
                                        setSearchCode('');
                                        setListFilter(val); // filter catalogue by name as you type
                                        setSelectedFood(null);
                                        setSelectedVariety(null);
                                    }}
                                />
                            </div>

                            {/* Variety selector — only when selected food has varieties */}
                            {selectedFood && selectedFood.varieties?.length > 0 && (
                                <div className="col-span-3">
                                    <label className="text-[9px] font-bold text-gray-500 uppercase">Variety</label>
                                    <select
                                        className="w-full border p-1.5 text-sm font-bold outline-none focus:border-brand-primary cursor-pointer"
                                        value={selectedVariety?._id || ''}
                                        onChange={(e) => {
                                            const vid = e.target.value;
                                            if (!vid) { setSelectedVariety(null); return; }
                                            const v = selectedFood.varieties.find(v => (v._id || v) === vid);
                                            const vp = (selectedFood.varietyPrices || []).find(
                                                vp => String(vp.variety?._id || vp.variety) === String(vid)
                                            );
                                            setSelectedVariety({
                                                _id: vid,
                                                name: v?.name || '',
                                                price: vp?.price ?? selectedFood.price
                                            });
                                        }}>
                                        <option value="">Select…</option>
                                        {selectedFood.varieties.map(v => {
                                            const vid = v._id || v;
                                            const vp = (selectedFood.varietyPrices || []).find(
                                                vp => String(vp.variety?._id || vp.variety) === String(vid)
                                            );
                                            const price = vp?.price ?? selectedFood.price;
                                            return (
                                                <option key={vid} value={vid}>
                                                    {v.name} — ₹{price}
                                                </option>
                                            );
                                        })}
                                    </select>
                                </div>
                            )}

                            {/* Qty */}
                            <div className="col-span-1">
                                <label className="text-[9px] font-bold text-gray-500 uppercase">Qty</label>
                                <input
                                    type="number"
                                    className="w-full border p-1.5 text-sm font-bold outline-none focus:border-brand-primary"
                                    value={qty}
                                    onChange={(e) => setQty(e.target.value)}
                                />
                            </div>

                            {/* Add Item button — always last, fixed width */}
                            <div className={selectedFood && selectedFood.varieties?.length > 0 ? 'col-span-2' : 'col-span-5'}>
                                <button
                                    onClick={addToBill}
                                    className="w-full bg-brand-primary text-white py-[7px] text-[11px] font-black uppercase flex items-center justify-center gap-2 hover:bg-opacity-90 active:scale-95 transition-all">
                                    <HiPlus size={16} />
                                    <span className="leading-none">Add Item</span>
                                </button>
                            </div>
                        </div>

                        {/* Selected food info strip — rate shown here, not in the grid */}
                        {selectedFood && (
                            <div className="mt-2 flex items-center gap-2 bg-brand-primary/5 border border-brand-primary/20 rounded px-3 py-1.5">
                                <span className="text-[9px] font-black text-brand-primary bg-brand-primary/10 px-1.5 py-0.5 rounded">
                                    #{selectedFood.itemcode}
                                </span>
                                <span lang="ta" style={{ fontFamily: "'Noto Sans Tamil', sans-serif" }}
                                    className="text-sm font-black text-brand-primary leading-none">
                                    {selectedFood.nameTamil}
                                </span>
                                <span className="text-[10px] text-gray-400 font-bold uppercase">
                                    {selectedFood.nameEnglish}
                                </span>
                                {selectedVariety ? (
                                    <span className="ml-1 text-[10px] font-black text-white bg-brand-primary px-2 py-0.5 rounded-sm uppercase">
                                        {selectedVariety.name}
                                    </span>
                                ) : null}
                                {/* Rate shown here */}
                                <span className="ml-auto text-[11px] font-black text-brand-primary">
                                    ₹{getEffectivePrice(selectedFood, selectedVariety).toFixed(2)}
                                </span>
                                <button
                                    onClick={clearSelection}
                                    className="text-gray-300 hover:text-red-500 cursor-pointer">
                                    <HiX size={14} />
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Food catalogue — filtered by Code/Name inputs above, no separate filter bar */}
                    <div className="bg-white flex-1 overflow-hidden flex flex-col shadow-sm">
                        <div className="bg-gray-100 p-2 border-b text-[10px] font-black text-brand-primary uppercase grid grid-cols-12">
                            <span className="col-span-2">Code</span>
                            <span className="col-span-7">Product Description</span>
                            <span className="col-span-3 text-right">Rate / Varieties</span>
                        </div>
                        <div className="overflow-y-auto flex-1">
                            {filteredFoodList.map((f) => {
                                const isSelected = selectedFood?._id === f._id;
                                const hasVarieties = f.varieties?.length > 0;
                                return (
                                    <div
                                        key={f._id}
                                        onClick={() => selectFood(f)}
                                        className={`grid grid-cols-12 text-[11px] font-bold p-2 cursor-pointer transition-colors
                                            ${isSelected ? 'bg-brand-primary text-white' : 'hover:bg-blue-600 hover:text-white'}`}>
                                        <span className="col-span-2">{f.itemcode}</span>
                                        <div className="col-span-7 flex flex-col justify-center">
                                            <span lang="ta" style={{ fontFamily: "'Noto Sans Tamil', sans-serif" }} className="leading-tight">
                                                {f.nameTamil}
                                            </span>
                                            <span className="text-[9px] uppercase leading-tight opacity-60">{f.nameEnglish}</span>
                                        </div>
                                        <div className="col-span-3 text-right flex flex-col items-end justify-center gap-0.5">
                                            {hasVarieties ? (
                                                <div className="flex flex-wrap justify-end gap-0.5">
                                                    {f.varieties.map(v => {
                                                        const vid = v._id || v;
                                                        const vp = (f.varietyPrices || []).find(
                                                            vp => String(vp.variety?._id || vp.variety) === String(vid)
                                                        );
                                                        return (
                                                            <span key={vid}
                                                                className={`text-[8px] font-black px-1 py-0.5 rounded-sm
                                                                    ${isSelected ? 'bg-white/20 text-white' : 'bg-gray-100 text-brand-primary'}`}>
                                                                {v.name} ₹{vp?.price ?? f.price}
                                                            </span>
                                                        );
                                                    })}
                                                </div>
                                            ) : (
                                                <span>{f.price.toFixed(2)}</span>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            {filteredFoodList.length === 0 && (
                                <div className="p-4 text-center text-[11px] text-gray-300 font-bold uppercase">
                                    No items match
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Right: bill panel ── */}
                <div className="w-[40%] bg-white border shadow-sm flex flex-col">
                    {/* Rebill search */}
                    <div className="p-2 bg-gray-50 border-b flex justify-between items-center">
                        <div className="flex gap-1">
                            <input type="date" className="text-[10px] border p-1 outline-none"
                                value={searchDate} onChange={(e) => setSearchDate(e.target.value)} />
                            <input type="number" className="w-16 text-[10px] border p-1 outline-none"
                                placeholder="Bill #" value={searchBillNo}
                                onChange={(e) => setSearchBillNo(e.target.value)} />
                            <button onClick={handleRebillSearch}
                                className="bg-gray-800 text-white p-1.5 flex items-center justify-center active:bg-black">
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
                                            <span lang="ta" style={{ fontFamily: "'Noto Sans Tamil', sans-serif" }}
                                                className="block leading-tight text-[12px]">
                                                {item.nameTamil || item.nameEnglish || item.name || '—'}
                                            </span>
                                            {(item.nameEnglish || item.name) && (
                                                <span className="text-[9px] text-gray-400 uppercase leading-tight block">
                                                    {item.nameEnglish || item.name}
                                                </span>
                                            )}
                                            {item.varietyName && (
                                                <span className="text-[8px] font-black text-white bg-brand-primary px-1.5 py-0.5 rounded-sm uppercase inline-block mt-0.5">
                                                    {item.varietyName}
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
                            <button onClick={() => { setBillItems([]); setCurrentBillNo('New'); }}
                                className="bg-gray-700 text-white py-3 text-[10px] uppercase font-bold flex items-center justify-center gap-2 hover:bg-gray-800 active:bg-black transition-all">
                                <HiTrash size={14} />
                                <span className="leading-none">Clear</span>
                            </button>
                            <button onClick={handleSaveBill}
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
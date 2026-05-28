import Sale from '../models/sale.js';

// Helper: parse a date string into start/end of that day
const dayRange = (dateStr) => {
    const start = new Date(dateStr);
    start.setHours(0, 0, 0, 0);
    const end = new Date(dateStr);
    end.setHours(23, 59, 59, 999);
    return { start, end };
};

// ── Date Wise Collection Summary ─────────────────────────────────────────────
// GET /api/reports/datewise-collection?fromDate=YYYY-MM-DD&toDate=YYYY-MM-DD
export const datewiseCollection = async (req, res) => {
    try {
        const { fromDate, toDate } = req.query;
        if (!fromDate || !toDate)
            return res.status(400).json({ message: 'fromDate and toDate are required' });

        const start = new Date(fromDate); start.setHours(0, 0, 0, 0);
        const end   = new Date(toDate);   end.setHours(23, 59, 59, 999);

        const results = await Sale.aggregate([
            { $match: { date: { $gte: start, $lte: end } } },
            {
                $group: {
                    _id: { $dateToString: { format: '%Y-%m-%d', date: '$date' } },
                    totalAmount: { $sum: '$totalAmount' },
                    billCount:   { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } },
            { $project: { _id: 0, date: '$_id', totalAmount: 1, billCount: 1 } }
        ]);

        res.status(200).json(results);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ── Food Wise Collection Summary ─────────────────────────────────────────────
// GET /api/reports/foodwise-collection?fromDate=YYYY-MM-DD&toDate=YYYY-MM-DD
export const foodwiseCollection = async (req, res) => {
    try {
        const { fromDate, toDate } = req.query;
        if (!fromDate || !toDate)
            return res.status(400).json({ message: 'fromDate and toDate are required' });

        const start = new Date(fromDate); start.setHours(0, 0, 0, 0);
        const end   = new Date(toDate);   end.setHours(23, 59, 59, 999);

        const results = await Sale.aggregate([
            { $match: { date: { $gte: start, $lte: end } } },
            { $unwind: '$items' },
            {
                $group: {
                    _id: {
                        foodId:      '$items.foodId',
                        nameEnglish: { $ifNull: ['$items.nameEnglish', '$items.name'] },
                        nameTamil:   { $ifNull: ['$items.nameTamil',   ''] }
                    },
                    totalQty:    { $sum: '$items.qty' },
                    totalAmount: { $sum: '$items.amount' }
                }
            },
            { $sort: { totalAmount: -1 } },
            {
                $project: {
                    _id: 0,
                    foodId:      '$_id.foodId',
                    nameEnglish: '$_id.nameEnglish',
                    nameTamil:   '$_id.nameTamil',
                    totalQty:    1,
                    totalAmount: 1
                }
            }
        ]);

        res.status(200).json(results);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ── Bill Wise Collection Summary ─────────────────────────────────────────────
// GET /api/reports/billwise-collection?fromDate=YYYY-MM-DD&toDate=YYYY-MM-DD
export const billwiseCollection = async (req, res) => {
    try {
        const { fromDate, toDate } = req.query;
        if (!fromDate || !toDate)
            return res.status(400).json({ message: 'fromDate and toDate are required' });

        const start = new Date(fromDate); start.setHours(0, 0, 0, 0);
        const end   = new Date(toDate);   end.setHours(23, 59, 59, 999);

        const results = await Sale.find(
            { date: { $gte: start, $lte: end } },
            { billNo: 1, date: 1, totalAmount: 1, items: 1, _id: 0 }
        ).sort({ date: 1, billNo: 1 });

        const formatted = results.map(sale => ({
            billNo:      sale.billNo,
            date:        new Date(sale.date).toISOString().split('T')[0],
            time:        new Date(sale.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            itemCount:   sale.items?.length ?? 0,
            totalAmount: sale.totalAmount
        }));

        res.status(200).json(formatted);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// ── Day Book ──────────────────────────────────────────────────────────────────
// GET /api/reports/daybook?date=YYYY-MM-DD
export const dayBook = async (req, res) => {
    try {
        const { date } = req.query;
        if (!date)
            return res.status(400).json({ message: 'date is required' });

        const { start, end } = dayRange(date);

        const bills = await Sale.find(
            { date: { $gte: start, $lte: end } },
            { billNo: 1, date: 1, totalAmount: 1, items: 1, _id: 0 }
        ).sort({ billNo: 1 });

        const formatted = bills.map(sale => ({
            billNo:      sale.billNo,
            date:        new Date(sale.date).toISOString().split('T')[0],
            time:        new Date(sale.date).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
            itemCount:   sale.items?.length ?? 0,
            totalAmount: sale.totalAmount
        }));

        const summary = {
            totalBills:  formatted.length,
            totalAmount: formatted.reduce((sum, b) => sum + b.totalAmount, 0)
        };

        res.status(200).json({ bills: formatted, summary });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
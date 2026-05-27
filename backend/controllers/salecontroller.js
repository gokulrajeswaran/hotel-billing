import Sale from '../models/sale.js';
import Counter from '../models/counter.js';

export const saveSale = async (req, res) => {
  try {
    const today = new Date().setHours(0, 0, 0, 0);
    
    // 1. Get or Reset Daily Counter
    // We use a unique ID for each day: e.g., "bill_2026-05-27"
    const dateId = `bill_${new Date().toISOString().split('T')[0]}`;
    
    const counter = await Counter.findOneAndUpdate(
      { id: dateId },
      { $inc: { seq: 1 } },
      { returnDocument: 'after', upsert: true }
    );

    const newSale = new Sale({
      billNo: counter.seq,
      items: req.body.items,
      totalAmount: req.body.totalAmount,
      date: new Date()
    });

    await newSale.save();
    res.status(201).json(newSale);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getSaleByDetails = async (req, res) => {
  try {
    const { date, billNo } = req.query;
    const start = new Date(date);
    start.setHours(0,0,0,0);
    const end = new Date(date);
    end.setHours(23,59,59,999);

    const sale = await Sale.findOne({
      billNo: parseInt(billNo),
      date: { $gte: start, $lte: end }
    });
    
    if (!sale) return res.status(404).json({ message: "Bill not found" });
    res.status(200).json(sale);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
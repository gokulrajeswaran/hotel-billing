import Food from '../models/food.js';

export const translatefood = async (req, res) => {
  const { name } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ message: 'Name is required' });
  }
  try {
    // Google Translate unofficial endpoint — no API key required
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=ta&dt=t&q=${encodeURIComponent(name.trim())}`;
    const response = await fetch(url);
    const data = await response.json();
    // Response shape: [ [ ["translated", "original", ...], ... ], ... ]
    const tamil = data?.[0]?.map(chunk => chunk?.[0]).filter(Boolean).join('').trim();
    if (!tamil) throw new Error('Empty translation');
    res.status(200).json({ tamil });
  } catch (err) {
    res.status(500).json({ message: 'Translation failed', error: err.message });
  }
};

export const getfoods = async (req, res) => {
  try {
    const foods = await Food.find()
      .populate('category', 'name')
      .populate('varieties', 'name')
      .sort({ createdAt: -1 });
    res.status(200).json(foods);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addfood = async (req, res) => {
  try {
    const { itemcode } = req.body;
    if (!itemcode || String(itemcode).trim() === '')
      return res.status(400).json({ message: 'Item code is required' });

    const existing = await Food.findOne({ itemcode: String(itemcode).trim() });
    if (existing)
      return res.status(409).json({ message: `Item code "${itemcode}" is already in use` });

    const newFood = new Food(req.body);
    await newFood.save();
    res.status(201).json(newFood);
  } catch (err) {
    res.status(400).json({ message: 'Error adding food item' });
  }
};

export const updatefood = async (req, res) => {
  try {
    const updated = await Food.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deletefood = async (req, res) => {
  try {
    await Food.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Food item deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
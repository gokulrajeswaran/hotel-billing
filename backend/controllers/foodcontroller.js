import Food from '../models/food.js';

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
    const newFood = new Food(req.body);
    await newFood.save();
    res.status(201).json(newFood);
  } catch (err) {
    res.status(400).json({ message: "Error adding food item" });
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
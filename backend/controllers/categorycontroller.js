import Category from '../models/category.js';

export const getcategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });
    res.status(200).json(categories);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addcategory = async (req, res) => {
  try {
    const newCategory = new Category({ name: req.body.name });
    await newCategory.save();
    res.status(201).json(newCategory);
  } catch (err) {
    res.status(400).json({ message: "Category already exists or invalid data" });
  }
};

export const updatecategory = async (req, res) => {
  try {
    const updated = await Category.findByIdAndUpdate(
      req.params.id, 
      { name: req.body.name }, 
      { new: true }
    );
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deletecategory = async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Category deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
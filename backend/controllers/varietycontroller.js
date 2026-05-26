import Variety from '../models/variety.js';

export const getvarieties = async (req, res) => {
  try {
    const varieties = await Variety.find().sort({ createdAt: -1 });
    res.status(200).json(varieties);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const addvariety = async (req, res) => {
  try {
    const newVariety = new Variety({ name: req.body.name });
    await newVariety.save();
    res.status(201).json(newVariety);
  } catch (err) {
    res.status(400).json({ message: "Variety already exists or invalid data" });
  }
};

export const updatevariety = async (req, res) => {
  try {
    const updated = await Variety.findByIdAndUpdate(
      req.params.id, 
      { name: req.body.name }, 
      { new: true }
    );
    res.status(200).json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

export const deletevariety = async (req, res) => {
  try {
    await Variety.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Variety deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
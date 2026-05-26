import mongoose from 'mongoose';

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    lowercase: true, // Stores everything in lowercase for consistency
    unique: true
  }
}, { timestamps: true });

export default mongoose.model('category', categorySchema);
import mongoose from 'mongoose';

const varietySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true
  }
}, { timestamps: true });

export default mongoose.model('variety', varietySchema);
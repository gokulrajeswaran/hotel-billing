import mongoose from 'mongoose';

const saleSchema = new mongoose.Schema({
  billNo: { type: Number, required: true },
  date: { type: Date, default: Date.now },
  items: [{
    foodId: { type: mongoose.Schema.Types.ObjectId, ref: 'food' },
    name: String,
    nameEnglish: String,
    nameTamil: String,
    varietyId: { type: mongoose.Schema.Types.ObjectId, ref: 'variety', default: null },
    varietyName: { type: String, default: null },
    rate: Number,
    qty: Number,
    amount: Number
  }],
  totalAmount: { type: Number, required: true },
  paymentType: { type: String, default: 'cash' }
}, { timestamps: true });

saleSchema.index({ date: 1, billNo: 1 });

export default mongoose.model('sale', saleSchema);

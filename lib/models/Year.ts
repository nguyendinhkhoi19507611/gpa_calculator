import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IYear extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  order: number;
  createdAt: Date;
}

const YearSchema = new Schema<IYear>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Year: Model<IYear> = mongoose.models.Year || mongoose.model<IYear>('Year', YearSchema);
export default Year;

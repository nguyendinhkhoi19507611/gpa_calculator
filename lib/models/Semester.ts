import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISemester extends Document {
  _id: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  yearId: mongoose.Types.ObjectId;
  name: string;
  targetCredits: number;
  order: number;
  createdAt: Date;
}

const SemesterSchema = new Schema<ISemester>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    yearId: { type: Schema.Types.ObjectId, ref: 'Year', required: true, index: true },
    name: { type: String, required: true, trim: true },
    targetCredits: { type: Number, required: true, min: 1 },
    order: { type: Number, default: 0 },
  },
  { timestamps: true }
);

const Semester: Model<ISemester> =
  mongoose.models.Semester || mongoose.model<ISemester>('Semester', SemesterSchema);
export default Semester;

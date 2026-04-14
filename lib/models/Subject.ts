import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ISubject extends Document {
  _id: mongoose.Types.ObjectId;
  semesterId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  name: string;
  credits: number;
  grade10: number;
  grade4: number;
  letter: string;
  type: string;
  formula: string;
  rawInputs?: any;
}

const SubjectSchema = new Schema<ISubject>(
  {
    semesterId: { type: Schema.Types.ObjectId, ref: 'Semester', required: true, index: true },
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    name: { type: String, required: true, trim: true },
    credits: { type: Number, required: true, min: 1 },
    grade10: { type: Number, required: true, min: 0, max: 10 },
    grade4: { type: Number, required: true, min: 0, max: 4 },
    letter: { type: String, required: true },
    type: { type: String, required: true },
    formula: { type: String, default: '' },
    rawInputs: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

const Subject: Model<ISubject> =
  mongoose.models.Subject || mongoose.model<ISubject>('Subject', SubjectSchema);
export default Subject;

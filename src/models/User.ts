import mongoose, { Schema, Document, model, models } from 'mongoose';

export interface IUser extends Document {
  clerkId: string;
  email: string;
  name?: string;
  image?: string;
  createdAt: Date;
}

const UserSchema = new Schema<IUser>({
  clerkId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String },
  image: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export const User = models.User || model<IUser>('User', UserSchema);

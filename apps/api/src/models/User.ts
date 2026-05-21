import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  email: string;
  passwordHash: string;
  passwordChangedAt?: Date;
  name: string;
  role: 'USER' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>({
  email: { type: String, required: true, unique: true },
  passwordHash: { type: String, required: true },
  passwordChangedAt: { type: Date },
  name: { type: String, required: true },
  role: { type: String, enum: ['USER', 'ADMIN'], default: 'USER' },
}, { timestamps: true });

UserSchema.pre('save', function updatePasswordChangedAt(next) {
  if (this.isModified('passwordHash')) {
    this.passwordChangedAt = new Date();
  }
  next();
});

export default mongoose.model<IUser>('User', UserSchema);

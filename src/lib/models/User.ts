import mongoose, { Schema } from 'mongoose';

const userSchema = new Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    passwordHash: {
      type: String,
      required: false,
    },
    // Legacy field for migration only
    password: {
      type: String,
      required: false,
    },
    fullName: {
      type: String,
      required: true,
    },
    grade: {
      type: Number,
      default: null,
    },
    classSection: {
      type: String,
      default: null,
    },
    role: {
      type: String,
      enum: ['admin', 'student', 'parent'],
      required: true,
    },
    phone: {
      type: String,
      default: null,
    },
    email: {
      type: String,
      default: null,
      lowercase: true,
      trim: true,
    },
    childName: {
      type: String,
      default: null,
    },
    availability: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ['active', 'inactive'],
      default: 'active',
    },
  },
  { timestamps: true }
);

export const User = mongoose.models.User || mongoose.model('User', userSchema);

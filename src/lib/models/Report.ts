import mongoose, { Schema } from 'mongoose';

const reportSchema = new Schema(
  {
    category: {
      type: String,
      enum: [
        'peer_bullying',
        'relationship_abuse',
        'mental_stress',
        'family_violence',
        'cyberbullying',
        'other',
      ],
      required: true,
    },
    severity: {
      type: String,
      enum: ['high', 'medium', 'low'],
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reporterSnapshot: {
      fullName: {
        type: String,
        default: null,
      },
      grade: {
        type: Number,
        default: null,
      },
      classSection: {
        type: String,
        default: null,
      },
    },
    isUrgent: {
      type: Boolean,
      default: false,
    },
    attachments: [
      {
        type: String,
      },
    ],
    status: {
      type: String,
      enum: ['new', 'in-progress', 'resolved', 'archived'],
      default: 'new',
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    // Legacy field (kept for backward compatibility)
    studentName: {
      type: String,
      default: null,
    },
    notes: {
      type: String,
      default: null,
    },
  },
  { timestamps: true }
);

export const Report = mongoose.models.Report || mongoose.model('Report', reportSchema);

import mongoose from 'mongoose';

const historySchema = new mongoose.Schema({
  action: {
    type: String,
    required: true,
  },
  previousStatus: String,
  newStatus: String,
  changedBy: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  remarks: String,
});

const requestSchema = new mongoose.Schema(
  {
    requestId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Service',
    },
    serviceName: {
      type: String,
      required: true,
    },
    subject: {
      type: String,
      required: [true, 'Subject is required'],
      trim: true,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
    },
    department: {
      type: String,
      required: true,
    },
    assignedTo: {
      name: { type: String, default: 'Unassigned' },
      role: { type: String, default: '' },
      department: { type: String, default: '' },
    },
    priority: {
      type: String,
      enum: ['Normal', 'High', 'Urgent'],
      default: 'Normal',
    },
    status: {
      type: String,
      enum: ['Pending', 'Assigned', 'In Progress', 'Completed'],
      default: 'Pending',
    },
    location: {
      type: String,
      default: '',
    },
    attachmentName: {
      type: String,
      default: '',
    },
    attachmentUrl: {
      type: String,
      default: '',
    },
    estimatedCompletion: {
      type: Date,
    },
    completedAt: {
      type: Date,
    },
    remarks: {
      type: String,
      default: '',
    },
    history: [historySchema],
  },
  {
    timestamps: true,
  }
);

// Virtual for checking if request is overdue
requestSchema.virtual('isOverdue').get(function () {
  if (this.status === 'Completed') return false;
  if (!this.estimatedCompletion) return false;
  return new Date() > new Date(this.estimatedCompletion);
});

const Request = mongoose.models.Request || mongoose.model('Request', requestSchema);
export default Request;

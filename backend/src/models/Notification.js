import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  message: {
    type: String,
    required: true,
  },
  request: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Request',
  },
  requestId: {
    type: String,
  },
  type: {
    type: String,
    enum: ['info', 'success', 'warning', 'escalation'],
    default: 'info',
  },
  read: {
    type: Boolean,
    default: false,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Notification = mongoose.models.Notification || mongoose.model('Notification', notificationSchema);
export default Notification;

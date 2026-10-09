import mongoose from 'mongoose';

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Service name is required'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Description is required'],
  },
  department: {
    type: String,
    required: [true, 'Default Department is required'],
    trim: true,
  },
  icon: {
    type: String,
    default: 'HelpCircle',
  },
  slaDays: {
    type: Number,
    default: 3,
  },
  active: {
    type: Boolean,
    default: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

const Service = mongoose.models.Service || mongoose.model('Service', serviceSchema);
export default Service;

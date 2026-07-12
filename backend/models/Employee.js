const mongoose = require('mongoose');

const employeeSchema = new mongoose.Schema({
  employeeId: {
    type: String,
    unique: true
  },
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Please provide a phone number'],
    trim: true
  },
  department: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  designation: {
    type: String,
    required: [true, 'Please provide a designation'],
    trim: true
  },
  salary: {
    type: Number,
    required: [true, 'Please provide a salary']
  },
  joiningDate: {
    type: Date,
    required: [true, 'Please provide a joining date']
  },
  status: {
    type: String,
    enum: ['Active', 'Inactive'],
    default: 'Active'
  },
  profileImage: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Auto-generate employee ID before saving
employeeSchema.pre('save', async function(next) {
  if (!this.isNew) {
    next();
  }
  
  const count = await mongoose.model('Employee').countDocuments();
  const year = new Date().getFullYear();
  this.employeeId = `EMP${year}${String(count + 1).padStart(4, '0')}`;
  next();
});

module.exports = mongoose.model('Employee', employeeSchema);

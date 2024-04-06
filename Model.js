import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true
  },
  otp: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now,
    expires: 300
  }
});

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  salt: {
    type: String,
    required: true
  }
});

const contactSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  message: {
    type: String,
    required: true
  }
});

const IncidentReportSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId, // Reference to the User model
    ref: 'User',
    required: true
  },
  fullName: {
    type: String,
    required: true
  },
  age: {
    type: Number,
    required: true
  },
  gender: {
    type: String,
    enum: ['Male', 'Female', 'Other'],
    required: true
  },
  mobileNumber: {
    type: String,
    required: true
  },
  emailAddress: {
    type: String,
    required: true
  },
  address: {
    type: String,
    required: true
  },
  typeOfCrime: {
    type: String,
    required: true
  },
  dateTimeOfIncident: {
    type: Date,
    required: false
  },
  stateUTS: {
    type: String,
    required: true
  },
  incidentOccur: {
    type: String,
    required: true
  },
  suspectName: {
    type: String
  },
  suspectDetails: {
    type: String
  },
  description: {
    type: String,
    required: true
  },
  supportingDocuments: {
    type: String
  }
});

export const Contact = mongoose.model('Contact', contactSchema);
export const IncidentReport = mongoose.model('IncidentReport', IncidentReportSchema);
export const User = mongoose.model('User', userSchema);
export const OTP = mongoose.model('OTP', otpSchema);
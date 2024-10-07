import mongoose, { Schema, Document, Model } from "mongoose";

const workSpaceSchema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true
  },
  logo: {
    type: String,
    require: true,
  },
  // Workspace Admin
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  // Super Admin
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  isActive: {
    type: Boolean,
    required: true,
  },
},
  { timestamps: true }
);

export const Workspace = mongoose.model("Workspace", workSpaceSchema);

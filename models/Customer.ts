import mongoose, { Schema, Document, Model } from "mongoose";

interface CustomerDoc extends Document {
  firstName: string;
  lastName: string;
  adress: string;
  phone: string;
  email: string;
  password: string;
  salt: string;
  verified: boolean;
  otp: number;
  otp_expiry: Date;
  lat: number;
  lng: number;
}

const CustomerSchema = new Schema({
  firstName: {type: String},
  lastName: {type: String},
  adress: {type: String},
  phone: {type: String, required: true},
  email: {type: String, required: true},
  password: {type: String, reqired: true},
  salt: {type: String, reqired: true},
  verified: {type: Boolean, reqired: true},
  otp: {type: Number, reqired: true},
  otp_expiry: {type: Date, reqired: true},
  lat: {type: Number},
  lng: {type: Number},
},{
  toJSON: {
    transform(doc, ret) {
      delete ret.password,
      delete ret.salt,
      delete ret.__v,
      delete ret.createdAt,
      delete ret.updatedAt
    }

  },
  timestamps: true
});


const Customer = mongoose.model<CustomerDoc>('customer', CustomerSchema);

export {Customer}

import mongoose, { Schema, Document, Model } from "mongoose";
import { OrderDoc } from "./Order";

interface DeliveryUserDoc extends Document {
  firstName: string;
  lastName: string;
  adress: string;
  pincode: string;
  phone: string;
  email: string;
  password: string;
  salt: string;
  verified: boolean;
  lat: number;
  lng: number;
  isAvailable: boolean;
}

const DeliveryUserSchema = new Schema({
  firstName: {type: String},
  lastName: {type: String},
  adress: {type: String},
  pincode: {type: String},
  phone: {type: String, required: true},
  email: {type: String, required: true},
  password: {type: String, reqired: true},
  salt: {type: String, reqired: true},
  verified: {type: Boolean, required: true},
  lat: {type: Number},
  lng: {type: Number},
  isAvailable: { type: Boolean }
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


const DeliveryUser = mongoose.model<DeliveryUserDoc>('delivery_user', DeliveryUserSchema);

export {DeliveryUser}

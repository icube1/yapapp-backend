import mongoose, { Schema, Document, Model } from "mongoose";

interface VendorDoc extends Document {
  name: string;
  ownerName: string;
  foodType: [string];
  pincode: string;
  adress: string;
  phone: string;
  email: string;
  password: string;
  salt: string;
  serviceAvailable: boolean;
  coverImages: [string];
  rating: string;
  //foods: any;
}

const VendorSchema = new Schema({
  name: {type: String, required: true},
  ownerName: {type: String, required: true},
  foodType: {type: [String]},
  pincode: {type: String, required: true},
  adress: {type: String},
  phone: {type: String, required: true},
  email: {type: String, required: true},
  password: {type: String, reqired: true},
  salt: {type: String, reqired: true},
  serviceAvailable: {type: Boolean},
  coverImages: {type: [String]},
  rating: {type: Number},
  // foods: [{
  //   type: mongoose.SchemaTypes.ObjectId,
  //   ref: 'food'
  // }]
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


const Vendor = mongoose.model<VendorDoc>('vendor', VendorSchema);

export {Vendor}

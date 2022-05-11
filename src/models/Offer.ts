import mongoose, { Schema, Document } from "mongoose";

export interface OfferDoc extends Document {
  offerType: string; // Для конкретного продавца или общий
  vendors: [any];//['id1', 'id2'....]
  title: string;
  description: string;
  minValue: number; // минимальная сумма для активации скидки
  offerAmount: number; // сумма скидки
  startValidity: Date; //Дата начала акции
  endValidity: Date; // конец акции
  promocode: string; // промокод (DODO200)
  promoType: string; // скидка для: один пользователь/всех/банка/карты
  bank: [any];
  bins: [any];
  pincode: string;
  isActive: boolean;
}

const OfferSchema = new Schema({
  offerType: {type: String, required: true},
  vendors: [{
    type: Schema.Types.ObjectId, ref: 'vendor'
  }],
  title: {type: String, required: true},
  description: String,
  minValue: Number,
  offerAmount: {type: Number, required: true},
  startValidity: Date,
  endValidity: Date,
  promocode: {type: String, required: true},
  promoType: {type: String, required: true},
  bank: {type: [
    { type: String }
  ]},
  bins: {type: Number},
  pincode: {type: String, required: true},
  isActive: Boolean,

},{
  toJSON: {
    transform(doc, ret) {
      delete ret.__v;
    }
  },
  timestamps: true
})

const Offer = mongoose.model<OfferDoc>('offer', OfferSchema);

export {Offer}

import mongoose, { Schema, Document } from "mongoose";

export interface OrderDoc extends Document {
  orderID: string, //12345657
  vendorID: string,
  items: [any], // [{ food, unit: 1 }]
  totalAmount: number, //456
  paidAmount: number,
  orderDate: Date,
  orderStatus: string, // определение статуса заказа : заказ принят / готовим / в пути / доставлено / отменено / ошибка
  remarks: string,
  deliveryID: string,
  readyTime: number //max 90 mins

}

const OrderSchema = new Schema({
  orderID: {type: String, required: true},
  vendorID: {type: String},
  items: [
    {
      food: { type: Schema.Types.ObjectId, ref: "food", required: true },
      unit: { type: Number, required: true }
    }
  ],
  totalAmount: {type: Number, required: true},
  paidAmount: { type: Number },
  orderDate: {type: Date},
  orderStatus: {type: String},
  remarks: {type: String},
  deliveryID: {type: String},
  appliedOffers: {type: Boolean},
  offerID: {type: String},
  readyTime: {type: Number}

},{
  toJSON: {
    transform(doc, ret) {
      delete ret.__v,
      delete ret.createdAt,
      delete ret.updatedAt
    }
  },
  timestamps: true
})

const Order = mongoose.model<OrderDoc>('order', OrderSchema);

export {Order}

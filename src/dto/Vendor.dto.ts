export interface CreateVendorInput{
  name: string;
  ownerName: string;
  foodType: [string];
  pincode: string;
  adress: string;
  phone: string;
  email: string;
  password: string;
}

export interface EditVendorInputs {
  name: string;
  adress: string;
  phone: string;
  foodTypes: [string];
}
export interface VendorLoginInputs {
  email: string;
  password: string;
}

export interface VendorPayload {
  _id: string;
  email: string;
  name: string;
  foodTypes: [string];
}

export interface CreateOfferInputs {
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


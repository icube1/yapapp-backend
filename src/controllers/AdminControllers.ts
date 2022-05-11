import { NextFunction, Request, Response } from "express";
import { CreateVendorInput } from "../dto";
import { DeliveryUser, Transaction, Vendor } from "../models";
import { GeneratePassword, GenerateSalt } from "../utility";




export const FindVendor = async (id:string | undefined, email?: string) => {
  if(email) {
    return await Vendor.findOne({ email: email});
  }
  return await Vendor.findById(id);
}



export const CreateVendor = async (req:Request,res: Response, next: NextFunction) => {
  const { name, ownerName, adress, pincode, foodType, email, password, phone } = <CreateVendorInput>req.body;

  const existingVendor = await FindVendor('', email);

  if(existingVendor !== null) {
    return res.json({message: 'A vendor with this email ID already existing'})
  }

  //сгенерировать соль
  const salt = await GenerateSalt();
  //солью зашифровать пароль
  const userPassword = await GeneratePassword(password, salt);



  const createdVendor = await Vendor.create ({
    name: name,
    adress: adress,
    pincode: pincode,
    foodType: foodType,
    email: email,
    password: userPassword,
    salt: salt,
    ownerName: ownerName,
    phone: phone,
    rating: 0,
    serviceAvailable: false,
    coverImages: [],
    foods: [],
    lat: 0,
    lng: 0
  })

  return res.json(createdVendor)
}

export const GetVendors = async (req:Request,res: Response, next: NextFunction) => {
  const vendors = await Vendor.find();

  if (vendors !== null) {
    return res.json(vendors);
  }
  return res.json({message: 'Vendors data is not available or empty'})
}

export const GetVendorById = async (req:Request,res: Response, next: NextFunction) => {
  const vendorId = req.params.id;
  const vendor = await FindVendor(vendorId);

  if (vendor !== null) {
    return  res.json(vendor)
  }
  return res.json({message: 'Transactions not found'})
}


export const GetTransactions = async (req:Request,res: Response, next: NextFunction) => {

  const transactions = await Transaction.find();

  if(transactions) {
    return res.status(200).json(transactions);
  }

  return res.json({message: 'vendor not found'})
}

export const GetTransactionById = async (req:Request,res: Response, next: NextFunction) => {

  const id = req.params.id;
  const transaction = await Transaction.findById(id);

  if(transaction) {
    return res.status(200).json(transaction);
  }

  return res.json({message: 'Transaction not found'})
}

export const VerifyDeliveryUser = async (req:Request,res: Response, next: NextFunction) => {
  const { _id, status } = req.body;

  if(_id) {
    const profile = await DeliveryUser.findById(_id);

    if(profile) {
      profile.verified = status;
      const result = await profile.save();

      return res.status(200).json(result);
    }
  }
  return res.status(400).json({ message: 'не удалось подтвердить профиль доставщика' })
}

export const GetDeliveryUsers = async (req:Request,res: Response, next: NextFunction) => {
    const deliveryUsers = await DeliveryUser.find();

    if(deliveryUsers) {
      return res.status(200).json(deliveryUsers);
    }
  return res.status(400).json({ message: 'не удалось получить профили доставщиков' })
}


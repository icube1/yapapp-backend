import { NextFunction, Request, Response } from "express";
import { CreateVendorInput } from "../dto";
import { Vendor } from "../models";
import { GeneratePassword, GenerateSalt } from "../utility";

export const CreateVendor = async (req:Request,res: Response, next: NextFunction) => {
  const { name, ownerName, adress, pincode, foodType, email, password, phone } = <CreateVendorInput>req.body;

  const existingVendor = await Vendor.findOne({ email: email });

  if(existingVendor !== null) {
    return res.json({message: 'A vendor with this email ID already existing'})
  }

  //сгенерировать соль
  const salt = await GenerateSalt();
  const userPassword = await GeneratePassword(password, salt);


  //солью зашифровать пароль

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
    coverImages: []
  })

  return res.json(createdVendor)
}

export const GetVendors = async (req:Request,res: Response, next: NextFunction) => {

}

export const GetVendorById = async (req:Request,res: Response, next: NextFunction) => {

}

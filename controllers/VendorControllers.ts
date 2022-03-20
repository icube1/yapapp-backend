import { NextFunction, Request, Response } from "express";
import { EditVendorInputs, VendorLoginInputs } from "../dto";
import { GenerateSignature, ValidatePassword } from "../utility";
import { FindVendor } from "./AdminControllers";

//вход продавца
export const VendorLogin = async (req: Request,res: Response, next: NextFunction) => {

  const { email, password } = <VendorLoginInputs>req.body;

  const existingVendor = await FindVendor('', email);

  if(existingVendor !== null) {
    //валидация и выдача доступа
    const validation = await ValidatePassword(password, existingVendor.password, existingVendor.salt);

    if(validation) {

      const signature = GenerateSignature({
        _id: existingVendor.id,
        email: existingVendor.email,
        foodTypes: existingVendor.foodType,
        name: existingVendor.name
      })

      return res.json(signature);
    }
    return res.json({ message: 'Email or password is not valid' })
  }

  return res.json({ message: 'login credential is not valid' })

}

//получить профиль продавца
export const GetVendorProfile = async (req: Request,res: Response, next: NextFunction) => {

  const user = req.user;

  if (user) {
    const existingVendor = await FindVendor(user._id)

    return res.json(existingVendor);
  }

  return res.json({message: "Vendor not found"})


}

//изменить профиль
export const UpdateVendorProfile = async (req: Request,res: Response, next: NextFunction) => {

  const { name, adress, phone, foodTypes } = <EditVendorInputs>req.body;
  const user = req.user;

  if (user) {
    const existingVendor = await FindVendor(user._id)

    if(existingVendor !== null) {
      existingVendor.name = name;
      existingVendor.adress = adress;
      existingVendor.phone = phone;
      existingVendor.foodType = foodTypes;

      const savedResult = await existingVendor.save();
      return res.json(savedResult);
    }

    return res.json(existingVendor);
  }

  return res.json({message: "Vendor not found"})


}

//изменить услугу
export const UpdateVendorService = async (req: Request,res: Response, next: NextFunction) => {
  const { name, adress, phone, foodTypes } = <EditVendorInputs>req.body;
  const user = req.user;

  if (user) {
    const existingVendor = await FindVendor(user._id)

    if(existingVendor !== null) {
      existingVendor.serviceAvailable = !existingVendor.serviceAvailable;

      const savedResult = await existingVendor.save();
      return res.json(savedResult);
    }

    return res.json(existingVendor);
  }

  return res.json({message: "Vendor not found"})

}


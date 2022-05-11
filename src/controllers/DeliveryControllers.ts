import express, {
  Request,
  Response,
  NextFunction
} from 'express';
import { UserLoginInputs, EditCustomerProfileInputs, CreateDeliveryUserInputs } from '../dto/Customer.dto'
import {plainToClass, plainToInstance} from 'class-transformer';
import { validate } from 'class-validator';
import {
  GeneratePassword,
  GenerateSalt,
  GenerateSignature,
  ValidatePassword
} from '../utility';
import { DeliveryUser, Food, Offer, Transaction, Vendor } from '../models';
import { Order } from '../models/Order';
import { EsimProfileContext } from 'twilio/lib/rest/supersim/v1/esimProfile';


//signup -- done
export const DeliveryUserSignup = async (req: Request, res: Response, next: NextFunction) => {

  const deliveryUserInputs = plainToClass(CreateDeliveryUserInputs, req.body)

  const inputErrors = await validate(deliveryUserInputs, {
    validationError: {
      target: true
    }
  });
  if (inputErrors.length > 0) {
    return res.status(400).json(inputErrors);
  }

  const {
    email,
    phone,
    password,
    firstName,
    lastName,
    adress,
    pincode
  } = deliveryUserInputs;

  const salt = await GenerateSalt();
  const userPassword = await GeneratePassword(password, salt);


  const existingDeliveryUser = await DeliveryUser.findOne({
    email: email
  })

  if (existingDeliveryUser !== null) {
    return res.status(409).json({
      message: 'Доставщик с таким email уже зарегистрирован'
    })

  }

  const result = await DeliveryUser.create({
    email: email,
    password: userPassword,
    salt: salt,
    phone: phone,
    firstName: firstName,
    lastName: lastName,
    adress: adress,
    pincode: pincode,
    verified: false,
    lat: 0,
    lng: 0,
    isAvailable: false
  })

  if (result) {
    //generate signature
    const signature = GenerateSignature({
      _id: result._id,
      email: result.email,
      verified: result.verified
    })

    //send result to client
    return res.status(201).json({
      signature: signature,
      verified: result.verified,
      email: result.email
    })
  }
  return res.status(400).json({
    message: 'Ошибочка с авторизацией :)'
  })
}

//login - done
export const DeliveryUserLogin = async (req: Request, res: Response, next: NextFunction) => {

  const loginInputs = plainToClass(UserLoginInputs, req.body);

  const loginErrors = await validate(loginInputs, { validationError: { target: false } });

  if(loginErrors.length > 0) {
    return res.status(400).json(loginErrors)
  }

  const { email, password } = loginInputs;
  const deliveryUser = await DeliveryUser.findOne({ email: email })

  if(deliveryUser) {
    const validation = await ValidatePassword(password, deliveryUser.password, deliveryUser.salt);

    if(validation) {
      const signature = GenerateSignature({
        _id: deliveryUser._id,
        email: deliveryUser.email,
        verified: deliveryUser.verified
      })

      return res.status(201).json({
        signature: signature,
        verified: deliveryUser.verified,
        email: deliveryUser.email
      })
    }
  }
  return res.status(404).json({ message: 'Ошибка с входом в систему' })
}


//get profile -- done
export const GetDeliveryUserProfile = async (req: Request, res: Response, next: NextFunction) => {

  const deliveryUser = req.user;

  if(deliveryUser) {
    const profile = await DeliveryUser.findById(deliveryUser._id);

    if(profile) {
      return res.status(200).json({ profile })
    }
  }
  return res.status(400).json({ message: "не удалось получить информацию о профиле" })


}

//edit profile -- done
export const EditDeliveryUserProfile = async (req: Request, res: Response, next: NextFunction) => {

  const deliveryUser = req.user;

  const profileInputs = plainToInstance( EditCustomerProfileInputs, req.body );

  const profileErrors = await validate(profileInputs, { validationError: { target: false } });

  if (profileErrors.length > 0) {
    return res.status(400).json(profileErrors);
  }

  const { firstName, lastName, adress } = profileInputs;


  if(deliveryUser) {
    const profile = await DeliveryUser.findById(deliveryUser._id);


    if(profile) {
      profile.firstName = firstName;
      profile.lastName = lastName;
      profile.adress = adress;

      const result = await DeliveryUser.findById(deliveryUser._id)

      await profile.save()

      return res.status(200).json(result)
    }
  }

  return res.status(400).json({ message: "не удалось получить информацию о профиле" })

}

export const UpdateDeliveryUserStatus = async (req: Request, res: Response, next: NextFunction) => {

  const deliveryUser = req.user;

  if(deliveryUser) {
    const { lat, lng } = req.body;
    const profile = await DeliveryUser.findById(deliveryUser._id);

    if(profile) {
      if( lat & lng ) {
        profile.lat = lat;
        profile.lng = lng;
      }
    }

    profile.isAvailable = !profile.isAvailable;

    const result = await profile.save();

    return res.status(200).json(result);
  }
  return res.status(400).json({ message: "не удалось изменить статус" })
}

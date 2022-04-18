import express, {
  Request,
  Response,
  NextFunction
} from 'express';
import { CreateCustomerInputs, UserLoginInputs, EditCustomerProfileInputs } from '../dto/Customer.dto'
import {plainToClass, plainToInstance} from 'class-transformer';
import { validate } from 'class-validator';
import {
  GenerateOtp,
  GeneratePassword,
  GenerateSalt,
  GenerateSignature,
  onRequestOTP,
  ValidatePassword
} from '../utility';
import { Customer } from '../models/Customer';


//signup -- done
export const CustomerSugnup = async (req: Request, res: Response, next: NextFunction) => {

  const customerInputs = plainToClass(CreateCustomerInputs, req.body)

  const inputErrors = await validate(customerInputs, {
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
    password
  } = customerInputs;

  const salt = await GenerateSalt();
  const userPassword = await GeneratePassword(password, salt);

  const {
    otp,
    expiry
  } = GenerateOtp();

  const existingCustomer = await Customer.findOne({
    email: email
  })

  if (existingCustomer !== null) {
    return res.status(409).json({
      message: 'Пользователь с таким email уже зарегистрирован'
    })

  }

  const result = await Customer.create({
    email: email,
    password: userPassword,
    salt: salt,
    phone: phone,
    otp: otp,
    otp_expiry: expiry,
    firstName: '',
    lastName: '',
    adress: '',
    verified: false,
    lat: 0,
    lng: 0
  })

  if (result) {
    //send OTP
    await onRequestOTP(otp, phone)

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
export const CustomerLogin = async (req: Request, res: Response, next: NextFunction) => {

  const loginInputs = plainToClass(UserLoginInputs, req.body);

  const loginErrors = await validate(loginInputs, { validationError: { target: false } });

  if(loginErrors.length > 0) {
    return res.status(400).json(loginErrors)
  }

  const { email, password } = loginInputs;
  const customer = await Customer.findOne({ email: email })

  if(customer) {
    const validation = await ValidatePassword(password, customer.password, customer.salt);

    if(validation) {
      const signature = GenerateSignature({
        _id: customer._id,
        email: customer.email,
        verified: customer.verified
      })

      return res.status(201).json({
        signature: signature,
        verified: customer.verified,
        email: customer.email
      })
    }
  }
  return res.status(404).json({ message: 'Ошибка с входом в систему' })
}

//не работает twillio, переделать через nodemailer по email
export const CustomerVerify = async (req: Request, res: Response, next: NextFunction) => {
  const { otp } = req.body;
  const customer = req.user;

  if (customer) {
    const profile = await Customer.findById(customer._id)
    if (profile) {
      if (profile.otp === parseInt(otp) && profile.otp_expiry >= new Date()) {
        profile.verified = true;

        const updatedCustomerResponse = await profile.save();

        //generate signature
        const signature = GenerateSignature({
          _id: updatedCustomerResponse._id,
          email: updatedCustomerResponse.email,
          verified: updatedCustomerResponse.verified
        });
        return res.status(200).json({
          signature: signature,
          verified: updatedCustomerResponse.verified,
          email: updatedCustomerResponse.email
        })

      }
    }
  }
  return res.status(400).json({
    message: 'Ошибка с проверкой одноразового пароля'
  })
}

//opt-req -- done
export const RequestOtp = async (req: Request, res: Response, next: NextFunction) => {

  const customer = req.user;

  if(customer) {
    const profile = await Customer.findById(customer._id);

    if(profile) {
      const { otp, expiry } = GenerateOtp();

      profile.otp = otp;
      profile.otp_expiry = expiry;

      await profile.save();
      await onRequestOTP(otp, profile.phone);

      res.status(200).json({ message: 'вам выслан одноразовый пароль' })
    }
  }
  return res.status(400).json({ message: 'ошибка с запросом одноразового пароля' })
}

//get profile
export const GetCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {

  const customer = req.user;

  if(customer) {
    const profile = await Customer.findById(customer._id);

    if(profile) {
      res.status(200).json({ profile })
    }
  }
  return res.status(400).json({ message: "не удалось получить информацию о профиле" })


}

//edit profile --
export const EditCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {

  const customer = req.user;

  const profileInputs = plainToInstance( EditCustomerProfileInputs, req.body );

  const profileErrors = await validate(profileInputs, { validationError: { target: false } });

  if (profileErrors.length > 0) {
    return res.status(400).json(profileErrors);
  }

  const { firstName, lastName, adress } = profileInputs;


  if(customer) {
    const profile = await Customer.findById(customer._id);


    if(profile) {
      profile.firstName = firstName;
      profile.lastName = lastName;
      profile.adress = adress;

      const result = await Customer.findById(customer._id)

      await profile.save()

      res.status(200).json(result)
    }
  }


}

import express, {
  Request,
  Response,
  NextFunction
} from 'express';
import { CreateCustomerInputs, UserLoginInputs, EditCustomerProfileInputs, OrderInputs } from '../dto/Customer.dto'
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
import { Food } from '../models';
import { Order } from '../models/Order';


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
    verified: true,
    lat: 0,
    lng: 0,
    orders: []
  })

  if (result) {
    //send OTP
    //await onRequestOTP(otp, phone)

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

//Верификация пользователя -------- не работает twillio, переделать через nodemailer по email
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

//get profile -- done
export const GetCustomerProfile = async (req: Request, res: Response, next: NextFunction) => {

  const customer = req.user;

  if(customer) {
    const profile = await Customer.findById(customer._id);

    if(profile) {
      return res.status(200).json({ profile })
    }
  }
  return res.status(400).json({ message: "не удалось получить информацию о профиле" })


}

//edit profile -- done
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

      return res.status(200).json(result)
    }
  }
}

// --------------------- Заказ ------------------------- //
export const CreateOrder = async (req: Request, res: Response, next: NextFunction) => {
  //TODO
  //получить логин покупателя
  const customer = req.user;
  if(customer) {

    //создать id заказа
    const orderId = `${Math.floor(Math.random() * 899999) + 1000}`;

    const profile = await Customer.findById(customer._id);

    //Получить товар из запроса [{id: xx, unit: xx}]
    const cart = <[OrderInputs]>req.body //    [{id: xx, unit: xx}]

    let cartItems = Array();
    let netAmount = 0.0;

    let vendorID;

    //посчитать стоимость
    const foods = await Food.find()
    .where('_id')
    .in(cart.map(item => item._id))
    .exec();

    foods.map(food => {
      cart.map(({_id, unit}) => {
        if(food._id == _id) {
          vendorID = food.vendorID;
          netAmount += (food.price * unit);
          cartItems.push({ food, unit: unit })
        }
      })
    })

    //Создать заказ с описанием
    if(cartItems) {
      const currentOrder = await Order.create({
        orderID: orderId,
        vendorID: vendorID,
        items: cartItems,
        totalAmount: netAmount,
        orderDate: new Date(),
        paidThrough: 'COD',
        paymentResponse: '',
        orderStatus: 'Waiting',
        remarks: '',
        deliveryID: '',
        appliedOffers: false,
        offerID: null,
        readyTime: 45

      })

      //добавить заказ в аккаунт
      if(currentOrder) {
        profile.cart = [] as any;
        profile.orders.push(currentOrder);
        const profileResponse = await profile.save();

        return res.status(200).json(profileResponse);
      }
    }
  }
  return res.status(400).json({ message: 'Ошибка с созданием заказа' })
}

export const GetOrders = async (req: Request, res: Response, next: NextFunction) => {
  const customer = req.user;

  if(customer) {
    const profile = await (await Customer.findById(customer._id)).populate("orders");

    if(profile) {
      return res.status(200).json(profile.orders);
    }
  }
}

export const GetOrderByID = async (req: Request, res: Response, next: NextFunction) => {

  const orderID = req.params.id;

  if(orderID) {
    const order = await Order.findById(orderID).populate('items.food');

    res.status(200).json(order)
  }

}


// ---------------------  Корзина  ----------------------------//


export const AddToCart = async (req: Request, res: Response, next: NextFunction) => {
  const customer = req.user;

  if(customer) {
    const profile = await Customer.findById(customer._id).populate('cart.food');
    let cartItems = Array();

    const { _id, unit } = <OrderInputs>req.body;

    const food = await Food.findById(_id);


    if(food) {
      if(profile != null) {
        cartItems = profile.cart;

        //проверить наличие предметов в корзине
        if(cartItems.length > 0 ) {
          let existFoodItem = cartItems.filter((item) => item.food._id.toString() === _id);

          //проверить кол-во каждого предмета и обновить
          if(existFoodItem.length > 0) {
            const index = cartItems.indexOf(existFoodItem[0]);
            if(unit > 0) {
              cartItems[index] = { food, unit }
            }else{
              cartItems.splice(index, 1);
            }

          }else{
            cartItems.push({ food, unit })
          }

        }else{
          //добавить новый предмет
          cartItems.push({ food, unit });
        }
        if(cartItems) {
          profile.cart = cartItems as any;
          const cartResult = await profile.save();
          return res.status(200).json(cartResult.cart);
        }
      }
    }
  }
  return res.status(400).json({ message: 'Не удалось добавить в корзину' })
}


export const GetCart = async (req: Request, res: Response, next: NextFunction) => {
  const customer = req.user;
  if(customer) {
    const profile = await Customer.findById(customer._id).populate('cart.food');
    if(profile) {
      return res.status(200).json(profile.cart)
    }

  }
  return res.status(400).json({ message: 'Корзина пока пуста' })

}


export const DeleteCart = async (req: Request, res: Response, next: NextFunction) => {
  const customer = req.user;
  if(customer) {
    const profile = await Customer.findById(customer._id).populate('cart.food');
    if(profile != null) {
      profile.cart = [] as any;
      const cartResult = await profile.save();

      return res.status(200).json(cartResult)
    }
  }
  return res.status(400).json({ message: 'Корзина уже пуста' })

}

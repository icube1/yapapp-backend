import { NextFunction, Request, Response } from "express";
import { Multer } from "multer";
import { CreateFoodInputs, CreateOfferInputs, EditVendorInputs, VendorLoginInputs } from "../dto";
import { Food, Offer } from "../models";
import { Order } from "../models/Order";
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

export const UpdateVendorCoverImage = async (req: Request,res: Response, next: NextFunction) => {

  const user = req.user;

  if (user) {

    const vendor = await FindVendor(user._id);

    if( vendor !== null ) {
      const files = req.files as [Express.Multer.File]

      const images = files.map((file: Express.Multer.File) => file.filename);


      vendor.coverImages.push(...images)
      const result = await vendor.save();
      return res.json(result);
    }

    }
  return res.json({message: "Unable to update profile"});


}

//изменить услугу
export const UpdateVendorService = async (req: Request,res: Response, next: NextFunction) => {

  const user = req.user;

  const { lat, lng } = req.body;

  if (user) {
    const existingVendor = await FindVendor(user._id)

    if(existingVendor !== null) {
      existingVendor.serviceAvailable = !existingVendor.serviceAvailable;

      if(lat && lng) {
        existingVendor.lat = lat;
        existingVendor.lng = lng;
      }

      const savedResult = await existingVendor.save();
      return res.json(savedResult);
    }

    return res.json(existingVendor);
  }

  return res.json({message: "Vendor not found"})

}
//добавить еду
export const AddFood = async (req: Request, res: Response, next: NextFunction) => {
  const user = req.user;

  if (user) {

    const { name, description, category, foodType, readyTime, price } = <CreateFoodInputs>req.body;

    const vendor = await FindVendor(user._id);

    if( vendor !== null ) {
      const files = req.files as [Express.Multer.File]

      const images = files.map((file: Express.Multer.File) => file.filename);

      const createdFood = await Food.create({
        vendorId: vendor._id,
        name: name,
        description: description,
        category: category,
        foodType: foodType,
        images: images,
        readyTime: readyTime,
        price: price,
        rating: 0
      });

      vendor.foods.push(createdFood);
      const result = await vendor.save();
      return res.json(result);
    }

    }
  return res.json({message: "Unable to update profile"});
}
//получить еду
export const GetFoods = async (req: Request,res: Response, next: NextFunction) => {
  const user = req.user;

  if (user) {
    const foods = await Food.find({ vendorId: user._id });
    if (foods !== null) {
      return res.json(foods);
    }

    }
  return res.json({message: "Food information has not been found"});
}

// Заказы
export const GetCurrentOrders = async (req: Request,res: Response, next: NextFunction) => {

  const user = req.user;

  if(user) {

    const orders = await Order.find({ vendorId: user._id }).populate('items.food');

    if(orders != null) {
      return res.status(200).json(orders);

    }
  }
  return res.json({ "message": "Заказ не найден" })
}

export const GetOrderDetails = async (req: Request,res: Response, next: NextFunction) => {

  const orderID = req.params.id;
  if(orderID) {
    const order = await Order.findById(orderID).populate('items.food');

    if(order != null) {
      return res.status(200).json(order);

    }
  }
  return res.json({ "message": "Заказ не найден" })

}
export const ProcessOrder = async (req: Request,res: Response, next: NextFunction) => {

  const orderId = req.params.id;
  const { status, remarks, time } = req.body; // принято // отклонено // в процессе //  готово

  if(orderId) {
    const order = await Order.findById(orderId);

    order.orderStatus = status;
    order.remarks = remarks;

    if(time) {
      order.readyTime = time;
    }

    const orderResult = await order.save();
    if(orderResult !== null) {
      return res.status(200).json(orderResult);
    }
    return res.json({ "message": "Не удаётся обработать заказ" })

  }
}
//Скидки
export const GetOffers = async (req: Request,res: Response, next: NextFunction) => {
  const user = req.user;

  if (user) {
    let currentOffers = Array();
    const offers = await Offer.find().populate('vendors');

    if (offers !== null) {

      offers.map(item => {
        if(item.vendors) {
          item.vendors.map(vendor => {
            if(vendor._id.toString() === user._id) {
              currentOffers.push(item)
            }
          })
        }
        if(item.offerType === "GENERIC" ) {
          currentOffers.push(item);
        }
      })
    }
    return res.json(currentOffers)
  }
  return res.json({ message: "unable to get offers" })
}
export const AddOffer = async (req: Request,res: Response, next: NextFunction) => {

  const user = req.user;

  if (user) {
    const { title, description, offerType, offerAmount, pincode, promocode,
      promoType, startValidity, endValidity, bank, bins, minValue, isActive } = <CreateOfferInputs>req.body;

      const vendor = await FindVendor(user._id);

      if(vendor) {
        const offer = await Offer.create({
          offerType,
          vendors: [vendor],
          title,
          description,
          minValue,
          offerAmount,
          startValidity,
          endValidity,
          promocode,
          promoType,
          bank,
          bins,
          pincode,
          isActive,
        });

        console.log(offer);

        return res.status(200).json(offer)
      }
  }
  return res.json({ message: "unable to add offer" })
}
export const EditOffer = async (req: Request,res: Response, next: NextFunction) => {

  const user = req.user;
  const offerId = req.params.id;

  if (user) {
    const { title, description, offerType, offerAmount, pincode, promocode,
      promoType, startValidity, endValidity, bank, bins, minValue, isActive } = <CreateOfferInputs>req.body;

      const currentOffer = await Offer.findById(offerId);


      if(currentOffer) {

        const vendor = await FindVendor(user._id);

        if(vendor) {

            currentOffer.offerType = offerType,
            currentOffer.title = title,
            currentOffer.description = description,
            currentOffer.minValue = minValue,
            currentOffer.offerAmount = offerAmount,
            currentOffer.startValidity = startValidity,
            currentOffer.endValidity = endValidity,
            currentOffer.promocode = promocode,
            currentOffer.promoType = promoType,
            currentOffer.bank = bank,
            currentOffer.bins = bins,
            currentOffer.pincode = pincode,
            currentOffer.isActive = isActive

            const result = await currentOffer.save();


          return res.json(result)

      }

      }
    }
    return res.json({ message: "Unable to edit offer" })
}

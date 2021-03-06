import express, { Request, Response, NextFunction } from 'express'
import { AddToCart, CreateOrder, CreatePayment, CustomerLogin, CustomerSugnup, CustomerVerify, DeleteCart, EditCustomerProfile, GetCart, GetCustomerProfile, GetOrderByID, GetOrders, RequestOtp, VerifyOffer } from '../controllers';
import { Authenticate } from '../middlewares';

const router = express.Router();

//signup
router.post('/signup', CustomerSugnup);


//login
router.post('/login', CustomerLogin);


//authentication
router.use(Authenticate)


//verify
router.patch('/verify', CustomerVerify);


//otp
router.get('/otp', RequestOtp);


//profile
router.get('/profile', GetCustomerProfile);

router.patch('/profile', EditCustomerProfile);


//cart
router.post('/cart', AddToCart);
router.get('/cart', GetCart);
router.delete('/cart', DeleteCart);

//apply offers
router.get('/offer/verify/:id', VerifyOffer)

//payment
router.post('/create-payment', CreatePayment)

//order
router.post('/create-order', CreateOrder);
router.get('/orders', GetOrders);
router.get('/order/:id', GetOrderByID)

export { router as CustomerRoute }


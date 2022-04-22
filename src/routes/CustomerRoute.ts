import express, { Request, Response, NextFunction } from 'express'
import { CreateOrder, CustomerLogin, CustomerSugnup, CustomerVerify, EditCustomerProfile, GetCustomerProfile, GetOrderByID, GetOrders, RequestOtp } from '../controllers';
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
//payment

//order
router.post('/create-order', CreateOrder);
router.get('/orders', GetOrders);
router.get('/order/:id', GetOrderByID)

export { router as CustomerRoute }


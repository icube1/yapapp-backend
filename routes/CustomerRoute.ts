import express, { Request, Response, NextFunction } from 'express'
import { CustomerLogin, CustomerSugnup, CustomerVerify, EditCustomerProfile, GetCustomerProfile, RequestOtp } from '../controllers';
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
//order
//payment

export { router as CustomerRoute }


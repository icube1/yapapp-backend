import express, { Request, Response, NextFunction } from 'express'

const router = express.Router();

//signup
router.post('/signup');


//login
router.post('/login');


//authentication



//verify
router.patch('/verify');


//otp
router.get('/otp');


//profile
router.get('/profile');

router.patch('/profile');


//cart
//order
//payment

export { router as CustomerRoute }


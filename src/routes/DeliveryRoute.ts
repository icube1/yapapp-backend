import express, { Request, Response, NextFunction } from 'express'
import { DeliveryUserLogin, DeliveryUserSignup, EditDeliveryUserProfile, GetDeliveryUserProfile, UpdateDeliveryUserStatus } from '../controllers';
import { Authenticate } from '../middlewares';

const router = express.Router();

//signup
router.post('/signup', DeliveryUserSignup);


//login
router.post('/login', DeliveryUserLogin);


//authentication
router.use(Authenticate);

//service status
router.put('/change-status', UpdateDeliveryUserStatus);


//profile
router.get('/profile', GetDeliveryUserProfile);

router.patch('/profile', EditDeliveryUserProfile);


export { router as DeliveryRoute }


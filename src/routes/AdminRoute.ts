import express, { NextFunction, Request, Response } from 'express';
import { CreateVendor, GetDeliveryUserProfile, GetDeliveryUsers, GetTransactionById, GetTransactions, GetVendorById, GetVendors, VerifyDeliveryUser } from '../controllers';

const router = express.Router();

router.post('/vendor', CreateVendor);
router.get('/vendors', GetVendors);
router.get('/vendor/:id', GetVendorById);

router.get('/transactions', GetTransactions);
router.get('/transaction/:id', GetTransactionById);
router.put('/delivery/verify', VerifyDeliveryUser);
router.get('/delivery/users', GetDeliveryUsers);

router.get('/', (req: Request, res: Response, next: NextFunction) => {
  res.json({ message: "hello from Admin"})
})

export { router as AdminRoute }

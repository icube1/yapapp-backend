import express, {Request, Response, NextFunction} from 'express';
import { GetFoodAvailability, GetFoodsIn30Min, GetTopRestaurants, RestaurantById, SearchFoods } from '../controllers';

const router = express.Router();

//Доступно
router.get('/:pincode', GetFoodAvailability)

//топ ресторанов
router.get('/top-restaurants/:pincode', GetTopRestaurants)

//в течение 30 минут
router.get('/foods-in-30-min/:pincode', GetFoodsIn30Min)

//поиск еды
router.get('/search/:pincode', SearchFoods)

//поиск ресторана
router.get('/restaurant/:id', RestaurantById)



export {router as ShoppingRoute};

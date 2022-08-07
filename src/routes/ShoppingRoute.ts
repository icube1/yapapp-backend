import express, {Request, Response, NextFunction} from 'express';
import { GetAllFoods, GetAvailableOffers, GetFoodAvailability, GetFoodsIn30Min, GetTopRestaurants, RestaurantById, SearchFoods } from '../controllers';

const router = express.Router();

//Доступно
router.get('/:pincode', GetFoodAvailability)

//еда
router.get('/foods', GetAllFoods)

//топ ресторанов
router.get('/top-restaurants/:pincode', GetTopRestaurants)

//в течение 30 минут
router.get('/foods-in-30-min/:pincode', GetFoodsIn30Min)

//поиск еды
router.get('/search/:pincode', SearchFoods)

//Найти скидки
router.get('/offers/:pincode', GetAvailableOffers)

//поиск ресторана
router.get('/restaurant/:id', RestaurantById)



export {router as ShoppingRoute};

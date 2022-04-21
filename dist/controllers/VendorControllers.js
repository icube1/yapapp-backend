"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetFoods = exports.AddFood = exports.UpdateVendorService = exports.UpdateVendorCoverImage = exports.UpdateVendorProfile = exports.GetVendorProfile = exports.VendorLogin = void 0;
const models_1 = require("../models");
const utility_1 = require("../utility");
const AdminControllers_1 = require("./AdminControllers");
//вход продавца
const VendorLogin = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    const existingVendor = yield (0, AdminControllers_1.FindVendor)('', email);
    if (existingVendor !== null) {
        //валидация и выдача доступа
        const validation = yield (0, utility_1.ValidatePassword)(password, existingVendor.password, existingVendor.salt);
        if (validation) {
            const signature = (0, utility_1.GenerateSignature)({
                _id: existingVendor.id,
                email: existingVendor.email,
                foodTypes: existingVendor.foodType,
                name: existingVendor.name
            });
            return res.json(signature);
        }
        return res.json({ message: 'Email or password is not valid' });
    }
    return res.json({ message: 'login credential is not valid' });
});
exports.VendorLogin = VendorLogin;
//получить профиль продавца
const GetVendorProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (user) {
        const existingVendor = yield (0, AdminControllers_1.FindVendor)(user._id);
        return res.json(existingVendor);
    }
    return res.json({ message: "Vendor not found" });
});
exports.GetVendorProfile = GetVendorProfile;
//изменить профиль
const UpdateVendorProfile = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, adress, phone, foodTypes } = req.body;
    const user = req.user;
    if (user) {
        const existingVendor = yield (0, AdminControllers_1.FindVendor)(user._id);
        if (existingVendor !== null) {
            existingVendor.name = name;
            existingVendor.adress = adress;
            existingVendor.phone = phone;
            existingVendor.foodType = foodTypes;
            const savedResult = yield existingVendor.save();
            return res.json(savedResult);
        }
        return res.json(existingVendor);
    }
    return res.json({ message: "Vendor not found" });
});
exports.UpdateVendorProfile = UpdateVendorProfile;
const UpdateVendorCoverImage = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (user) {
        const vendor = yield (0, AdminControllers_1.FindVendor)(user._id);
        if (vendor !== null) {
            const files = req.files;
            const images = files.map((file) => file.filename);
            vendor.coverImages.push(...images);
            const result = yield vendor.save();
            return res.json(result);
        }
    }
    return res.json({ message: "Unable to update profile" });
});
exports.UpdateVendorCoverImage = UpdateVendorCoverImage;
//изменить услугу
const UpdateVendorService = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, adress, phone, foodTypes } = req.body;
    const user = req.user;
    if (user) {
        const existingVendor = yield (0, AdminControllers_1.FindVendor)(user._id);
        if (existingVendor !== null) {
            existingVendor.serviceAvailable = !existingVendor.serviceAvailable;
            const savedResult = yield existingVendor.save();
            return res.json(savedResult);
        }
        return res.json(existingVendor);
    }
    return res.json({ message: "Vendor not found" });
});
exports.UpdateVendorService = UpdateVendorService;
const AddFood = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (user) {
        const { name, description, category, foodType, readyTime, price } = req.body;
        const vendor = yield (0, AdminControllers_1.FindVendor)(user._id);
        if (vendor !== null) {
            const files = req.files;
            const images = files.map((file) => file.filename);
            const createdFood = yield models_1.Food.create({
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
            const result = yield vendor.save();
            return res.json(result);
        }
    }
    return res.json({ message: "Unable to update profile" });
});
exports.AddFood = AddFood;
const GetFoods = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = req.user;
    if (user) {
        const foods = yield models_1.Food.find({ vendorId: user._id });
        if (foods !== null) {
            return res.json(foods);
        }
    }
    return res.json({ message: "Food information has not been found" });
});
exports.GetFoods = GetFoods;
//# sourceMappingURL=VendorControllers.js.map
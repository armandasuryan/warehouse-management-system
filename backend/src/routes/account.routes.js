import accountProfileController from "../controller/account/account.controller.js";
import { auth } from "../middleware/jwtAuth.js";
import express from "express";

const accountProfileRoutes = express.Router();

accountProfileRoutes.get('/account-profile/detail', [auth], accountProfileController.getUserProfile)
accountProfileRoutes.post('/account-profile/save', [auth], accountProfileController.saveUserProfile)

export default accountProfileRoutes;
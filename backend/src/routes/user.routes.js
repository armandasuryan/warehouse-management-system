import express from "express";
import userController from "../controller/user.js";
import { auth } from "../middleware/jwtAuth.js";

const userRoutes = express.Router();

userRoutes.post('/login', userController.userLogin);
userRoutes.post('/user/create', [auth], userController.createUserData)
userRoutes.put('/user/update', [auth], userController.updateUserData)
userRoutes.delete('/user/delete', [auth], userController.deletedUserData)
userRoutes.get('/user/list', [auth], userController.getListUserData)

export default userRoutes;
import userModel from "../model/user.models.js";
import { SuccessResponse, ErrorResponse } from "../utils/response.js";
import jwt from 'jsonwebtoken';
import db from '../config/prisma.js';
import bcrypt from 'bcrypt';

const JWT_SECRET_KEY = 'your_secret_key';
const JWT_EXPIRATION_TIME = '120m';

const userLogin = async (req, res) => {
    try {
        const { username, password } = await req.body;

        // User verification
        const user = await db.users.findFirst({
            where: { username: username },
            include: { role: true }
        });

        // Compare the provided password with the hashed password
        
        if (!user) {
            return ErrorResponse(res, 401, 'User not found', 'error')
        }
        
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return ErrorResponse(res, 401, "Password dosn't macth", "error")
        }

        // Generate JWT token
        const generateToken = jwt.sign({ id_user: user.id, username: user.username, role_name: user.role.role_name, }, JWT_SECRET_KEY, { expiresIn: JWT_EXPIRATION_TIME });
        
        // Send response data
        const data = {
            username: user.username,
            role_name: user.role.role_name, 
            token: generateToken,
        };
        
        return SuccessResponse(res, 200, 'Login successful', data);

    } catch (error) {
        console.error('Login error:', error);
        return ErrorResponse(res, 500, 'Login error', 'Internal server error');
    }
}

const createUserData = async (req, res) => {
    try {
        const {username, password, id_role} = req.body
        
        const hashedPassword = await bcrypt.hash(password, 12);
        const payloadData = {
            username, 
            password: hashedPassword,
            id_role,
            created_at: new Date() // Setting the current date and time
        }

        await userModel.createUser(payloadData);
        const getUpdatedUser = await userModel.getAllUsers();

        return SuccessResponse(res, 200, "Success created new data user", getUpdatedUser)
    } catch (error) {   
        return ErrorResponse(res, 404, "Failed to created new data user", error.message)
    }
}

const updateUserData = async(req, res) => {
    try {
        const {id, username, password, id_role} = req.body

        const hashedPassword = await bcrypt.hash(password, 12);
        const payloadData = {
            username,
            password: hashedPassword,
            id_role,
        }
        await userModel.updateUser(id, payloadData);
        const getUpdatedUser = await userModel.getAllUsers();

        return SuccessResponse(res, 200, "Success update data user", getUpdatedUser)
    } catch (error) {
        return ErrorResponse(res, 404, "Failed to update data user", error.message)
    }
}

const deletedUserData = async(req, res) => {
    try {
        const {id} = req.body

        await userModel.deleteUser(id);
        const getUpdatedUser = await userModel.getAllUsers();

        return SuccessResponse(res, 200, "Success delete data user", getUpdatedUser)
    } catch (error) {
        return ErrorResponse(res, 404, "Failed to delete data user", error.message)
    }
}

const userController = {
    userLogin,
    createUserData,
    updateUserData,
    deletedUserData,
};

export default userController;
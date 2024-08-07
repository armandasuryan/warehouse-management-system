import userModel from "../../model/users/user.model.js";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";
import jwt from 'jsonwebtoken';
import { hashPassword, verifyPassword } from "../../middleware/hashPassword.js";
import { getPaginated } from "../../utils/pagination.js";
import { userPermission } from "../../middleware/jwtAuth.js";

const userLogin = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Get user with role
        const userWithRole = await userModel.getUserLogin(username);
        
        if (!userWithRole) {
            return ErrorResponse(res, 401, 'User not found', 'error');
        }
        
        // Extract hashed password from user record
        const { password: storedHashedPassword} = userWithRole;

        // Compare the provided password with the hashed password
        const passwordMatch = await verifyPassword(password, storedHashedPassword);
    
        if (!passwordMatch) {
            return ErrorResponse(res, 401, "Password doesn't match", 'error');
        }

        // Generate JWT token
        const generateToken = jwt.sign(
            {   
                id: userWithRole.id,
                id_user: userWithRole.id,
                username: userWithRole.username,
                role_name: userWithRole.users_to_employee.role.role_name, 
            },
            process.env.JWT_SECRET_KEY,
            { expiresIn: process.env.JWT_EXP_TIME }
        );
        
        // Send response data
        const data = {
            id: userWithRole.id,
            username: userWithRole.username,
            role_name: userWithRole.role_name,
            employee_name: userWithRole.users_to_employee.name,
            email: userWithRole.users_to_employee.email, 
            token: generateToken,
        };
        
        return SuccessResponse(res, 200, 'Login successfully', data);

    } catch (error) {
        console.error('Login error:', error);
        return ErrorResponse(res, 500, 'Login error', 'Internal server error');
    }
}

const createUserData = async (req, res) => {
    try {
        const { username, password, id_role, employee_name, email } = req.body;

        if (!username || !password || !id_role) {
            return ErrorResponse(res, 400, "Missing required fields", 'error');
        }

        const search = "";
        const hashedPassword = await hashPassword(password);
        const payloadData = {
            username,
            employee_name: employee_name,
            email: email,
            id_role,
            password: hashedPassword,
        };

        await userModel.createUser(payloadData);
        const getUpdatedUser = await userModel.getAllUsers(search);
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 10; 
        const paginatedData = await getPaginated(req, page, limit, getUpdatedUser);

        return SuccessResponse(res, 200, "Successfully created new user", paginatedData);
    } catch (error) {
        console.error(error); 
        return ErrorResponse(res, 500, "Failed to create new user", error.message);
    }
};

const updateUserData = async(req, res) => {   
    try {
        const permission = await userPermission(req);
        const {username, password, id_role} = req.body
        const search = ""

        const hashedPassword = await hashPassword(password);
        const payloadData = {
            username,
            password: hashedPassword,
            id_role,
        }
        await userModel.updateUser(permission.id, payloadData);
        const getUpdatedUser = await userModel.getAllUsers(search);
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 10; 
        const paginatedData = await getPaginated(req, page, limit, getUpdatedUser);

        return SuccessResponse(res, 200, "Success update data user", paginatedData)
    } catch (error) {
        return ErrorResponse(res, 404, "Failed to update data user", error.message)
    }
}

const deletedUserData = async(req, res) => {
    try {
        const {id} = req.body
        const search = ""

        await userModel.deleteUser(id);
        const getUpdatedUser = await userModel.getAllUsers(search);
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 10; 
        const paginatedData = await getPaginated(req, page, limit, getUpdatedUser);

        return SuccessResponse(res, 200, "Success delete data user", paginatedData)
    } catch (error) {
        return ErrorResponse(res, 404, "Failed to delete data user", error.message)
    }
}

const getListUserData = async(req, res) => {
    try {
        const page = parseInt(req.query.page) || 1; 
        const limit = parseInt(req.query.limit) || 10; 
        const search = parseInt(req.query.search) || ""; 
        const getAllUserData = await userModel.getAllUsers(search);
        const paginatedData = await getPaginated(req, page, limit, getAllUserData);

        return SuccessResponse(res, 200, "Success get list data user", paginatedData)
    } catch (error) {
        return ErrorResponse(res, 404, "Failed to get list data user", error.message)
    }
}

const userController = {
    userLogin,
    createUserData,
    updateUserData,
    deletedUserData,
    getListUserData,
};

export default userController;
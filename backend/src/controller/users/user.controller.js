import userModel from "../../model/users/user.model.js";
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";
import jwt from 'jsonwebtoken';
import { hashPassword, verifyPassword } from "../../middleware/hashPassword.js";
import { getPaginated } from "../../utils/pagination.js";
import { userPermission } from "../../middleware/jwtAuth.js";
import nodemailConf from "../../middleware/nodemail.js";
import redisConf from "../../config/redis.js";

const userLogin = async (req, res) => {
    try {
        const { username, password } = req.body;
        
        // Get user with role
        const userWithRole = await userModel.getUserLogin(username);
        const email = userWithRole.users_to_employee.email;

        if (!userWithRole) {
            return ErrorResponse(res, 401, 'User not found', 'error');
        }

        // Compare the provided password with the hashed password
        const passwordMatch = await verifyPassword(password, userWithRole.password);

        if (!passwordMatch) {
            return ErrorResponse(res, 401, "Password doesn't match", 'error');
        }

        // Save OTP to Redis
        const otp = nodemailConf.generateOTP();
        await redisConf.redisClient.setEx(`otp:${username}`, 300, otp); // 5 minutes

        // Send OTP via email
        await nodemailConf.transporter.sendMail({
            from: process.env.SMTP_USER,
            to: email,
            subject: 'Your OTP Code',
            text: `Your OTP code is ${otp}`,
        });

        return SuccessResponse(res, 200, 'OTP sent to email.', otp);
        
    } catch (error) {
        console.error('Login error:', error);
        return ErrorResponse(res, 500, 'Login error', 'Internal server error');
    }
};

const verifyOtp = async (req, res) => {
    const { username, otp } = req.body;

    try {
        // Retrieve OTP from Redis
        const storedOtp = await redisConf.redisClient.get(`otp:${username}`);

        if (!storedOtp || storedOtp !== otp) {
            return ErrorResponse(res, 401, 'Invalid OTP', null);
        }

        // Delete OTP after successful verification
        await redisConf.redisClient.del(`otp:${username}`);

        // Generate JWT token
        const userWithRole = await userModel.getUserLogin(username); // Get user details
        const token = jwt.sign({
            id: userWithRole.id,
            username: userWithRole.username,
            role_name: userWithRole.users_to_employee.role.role_name,
        }, process.env.JWT_SECRET_KEY, { expiresIn: process.env.JWT_EXP_TIME });

        // Prepare response data
        const data = {
            id: userWithRole.id,
            username: userWithRole.username,
            role_name: userWithRole.users_to_employee.role.role_name,
            employee_name: userWithRole.users_to_employee.name,
            email: userWithRole.users_to_employee.email,
            token,
        };

        return SuccessResponse(res, 200, 'Login successful', data);

    } catch (error) {
        console.error('Verify OTP error:', error);
        return ErrorResponse(res, 500, 'Internal server error', 'Error verifying OTP');
    }
};


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

const updateUserData = async (req, res) => {
    try {
        const permission = await userPermission(req);
        const { username, password, id_role } = req.body
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

const deletedUserData = async (req, res) => {
    try {
        const { id } = req.body
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

const getListUserData = async (req, res) => {
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
    verifyOtp,
    createUserData,
    updateUserData,
    deletedUserData,
    getListUserData,
};

export default userController;
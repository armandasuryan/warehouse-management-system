import { ErrorResponse } from "../utils/response.js";
import jwt from 'jsonwebtoken';
import db from '../config/prisma.js';

const auth = async (req, res, next) => {
    const token = req.headers['authorization'];

    if (!token) {
        return ErrorResponse(res, 401, 'Unauthorized', 'Token not found');;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
        const user = await db.users.findUnique({
            where: { id: decoded.id_user }
        });

        if (!user) {
             return ErrorResponse(res, 404, 'User Not Found', 'error');
        }

        req.user = user; 
        next(); 
    } catch (error) {
        return ErrorResponse(res, 403, 'Forbidden', error.message);
    }
}

export {auth}
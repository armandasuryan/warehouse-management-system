import db from '../config/prisma.js';

// Create a new user
const createUser = async (data) => {
    return await db.users.create({
        data,
    });
};

// Get all users
const getAllUsers = async () => {
    return await db.users.findMany({
        where: {deleted_at: !deleted_at}
    });
};

// Update a user by ID
const updateUser = async (id, data) => {
    return await db.users.update({
        where: { id: Number(id) },
        data,
    });
};

// Soft delete a user by ID
const deleteUser = async (id) => {
    return await db.users.update({
        where: { id: Number(id) },
        data,
    });
};

const userModel = {
    createUser,
    getAllUsers,
    updateUser,
    deleteUser,
};

export default userModel;
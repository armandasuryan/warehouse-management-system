import db from '../config/prisma.js';

// Create a new user
const createUser = async (data) => {
    return await db.users.create({
        data,
    });
};

// Get all users
const getAllUsers = async (search) => {
    let users;

    if (!search || search.trim() === "") {
        users = await db.users.findMany({
            where: { deleted_at: null },
        });
    } else {
        users = await db.users.findMany({
            where: {
                deleted_at: null,
                username: {
                    contains: search,
                },
            },
        });
    }

    return users;
}

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
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
    const searchKeyword = `%${search}%`

    if (!search || search.trim() === "") {
        users = await db.$queryRaw`
        select users.*, role.role_name from users
        left join role on users.id_role = role.id
        where users.deleted_at is null
        group by users.id
        order by role.role_name asc`
    } else {
        users = await db.$queryRaw`
        select users.*, role.role_name from users
        left join role on users.id_role = role.id
        where users.deleted_at is null and users.username like $1
        group by users.id
        order by role.role_name asc`, 
        searchKeyword
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
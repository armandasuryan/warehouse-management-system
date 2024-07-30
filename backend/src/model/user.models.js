import db from '../config/prisma.js';

// Create a new user
const createUser = async (data) => {
    return await db.$transaction(async (db) => {
        const user = await db.users.create({
            data: {
                username: data.username,
                password: data.password,
                salt: data.salt,
            },
        });

        await db.employee.create({
            data: {
                name: data.employee_name,
                id_role: data.id_role,
                email: data.email,
            },
        });

        return user;
    });
};

// Get all users
const getAllUsers = async (search) => {
    let users;
    const searchKeyword = `%${search}%`

    if (!search || search.trim() === "") {
        users = await db.$queryRaw`
        select users.username, users.id_role, role.role_name from users
        left join role on users.id_role = role.id
        left join employee on employee.id_user = users.id
        where users.deleted_at is null
        group by users.id
        order by role.role_name asc`
    } else {
        users = await db.$queryRaw`
        select users.username, users.id_role, role.role_name, employee.name, employee.email from users
        left join role on users.id_role = role.id
        left join employee on employee.id_user = users.id
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

const getUserLogin = async (username) => {
    const user = await db.users.findFirst({
        where: {username: username},
        include: {
            users_to_employee: {
                include: {
                    role: true
                }
            }
        }
    });
    return user;
}

const userModel = {
    createUser,
    getAllUsers,
    updateUser,
    deleteUser,
    getUserLogin,
};

export default userModel;
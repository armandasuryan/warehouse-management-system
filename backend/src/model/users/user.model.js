import db from '../../config/prisma.js';

// Create a new user
const createUser = async (data) => {
    return await db.$transaction(async (db) => {
        const user = await db.users.create({
            data: {
                username: data.username,
                password: data.password,
            },
        });
        
        const employee = await db.employee.create({
            data: {
                name: data.employee_name,
                id_role: data.id_role,
                email: data.email,
                id_user: user.id,
            },
        });

        await db.users.update({
            where: {id: user.id},
            data: {
                id_employee: employee.id
            }
        })

        return user;
    });
};

// Get all users
const getAllUsers = async (search) => {
    let users;
    const searchKeyword = `%${search}%`

    if (!search || search.trim() === "") {
        users = await db.$queryRaw`
        select users.username, role.role_name, employee.name, employee.email, role.id as id_role from users
        left join employee on employee.id_user = users.id
        left join role on employee.id_role = role.id
        where users.deleted_at is null
        group by users.id
        order by role.role_name asc`
    } else {
        users = await db.$queryRaw`
        select users.username, role.role_name, employee.name, employee.email, role.id as id_role, employee.name, employee.email from users
        left join employee on employee.id_user = users.id
        left join role on employee.id_role = role.id
        where users.deleted_at is null and users.username like $1
        group by users.id
        order by role.role_name asc`, 
        searchKeyword
    }

    return users;
}

// Update a user by ID
const updateUser = async (id, data) => {
    return await db.$transaction(async (db) => {
    const user = await db.users.update({
        where: { id: Number(id) },
        data: {
            username: data.username,
            password: data.password,
        },
    })

    await db.employee.update({
        where: {id_user: Number(id)},
        data: {
            id_role: data.id_role,
        },
    })

    return user;
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
};

const userModel = {
    createUser,
    getAllUsers,
    updateUser,
    deleteUser,
    getUserLogin,
};

export default userModel;
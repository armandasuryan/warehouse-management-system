import db from '../../config/prisma.js';

const createProfile = async (data) => {
    return await db.employee_has_profile.create({
        data: {
            id_employee: data.id_employee,
            url: data.url,
            bucket_name: data.bucket_name,
            original_file_name: data.original_file_name,
        }
    });
};

const updateProfile = async (IDProfile, data) => {
    return await db.employee_has_profile.update({
        where: {id: Number(IDProfile)},
        data: {
            id_employee: data.id_employee,
            url: data.url,
            bucket_name: data.bucket_name,
            original_file_name: data.original_file_name,
        }
    });
};

const getProfile = async (id) => {
    const users = await db.$queryRaw`
    SELECT emp.name, emp.email, users.username,
           emp_profile.id AS id_emp_profile, emp_profile.bucket_name, emp_profile.original_file_name,
           role.role_name 
    FROM employee emp
    LEFT JOIN users ON users.id = emp.id_user
    LEFT JOIN employee_has_profile emp_profile ON emp_profile.id_employee = emp.id
    LEFT JOIN role ON role.id = emp.id_role
    WHERE emp.id = ${id}
    GROUP BY emp.id, emp_profile.id, role.id`;

    return users;
};

const accountProfileModel = {
    createProfile,
    updateProfile,
    getProfile,
};

export default accountProfileModel;
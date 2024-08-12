import db from '../../config/prisma.js';

const createProfile = async (data) => {
    return await db.employee_has_profile.create({
        data: {
            id_employee: data.idEmployee,
            url: data.url,
            bucket_name: data.bucket,
            original_file_name: data.original_file_name,
            file_minio_name: data.file_minio_name,
        }
    });
};

const updateProfile = async (IDProfile, data) => {
    return await db.employee_has_profile.update({
        where: { id: Number(IDProfile) },
        data: {
            id_employee: data.id_employee,
            url: data.url,
            bucket_name: data.bucket_name,
            original_file_name: data.original_file_name,
            file_minio_name: data.file_minio_name,
        }
    });
};

const getProfile = async (id) => {
    const users = await db.$queryRaw`
    SELECT emp.name, emp.email, users.username,
           emp_profile.id AS id_emp_profile, emp_profile.bucket_name, emp_profile.original_file_name,
           emp_profile.file_minio_name,
           role.role_name 
    FROM employee emp
    LEFT JOIN users ON users.id = emp.id_user
    LEFT JOIN employee_has_profile emp_profile ON emp_profile.id_employee = emp.id
    LEFT JOIN role ON role.id = emp.id_role
    WHERE emp.id = ${id}
    ORDER BY emp.id DESC
    LIMIT 1`;

    return users[0] || null;
};

const updatePasswordProfile = async (id, newPassword) => {
    return await db.users.update({
        where: { id: Number(id) },
        data: {
            password: newPassword,
        }
    });
};

const accountProfileModel = {
    createProfile,
    updateProfile,
    getProfile,
    updatePasswordProfile,
};

export default accountProfileModel;
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";
import { userPermission } from "../../middleware/jwtAuth.js";
import accountProfileModel from "../../model/account/account.model.js";
import { hashPassword } from "../../middleware/hashPassword.js";
import uploadFileController from "../../utils/file.js";

const getUserProfile = async (req, res) => {
    const permission = await userPermission(req)

    try {
        const profile = await accountProfileModel.getProfile(permission.id);

        let urlLinkProfile = "";
        let urlDownloadProfile = "";

        if (profile.file_minio_name) {
            urlLinkProfile = await uploadFileController.getUrlPreviewFile(req, res, profile.bucket_name, profile.file_minio_name)
            urlDownloadProfile = await uploadFileController.getUrlDownloadFile(profile.bucket_name, profile.file_minio_name)
        }

        const responseProfile = {
            "id_profile": profile.id_emp_profile,
            "name": profile.name,
            "username": profile.username,
            "email": profile.email,
            "link_profile": urlLinkProfile,
            "link_download": urlDownloadProfile,
        };

        return SuccessResponse(res, 200, 'Succes get detail profile', responseProfile)
    } catch (error) {
        const errorMsg = `${error}`
        return ErrorResponse(res, 404, 'Failed to get detail profile', errorMsg)
    }
};

const saveUserProfile = async (req, res) => {
    const permission = await userPermission(req)

    const {
        id_profile,
        new_password,
        bucket,
        original_file_name,
        file_minio_name,
    } = req.body

    const idEmployee = permission.id
    const payload = {
        new_password,
        bucket,
        original_file_name,
        file_minio_name,
        idEmployee,
    }

    try {
        if (!id_profile) {
            await accountProfileModel.createProfile(payload)
        } else {
            await accountProfileModel.updateProfile(id_profile, payload)
        }

        if (new_password) {
            const hashedPassword = await hashPassword(new_password)
            await accountProfileModel.updatePasswordProfile(permission.id, hashedPassword)
        }

        await getUserProfile(req, res)

    } catch (error) {
        return ErrorResponse(res, 404, `Failed save profile`, error)
    }

};

const accountProfileController = {
    getUserProfile,
    saveUserProfile,
};

export default accountProfileController;
import { SuccessResponse, ErrorResponse } from "../../utils/response.js";
import { userPermission } from "../../middleware/jwtAuth.js";
import accountProfileModel from "../../model/account/account.model.js";

const getUserProfile = async (req, res) => {
    const permission = await userPermission(req)

    try {
        const profile = await accountProfileModel.getProfile(permission.id)

        const responseProfile = {
            "name": profile.name,
            "username": profile.username,
            "email": profile.email,
            "link_profile": `${process.env.MINIO_ENDPOINT}/${profile.bucket}/${profile.originalname}`
        }
        return SuccessResponse(res, 200, 'Succes get detail profile', responseProfile)
    } catch (error) {
        return ErrorResponse(res, 404, 'Failed to get detail profile', error)
    }
};

const saveUserProfile = async (req, res) => {
    const permission = await userPermission(req)

    const {
        id_profile,
        username,
        old_password,
        new_password,
        bucket,
        original_file_name,
        email,
        profile,
    } = req.body

    const payload = {
        username,
        old_password,
        new_password,
        bucket,
        original_file_name,
        email,
        profile
    }

    try {
        if (!id_profile) {
            await accountProfileModel.createProfile(payload)
        } else {
            await accountProfileModel.updateProfile(id_profile, payload)
        }
        
        const userProfile = await getUserProfile(permission.id)

        return SuccessResponse(res, 200, `Success save profile`, userProfile)
    } catch (error) {
        return ErrorResponse(res, 404, `Failed save profile`, userProfile)
    }

};

const accountProfileController = {
    getUserProfile,
    saveUserProfile,
};

export default accountProfileController;
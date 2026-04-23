import { getTutorProfile, updateTutorProfile } from "../services/tutor.service.js";
import { buildTutorResponse } from "../utils/tutor-response.js";

const buildTutorProfileResponseData = (tutor) => ({
    tutor: buildTutorResponse(tutor),
});

/**
 * Controller del perfil del tutor.
 *
 * POR QUÉ:
 * El perfil ya no pertenece al flujo de autenticación.
 * Pertenece al módulo del tutor autenticado.
 */
export const getTutorProfileController = async (req, res, next) => {
    try {
        const tutor = await getTutorProfile(req.user.id);

        return res.status(200).json({
            success: true,
            data: buildTutorProfileResponseData(tutor),
        });
    } catch (error) {
        return next(error);
    }
};

export const updateTutorProfileController = async (req, res, next) => {
    try {
        const tutor = await updateTutorProfile(req.user.id, req.body);

        return res.status(200).json({
            success: true,
            message: "Perfil actualizado correctamente",
            data: buildTutorProfileResponseData(tutor),
        });
    } catch (error) {
        return next(error);
    }
};

import {
    authenticateTutor,
    getUserProfile,
    registerTutor as registerTutorService,
    updateUserProfile,
} from "../services/auth.service.js";
import { generateJWT } from "../utils/auth/generateJWT.js";

// (Cardona) Genera el JWT que permite mantener la sesion activa en frontend.
const buildAuthToken = (tutor) =>
    generateJWT({
        id: tutor.id,
        email: tutor.email,
        role: tutor.role,
    });

// (Camilo + Cardona) Mantiene el contrato del Sprint 1 usando nombre hacia el frontend.
const buildTutorResponse = (tutor) => ({
    id: tutor.id,
    nombre: tutor.full_name,
    email: tutor.email,
    institution: tutor.institution ?? null,
});

const buildAuthResponseData = (tutor) => ({
    tutor: buildTutorResponse(tutor),
    token: buildAuthToken(tutor),
});

const buildProfileResponseData = (tutor) => ({
    tutor: buildTutorResponse(tutor),
});

// ================= REGISTER =================
export const registerTutor = async (req, res, next) => {
    try {
        const tutor = await registerTutorService(req.body);

        return res.status(201).json({
            success: true,
            data: buildAuthResponseData(tutor),
        });
    } catch (error) {
        return next(error);
    }
};

// ================= LOGIN =================
export const loginTutor = async (req, res, next) => {
    try {
        const tutor = await authenticateTutor(req.body);

        return res.status(200).json({
            success: true,
            data: buildAuthResponseData(tutor),
        });
    } catch (error) {
        return next(error);
    }
};

// =================  profile =================
export const getMe = async (req, res, next) => {
    try {
        const tutor = await getUserProfile(req.user.id);

        return res.status(200).json({
            success: true,
            data: buildProfileResponseData(tutor),
        });
    } catch (error) {
        return next(error);
    }
};

// =================  actualizar =================
export const updateMe = async (req, res, next) => {
    try {
        const tutor = await updateUserProfile(req.user.id, req.body);

        return res.status(200).json({
            success: true,
            message: "Perfil actualizado correctamente",
            data: buildProfileResponseData(tutor),
        });
    } catch (error) {
        return next(error);
    }
};

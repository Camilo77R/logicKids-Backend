import { authenticateTutor, registerTutor as registerTutorService } from "../services/auth.service.js";
import { generateJWT } from "../utils/auth/generateJWT.js";
import { buildTutorResponse } from "../utils/tutor-response.js";

// (Cardona) Genera el JWT que permite mantener la sesion activa en frontend.
const buildAuthToken = (tutor) =>
    generateJWT({
        id: tutor.id,
        email: tutor.email,
        role: tutor.role,
    });

const buildAuthResponseData = (tutor) => ({
    tutor: buildTutorResponse(tutor),
    token: buildAuthToken(tutor),
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

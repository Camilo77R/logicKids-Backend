import { getDatabaseHealthStatus } from "../services/healthService.js";

export const getHealthStatus = async (req, res, next) => {
    try {
        void req;

        return res.status(200).json({
            success: true,
            data: await getDatabaseHealthStatus(),
            message: "Conexión a DB correcta",
        });
    } catch (error) {
        return next(error);
    }
};

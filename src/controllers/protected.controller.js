// Controller para rutas protegidas (smoke test de JWT).
export const getAuthenticatedUser = (req, res) => {
    return res.status(200).json({
        success: true,
        data: {
            user: req.user,
        },
        message: "Acceso autorizado",
    });
};

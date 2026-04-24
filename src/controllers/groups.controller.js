import {
    listGroups,
    createGroup as createGroupService,
    updateGroup as updateGroupService,
    setDefaultGroup as setDefaultGroupService,
} from "../services/groups.service.js";

export const getGroups = async (req, res, next) => {
    try {
        const groups = await listGroups(req.user.id);

        return res.status(200).json({
            success: true,
            data: {
                groups,
                total: groups.length,
            },
            message: "Grupos cargados correctamente",
        });
    } catch (error) {
        return next(error);
    }
};

export const createGroup = async (req, res, next) => {
    try {
        const group = await createGroupService(req.user.id, req.body);

        return res.status(201).json({
            success: true,
            data: {
                group,
            },
            message: "Grupo creado correctamente",
        });
    } catch (error) {
        return next(error);
    }
};

export const updateGroup = async (req, res, next) => {
    try {
        const group = await updateGroupService(req.user.id, req.params.id, req.body);

        return res.status(200).json({
            success: true,
            data: {
                group,
            },
            message: "Grupo actualizado correctamente",
        });
    } catch (error) {
        return next(error);
    }
};

export const setDefaultGroup = async (req, res, next) => {
    try {
        const group = await setDefaultGroupService(req.user.id, req.params.id);

        return res.status(200).json({
            success: true,
            data: {
                group,
            },
            message: "Grupo por defecto actualizado correctamente",
        });
    } catch (error) {
        return next(error);
    }
};

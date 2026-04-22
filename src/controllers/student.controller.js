import { createStudent, updateStudent, deleteStudent } from "../services/student.service.js";

// Controlador para crear un estudiante
export const createStudentController = async (req, res, next) => {
    try {
        const tutorId = req.user.id; // Del middleware de auth
        const studentData = req.body;

        const student = await createStudent(tutorId, studentData);

        return res.status(201).json({
            data: student,
            error: null,
            message: "Estudiante creado exitosamente",
        });
    } catch (error) {
        return next(error);
    }
};

// Controlador para editar un estudiante
export const updateStudentController = async (req, res, next) => {
    try {
        const tutorId = req.user.id;
        const studentId = req.params.id;
        const updateData = req.body;

        const student = await updateStudent(studentId, tutorId, updateData);

        return res.status(200).json({
            data: student,
            error: null,
            message: "Estudiante actualizado exitosamente",
        });
    } catch (error) {
        return next(error);
    }
};

// Controlador para eliminar un estudiante
export const deleteStudentController = async (req, res, next) => {
    try {
        const tutorId = req.user.id;
        const studentId = req.params.id;

        await deleteStudent(studentId, tutorId);

        return res.status(200).json({
            data: null,
            error: null,
            message: "Estudiante eliminado exitosamente",
        });
    } catch (error) {
        return next(error);
    }
};


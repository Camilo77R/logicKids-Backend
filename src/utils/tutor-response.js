// Traduce el modelo interno del tutor al contrato público del backend.
export const buildTutorResponse = (tutor) => ({
    id: tutor.id,
    nombre: tutor.full_name,
    email: tutor.email,
    institution: tutor.institution ?? null,
});

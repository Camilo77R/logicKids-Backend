// Permite aceptar tanto el contrato histórico `nombre` como `full_name`.
export const resolveTutorFullName = ({ nombre, full_name }) => full_name || nombre;

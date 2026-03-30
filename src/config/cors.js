const allowedOrigins = [
  "http://localhost:3000",
  "http://localhost:5173"
];

// Opciones de CORS: solo permite origenes confiables.
const corsOptions = {
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error("Not allowed by CORS"));
  },
  // Permite solo estos headers para mayor seguridad.
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
};

export default corsOptions;

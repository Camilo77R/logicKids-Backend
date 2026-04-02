import express from "express";
import notFound from "./middlewares/notFound.js";
import errorHandler from "./middlewares/errorHandler.js";
import cors from "cors";
import corsOptions from "./config/cors.js";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import rootRoutes from "./routes/root.routes.js";

const app = express();

app.use(cors(corsOptions)); // Habilita CORS para origenes confiables
app.use(express.json());

app.use("/", rootRoutes);
app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);

app.use(notFound);
app.use(errorHandler);
export default app;

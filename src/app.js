import express from "express";
import notFound from "./middlewares/notFound.js";
import errorHandler from "./middlewares/errorHandler.js";
import cors from "cors";
import corsOptions from "./config/cors.js";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";
import protectedRoutes from "./routes/protected.routes.js";
import rootRoutes from "./routes/root.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";
import tutorRoutes from "./routes/tutor.routes.js";
import groupsRoutes from "./routes/groups.routes.js";

const app = express();

app.use(cors(corsOptions)); // Habilita CORS para origenes confiables
app.use(express.json());

app.use("/", rootRoutes);
app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/tutor", tutorRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/groups", groupsRoutes);
app.use("/api", protectedRoutes);


app.use(notFound);
app.use(errorHandler);
export default app;

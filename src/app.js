import express from "express";
import notFound from "./middlewares/notFound.js";
import errorHandler from "./middlewares/errorHandler.js";
import cors from "cors";
import corsOptions from "./config/cors.js";
import healthRoutes from "./routes/health.routes.js";
import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(cors(corsOptions)); // Habilita CORS para origenes confiables
app.use(express.json());

app.get("/", (req, res) => {
    void req;
    return res.status(200).json({
        success: true,
        message: "LogicKids Backend activo",
        data: {
            service: "logickids-backend",
            status: "ok"
        }
    });
});

app.use("/api", healthRoutes);
app.use("/api/auth", authRoutes);

app.use(notFound);
app.use(errorHandler);
export default app;

import express from "express";
import notFound from "./middlewares/notFound.js";
import errorHandler from "./middlewares/errorHandler.js";
import cors from "cors";
import corsOptions from "./config/cors.js";
import healthRoutes from "./routes/health.routes.js";

const app = express();

app.use(cors(corsOptions));// Habilita CORS para todas las rutas y métodos
app.use(express.json());
app.use('/api',healthRoutes);


app.use(notFound);
app.use(errorHandler);
export default app;
import express from "express";
import cors from "cors";

const app = express();

app.use(cors());
app.use(express.json());

// Basic health check for sprint 0. Replace with real checks later.
app.get("/health", (req, res) => {
	res.status(200).json({ status: "ok" });
});

export default app;

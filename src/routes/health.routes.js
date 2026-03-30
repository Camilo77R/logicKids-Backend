import { Router } from "express";

const router = Router();

// Basic health check for sprint 0. Replace with real checks later.
router.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

export default router;

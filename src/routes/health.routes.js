import { Router } from "express";
import { supabase } from "../config/supabase.js";

const router = Router();

router.get("/health", async (req, res) => {
  try {
    const { data, error } = await supabase
      .from("tutors")
      .select("*")
      .limit(1);

    if (error) throw error;

    res.status(200).json({
      status: "ok",
      database: "connected"
    });

  } catch (err) {
    res.status(500).json({
      status: "error",
      database: "disconnected",
      message: err.message
    });
  }
});

export default router;
import { Router } from "express";
import { supabase } from "../config/supabase.js";

const router = Router();

router.get("/health", async (req, res) => {
  try {
    const { error } = await supabase
      .from("tutors")
      .select("id")
      .limit(1);

    if (error) throw error;

    if (process.env.NODE_ENV === "development") {
      console.log("Health DB: conectado");
    }

    res.status(200).json({
      success: true,
      data: {
        status: "ok",
        database: "connected"
      },
      message: "Conexion a DB correcta"
    });

  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.log("Health DB: desconectado");
    }

    res.status(500).json({
      success: false,
      message: err.message
    });
  }
});

export default router;

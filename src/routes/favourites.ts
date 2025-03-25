import express from "express";
import { db } from "@/dataSources";
import { favourites } from "@/models";
import { eq, and } from "drizzle-orm";

const router = express.Router();

router.post("/favourites/:beachid", async (req, res) => {
  const userId = req.body.userId; // Lo pasaremos en el body manualmente
  const beachId = parseInt(req.params.beachid);

  if (!userId) {
    return res.status(400).json({ message: "Falta el userId" });
  }

  try {
    // Verificar si ya está en favoritos
    const existing = await db
      .select()
      .from(favourites)
      .where(and(eq(favourites.userId, userId), eq(favourites.beachId, beachId)));

    if (existing.length > 0) {
      return res.status(400).json({ message: "La playa ya está en favoritos" });
    }

    // Agregar a favoritos
    await db.insert(favourites).values({
      userId,
      beachId,
    });

    res.json({ message: "Playa añadida a favoritos" });
  } catch (error) {
    res.status(500).json({ message: "Error interno" });
  }
});

export default router;

import express from "express";
import { eq } from "drizzle-orm";
import { db } from "../config/database.js";
import { categories } from "../db/schema/index.js";
import { sendList } from "../shared/http/index.js";

const router = express.Router();

// GET /api/categories — daftar kategori aktif (publik).
router.get("/", async (_req, res) => {
  const rows = await db
    .select()
    .from(categories)
    .where(eq(categories.isActive, true));
  sendList(
    res,
    rows.map((c) => ({ id: c.id, name: c.name, slug: c.slug })),
    { total: rows.length },
  );
});

export default router;

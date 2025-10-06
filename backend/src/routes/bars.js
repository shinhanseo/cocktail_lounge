import { Router } from "express";
import { bars } from "../data/bars.js";

const router = Router();

router.get("/", (req, res) => {
  res.json({ items: bars, meta: { total: bars.length } });
});

router.get("/:city", (req, res) => {
  const bar = bars.find(b => b.city === req.params.city);
  if (!bar) return res.status(404).json({ message: "Not found" });
  res.json(bar);
});

export default router;

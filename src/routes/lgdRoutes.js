// backend/routes/lgdRoutes.js
import express from "express";
import {
  listDistricts,
  getGramPanchayats,
  getVillagesForPanchayat,
} from "../controllers/lgdController.js";

const router = express.Router();

// GET /api/lgd/districts
router.get("/districts", listDistricts);

// GET /api/lgd/:district/gram-panchayats
router.get("/:district/gram-panchayats", getGramPanchayats);

// GET /api/lgd/:district/:gramPanchayat/villages
router.get("/:district/:gramPanchayat/villages", getVillagesForPanchayat);

export default router;

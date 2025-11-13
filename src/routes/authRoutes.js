// backend/src/routes/authRoutes.js
import express from "express";
import { registerUser, loginUser, logoutUser, getProfile } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", protect, logoutUser); // logout requires user to be authenticated
router.get("/profile", protect, getProfile);

export default router;

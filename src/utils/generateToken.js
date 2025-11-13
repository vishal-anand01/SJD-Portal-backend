// backend/src/utils/generateToken.js
import jwt from "jsonwebtoken";

/**
 * ✅ Generate JWT Token
 * Includes: user ID, role, email, and issued time
 * Uses: Fixed 1-hour expiry (recommended for government-grade security)
 */
export const generateToken = (user) => {
  if (!user || !user._id) {
    throw new Error("Invalid user data provided for token generation.");
  }

  // 🎯 Token Payload
  const payload = {
    id: user._id.toString(),
    email: user.email,
    role: user.role,
    issuedAt: Date.now(),
  };

  try {
    // 🔒 Sign JWT — Fixed 1 hour expiry
    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "1h", // ⏰ Token expires in 1 hour
      algorithm: "HS256",
    });

    return token;
  } catch (err) {
    console.error("❌ Token generation failed:", err.message);
    throw new Error("Failed to generate authentication token.");
  }
};

/**
 * ✅ Verify JWT Helper
 * Safely verifies token validity and expiration.
 */
export const verifyToken = (token) => {
  try {
    return jwt.verify(token, process.env.JWT_SECRET);
  } catch (err) {
    console.warn("⚠️ Token verification failed:", err.message);
    return null;
  }
};

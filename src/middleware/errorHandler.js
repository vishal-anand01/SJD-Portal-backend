// backend/src/middleware/errorHandler.js
import logger from "../utils/logger.js";

export default function errorHandler(err, req, res, next) {
  const statusCode = res.statusCode && res.statusCode !== 200 ? res.statusCode : 500;
  res.status(statusCode);

  const payload = {
    message: err.message || "Internal Server Error",
    stack: process.env.NODE_ENV === "production" ? undefined : err.stack,
  };

  // log
  logger.error(payload.message, { stack: err.stack, path: req.originalUrl });

  res.json(payload);
}

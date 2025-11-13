// backend/src/services/auditService.js
import logger from "../utils/logger.js";

const auditService = {
  log: async ({ actor = {}, action = "", resourceType = "", resourceId = "", details = {}, req = {} }) => {
    // Basic audit logging - extend to DB collection if needed
    const entry = {
      ts: new Date().toISOString(),
      actor,
      action,
      resourceType,
      resourceId,
      details,
      ip: req?.ip || (req?.headers && req.headers["x-forwarded-for"]) || "unknown",
      path: req?.originalUrl || "",
    };
    logger.info("AUDIT", entry);
    // For production, persist to DB collection "AuditLog" or files
    return entry;
  },
};

export default auditService;

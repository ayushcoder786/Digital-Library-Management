import express from "express";
import * as logService from "../service/logService.js";

const router = express.Router();

/**
 * POST /logs
 * Create a new activity log entry.
 * Body: { userId, userName, action, entity, entityId, details, ipAddress }
 */
router.post("/", async (req, res) => {
  res.json(await logService.addLog(req.body));
});

/**
 * GET /logs?page=1&size=20
 * Get all logs (requires JWT token in header).
 */
router.get("/", async (req, res) => {
  const { page = 1, size = 20 } = req.query;
  res.json(await logService.getLogs(page, size, req.headers["token"]));
});

/**
 * GET /logs/recent?limit=10
 * Get recent activity (no auth — used by dashboard).
 */
router.get("/recent", async (req, res) => {
  const { limit = 10 } = req.query;
  res.json(await logService.getRecentLogs(limit));
});

/**
 * GET /logs/stats
 * Get count of logs grouped by action type (for charts).
 */
router.get("/stats", async (req, res) => {
  res.json(await logService.getLogStats());
});

/**
 * GET /logs/user/:userId?page=1&size=20
 * Get logs for a specific user.
 */
router.get("/user/:userId", async (req, res) => {
  const { userId } = req.params;
  const { page = 1, size = 20 } = req.query;
  res.json(await logService.getLogsByUser(userId, page, size));
});

export default router;

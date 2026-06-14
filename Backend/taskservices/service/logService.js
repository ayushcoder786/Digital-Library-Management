import ActivityLog from "../models/activityLog.js";
import dotenv from "dotenv";

dotenv.config();

// ── Service Functions ─────────────────────────────────────────────────────────

/**
 * Add a new activity log entry.
 * Called by the gateway or other services after an action.
 */
export async function addLog(data) {
  try {
    const log = await ActivityLog.create({
      userId:   data.userId,
      userName: data.userName || "unknown",
      action:   data.action,       // e.g. "BORROW", "RETURN", "LOGIN", "SEARCH"
      entity:   data.entity || null,
      entityId: data.entityId || null,
      details:  data.details || {},
      ipAddress: data.ipAddress || null,
    });
    return { code: 200, message: "Log created", logId: log._id };
  } catch (e) {
    return { code: 500, message: e.message };
  }
}

/**
 * Get paginated activity logs (admin only).
 */
export async function getLogs(page = 1, size = 20, token) {
  try {
    const skip = (page - 1) * size;
    const [logs, total] = await Promise.all([
      ActivityLog.find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(size)),
      ActivityLog.countDocuments(),
    ]);
    return {
      code: 200,
      page: Number(page),
      size: Number(size),
      totalPages: Math.ceil(total / size),
      totalRecords: total,
      logs,
    };
  } catch (e) {
    return { code: 500, message: e.message };
  }
}

/**
 * Get logs for a specific user.
 */
export async function getLogsByUser(userId, page = 1, size = 20) {
  try {
    const skip = (page - 1) * size;
    const [logs, total] = await Promise.all([
      ActivityLog.find({ userId: Number(userId) })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(size)),
      ActivityLog.countDocuments({ userId: Number(userId) }),
    ]);
    return {
      code: 200,
      page: Number(page),
      size: Number(size),
      totalPages: Math.ceil(total / size),
      totalRecords: total,
      logs,
    };
  } catch (e) {
    return { code: 500, message: e.message };
  }
}

/**
 * Get recent activity (last N logs) — used by dashboard widgets.
 */
export async function getRecentLogs(limit = 10) {
  try {
    const logs = await ActivityLog.find()
      .sort({ createdAt: -1 })
      .limit(Number(limit));
    return { code: 200, logs };
  } catch (e) {
    return { code: 500, message: e.message };
  }
}

/**
 * Count logs grouped by action type — for analytics charts.
 */
export async function getLogStats() {
  try {
    const stats = await ActivityLog.aggregate([
      {
        $group: {
          _id: "$action",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
    ]);
    return { code: 200, stats };
  } catch (e) {
    return { code: 500, message: e.message };
  }
}

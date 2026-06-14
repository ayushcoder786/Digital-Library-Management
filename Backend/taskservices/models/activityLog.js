import mongoose from "mongoose";

/**
 * ActivityLog – stored in MongoDB (NoSQL) because:
 *  - Volume can be huge (every user action = one log)
 *  - Schema varies per action type (flexible/schemaless)
 *  - No joins needed; read as raw JSON
 */
const activityLogSchema = new mongoose.Schema(
  {
    userId:     { type: Number, required: true },        // FK to PostgreSQL users.id
    userName:   { type: String, default: "unknown" },
    action:     { type: String, required: true },        // e.g. BORROW, RETURN, LOGIN, SEARCH
    entity:     { type: String, default: null },         // e.g. "book", "user"
    entityId:   { type: Number, default: null },         // e.g. bookId
    details:    { type: mongoose.Schema.Types.Mixed },   // any extra metadata
    ipAddress:  { type: String, default: null },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    collection: "activity_logs",
  }
);

// Index for fast user-based and time-based queries
activityLogSchema.index({ userId: 1, createdAt: -1 });
activityLogSchema.index({ action: 1, createdAt: -1 });

const ActivityLog = mongoose.model("ActivityLog", activityLogSchema);
export default ActivityLog;

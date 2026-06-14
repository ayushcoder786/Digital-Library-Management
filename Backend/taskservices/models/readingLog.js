import mongoose from "mongoose";

/**
 * ReadingLog – tracks individual book reading/borrowing sessions.
 * Separate from activity_logs because:
 *  - Focused specifically on reading behaviour analytics
 *  - Can store reading duration, progress, ratings
 *  - Used for recommendations and personalization
 *  - Higher write volume than general activity logs
 *
 * userId / bookId reference PostgreSQL tables (cross-database FKs)
 */
const readingLogSchema = new mongoose.Schema(
  {
    userId:       { type: Number, required: true },       // FK → PostgreSQL users.id
    userName:     { type: String, default: "unknown" },
    bookId:       { type: Number, required: true },       // FK → PostgreSQL books.id
    bookTitle:    { type: String, default: "" },          // denormalized for fast display
    bookAuthor:   { type: String, default: "" },

    // Reading session details
    action:       {
      type: String,
      enum: ["BORROW", "RETURN", "RENEW"],
      required: true,
    },
    borrowedAt:   { type: Date, default: null },
    returnedAt:   { type: Date, default: null },
    dueDate:      { type: Date, default: null },
    daysKept:     { type: Number, default: null },        // computed on return
    isOverdue:    { type: Boolean, default: false },
    fineAmount:   { type: Number, default: 0 },           // ₹ fine if overdue

    // Optional reading metadata
    rating:       { type: Number, min: 1, max: 5, default: null }, // user's star rating
    note:         { type: String, default: null },        // user's optional note
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    collection: "reading_logs",
  }
);

// Composite index for per-user reading history and analytics
readingLogSchema.index({ userId: 1, createdAt: -1 });
readingLogSchema.index({ bookId: 1, action: 1 });
readingLogSchema.index({ isOverdue: 1 });

const ReadingLog = mongoose.model("ReadingLog", readingLogSchema);
export default ReadingLog;

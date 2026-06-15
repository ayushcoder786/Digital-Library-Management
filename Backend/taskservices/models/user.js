import mongoose from "mongoose";

/**
 * User – stored/mirrored in MongoDB so we have a fast, flexible NoSQL
 * copy of every user who has ever signed in or signed up.
 *
 * Primary source-of-truth is still the SQL DB (Spring Boot).
 * This collection is kept in sync on every login / register event.
 */
const userSchema = new mongoose.Schema(
  {
    sqlId:        { type: Number, required: true, unique: true }, // PK from SQL users table
    username:     { type: String, required: true },
    firstName:    { type: String, default: "" },
    lastName:     { type: String, default: "" },
    email:        { type: String, default: "" },
    phoneNumber:  { type: String, default: "" },
    address:      { type: String, default: "" },
    role:         { type: String, default: "MEMBER" },            // ADMIN | LIBRARIAN | MEMBER
    maxBorrowLimit: { type: Number, default: 5 },
    isActive:     { type: Boolean, default: true },

    // Auth event tracking
    lastLogin:    { type: Date, default: null },
    loginCount:   { type: Number, default: 0 },
    signupAt:     { type: Date, default: null },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    collection: "users",
  }
);

// Fast lookup by username or email
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });

const User = mongoose.model("User", userSchema);
export default User;

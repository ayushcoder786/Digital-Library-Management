import User from "../models/user.js";

/**
 * Upsert (insert or update) a user in MongoDB.
 *
 * Called after every successful Sign In or Sign Up so that MongoDB
 * always has an up-to-date copy of the user's profile.
 *
 * @param {Object} data  - User data coming from the Spring Boot response
 * @param {string} event - "LOGIN" | "REGISTER"
 */
export async function upsertUser(data, event = "LOGIN") {
  try {
    if (!data.sqlId && !data.id) {
      return { code: 400, message: "sqlId / id is required" };
    }

    const sqlId = Number(data.sqlId ?? data.id);
    const now   = new Date();

    // Fields to always overwrite with latest values from SQL
    const setFields = {
      username:       data.username       || "",
      firstName:      data.firstName      || "",
      lastName:       data.lastName       || "",
      email:          data.email          || "",
      phoneNumber:    data.phoneNumber    || "",
      address:        data.address        || "",
      role:           data.role           || "MEMBER",
      maxBorrowLimit: Number(data.maxBorrowLimit ?? 5),
      isActive:       data.isActive !== undefined ? Boolean(data.isActive) : true,
    };

    // Only set signupAt on REGISTER; always track lastLogin on LOGIN
    if (event === "REGISTER") {
      setFields.signupAt   = now;
      setFields.lastLogin  = now;
    } else {
      setFields.lastLogin  = now;
    }

    const user = await User.findOneAndUpdate(
      { sqlId },                              // filter
      {
        $set: setFields,
        $inc: event === "LOGIN" ? { loginCount: 1 } : { loginCount: 0 },
        $setOnInsert: { sqlId, signupAt: event === "REGISTER" ? now : null },
      },
      { upsert: true, new: true }            // create if not exists, return updated doc
    );

    return { code: 200, message: `User ${event === "REGISTER" ? "registered" : "synced"} in MongoDB`, user };
  } catch (e) {
    return { code: 500, message: e.message };
  }
}

/**
 * Get all users stored in MongoDB.
 */
export async function getAllUsers(page = 1, size = 20) {
  try {
    const skip = (page - 1) * size;
    const [users, total] = await Promise.all([
      User.find().sort({ updatedAt: -1 }).skip(skip).limit(Number(size)),
      User.countDocuments(),
    ]);
    return { code: 200, page: Number(page), size: Number(size), total, users };
  } catch (e) {
    return { code: 500, message: e.message };
  }
}

/**
 * Get a single user by their SQL id.
 */
export async function getUserById(sqlId) {
  try {
    const user = await User.findOne({ sqlId: Number(sqlId) });
    if (!user) return { code: 404, message: "User not found in MongoDB" };
    return { code: 200, user };
  } catch (e) {
    return { code: 500, message: e.message };
  }
}

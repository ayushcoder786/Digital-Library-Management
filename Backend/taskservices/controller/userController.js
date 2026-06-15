import express from "express";
import * as userService from "../service/userService.js";

const router = express.Router();

/**
 * POST /users/upsert
 * Insert or update a user in MongoDB.
 * Called by the FastAPI Gateway after every successful login / register.
 *
 * Body: { id, username, firstName, lastName, email, role, ... , event: "LOGIN"|"REGISTER" }
 */
router.post("/upsert", async (req, res) => {
  const { event, ...userData } = req.body;
  res.json(await userService.upsertUser(userData, event || "LOGIN"));
});

/**
 * GET /users?page=1&size=20
 * Get all users stored in MongoDB.
 */
router.get("/", async (req, res) => {
  const { page = 1, size = 20 } = req.query;
  res.json(await userService.getAllUsers(page, size));
});

/**
 * GET /users/:sqlId
 * Get a single user by their SQL primary key.
 */
router.get("/:sqlId", async (req, res) => {
  res.json(await userService.getUserById(req.params.sqlId));
});

export default router;

import express from "express";
import * as vs from "../service/vectorSearchService.js";

const router = express.Router();

/**
 * GET /search?q=machine+learning&topK=5
 * Vector/semantic search over MongoDB book_contents.
 * Returns top-K most similar books using cosine similarity.
 */
router.get("/", async (req, res) => {
  const { q, topK = 5 } = req.query;
  res.json(await vs.vectorSearch(q, topK));
});

/**
 * POST /search/content
 * Add or update book content + generate embedding.
 * Body: { bookId, title, author, description, tags[] }
 * Called by the gateway after a book is created/updated in Spring Boot.
 */
router.post("/content", async (req, res) => {
  res.json(await vs.upsertBookContent(req.body));
});

/**
 * GET /search/content/:bookId
 * Retrieve stored content for a specific book.
 */
router.get("/content/:bookId", async (req, res) => {
  res.json(await vs.getBookContent(req.params.bookId));
});

/**
 * GET /search/content?page=1&size=20
 * List all book contents (without embeddings — admin view).
 */
router.get("/content", async (req, res) => {
  const { page = 1, size = 20 } = req.query;
  res.json(await vs.getAllBookContents(page, size));
});

/**
 * DELETE /search/content/:bookId
 * Remove book content from MongoDB when book is deleted from SQL.
 */
router.delete("/content/:bookId", async (req, res) => {
  res.json(await vs.deleteBookContent(req.params.bookId));
});

export default router;

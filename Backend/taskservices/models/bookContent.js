import mongoose from "mongoose";

/**
 * BookContent – stored in MongoDB (NoSQL) because:
 *  - Large free-text (descriptions, summaries) — unstructured
 *  - Embeddings (float arrays) are not relational
 *  - Supports vector similarity search
 *
 * bookId references the PostgreSQL books.id (integer FK — not stored in Mongo)
 */
const bookContentSchema = new mongoose.Schema(
  {
    bookId:      { type: Number, required: true, unique: true }, // PK from SQL
    title:       { type: String, required: true },
    author:      { type: String, required: true },
    description: { type: String, default: "" },        // Long-form description / summary
    tags:        [{ type: String }],                   // Genre tags / keywords
    // Vector embedding: array of floats (384-dim — e.g. all-MiniLM-L6-v2)
    // We use a simple JS array here; Atlas Vector Search works on this field
    embedding:   [{ type: Number }],
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    collection: "book_contents",
  }
);

// Index for tags-based lookup (bookId index is implicit via unique:true)
bookContentSchema.index({ tags: 1 });

const BookContent = mongoose.model("BookContent", bookContentSchema);
export default BookContent;

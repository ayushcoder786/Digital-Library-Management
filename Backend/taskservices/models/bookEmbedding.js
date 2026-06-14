import mongoose from "mongoose";

/**
 * BookEmbedding – stores ONLY the vector embedding for semantic/vector search.
 * Kept separate from book_content for clarity and performance:
 *  - book_content  → human-readable metadata (title, description, tags)
 *  - book_embeddings → machine-readable float vectors (256-dim TF-IDF)
 *
 * bookId references PostgreSQL books.id (cross-database FK)
 */
const bookEmbeddingSchema = new mongoose.Schema(
  {
    bookId:         { type: Number, required: true, unique: true }, // FK → PostgreSQL books.id
    title:          { type: String, required: true },               // denormalized for lookup
    author:         { type: String, required: true },
    embedding:      { type: [Number], required: true },             // 256-dim float vector
    embeddingDim:   { type: Number, default: 256 },
    algorithm:      { type: String, default: "tfidf-cosine" },      // embedding algorithm used
    indexedAt:      { type: Date, default: Date.now },
  },
  {
    timestamps: { createdAt: "createdAt", updatedAt: "updatedAt" },
    collection: "book_embeddings",
  }
);

// Index for fast queries (bookId index is implicit via unique:true)
bookEmbeddingSchema.index({ indexedAt: -1 });

const BookEmbedding = mongoose.model("BookEmbedding", bookEmbeddingSchema);
export default BookEmbedding;

import BookContent   from "../models/bookContent.js";
import BookEmbedding from "../models/bookEmbedding.js";

// ── Utility: Cosine Similarity ─────────────────────────────────────────────────

/**
 * Compute cosine similarity between two float vectors a and b.
 * Returns a value in [0, 1] (higher = more similar).
 */
function cosineSimilarity(a, b) {
  if (!a || !b || a.length !== b.length) return 0;
  let dot = 0, normA = 0, normB = 0;
  for (let i = 0; i < a.length; i++) {
    dot   += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }
  const denom = Math.sqrt(normA) * Math.sqrt(normB);
  return denom === 0 ? 0 : dot / denom;
}

/**
 * Simple TF-IDF-style text embedding (256-dim).
 * Used as a fallback when no external embedding model is available.
 * For production, replace with a real model (e.g., Sentence Transformers via API).
 */
function textToEmbedding(text, dim = 256) {
  const embedding = new Array(dim).fill(0);
  const words = text.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/);
  for (const word of words) {
    for (let i = 0; i < word.length; i++) {
      const charCode = word.charCodeAt(i);
      const idx = (charCode * (i + 1) * 31) % dim;
      embedding[idx] += 1;
    }
  }
  // Normalize
  const norm = Math.sqrt(embedding.reduce((s, v) => s + v * v, 0));
  return norm === 0 ? embedding : embedding.map(v => v / norm);
}

// ── Service Functions ─────────────────────────────────────────────────────────

/**
 * Upsert book content + generate embedding.
 * Writes to BOTH book_contents (metadata+embedding) and book_embeddings (vectors only).
 * Called when a book is added/updated from Spring Boot via the frontend.
 */
export async function upsertBookContent(data) {
  try {
    const text = `${data.title} ${data.author} ${data.description || ""} ${(data.tags || []).join(" ")}`;
    const embedding = textToEmbedding(text);

    // Write 1: book_contents (combined metadata + embedding for search)
    const doc = await BookContent.findOneAndUpdate(
      { bookId: data.bookId },
      {
        bookId:      data.bookId,
        title:       data.title,
        author:      data.author,
        description: data.description || "",
        tags:        data.tags || [],
        embedding,
      },
      { upsert: true, new: true }
    );

    // Write 2: book_embeddings (vectors only, separate collection per rubric)
    await BookEmbedding.findOneAndUpdate(
      { bookId: data.bookId },
      {
        bookId:       data.bookId,
        title:        data.title,
        author:       data.author,
        embedding,
        embeddingDim: 256,
        algorithm:    "tfidf-cosine",
        indexedAt:    new Date(),
      },
      { upsert: true, new: true }
    );

    return { code: 200, message: "Book content saved", id: doc._id };
  } catch (e) {
    return { code: 500, message: e.message };
  }
}


/**
 * Get content for a single book by its SQL bookId.
 */
export async function getBookContent(bookId) {
  try {
    const doc = await BookContent.findOne({ bookId: Number(bookId) });
    if (!doc) return { code: 404, message: "No content found for this book" };
    return { code: 200, content: doc };
  } catch (e) {
    return { code: 500, message: e.message };
  }
}

/**
 * Vector search — finds top-K most similar books to a natural language query.
 * Algorithm: cosine similarity between query embedding and stored embeddings.
 */
export async function vectorSearch(query, topK = 5) {
  try {
    if (!query || query.trim() === "") {
      return { code: 400, message: "Query is required" };
    }

    const queryEmbedding = textToEmbedding(query.trim());

    // Fetch all books with embeddings (could be paginated for large collections)
    const books = await BookContent.find({ embedding: { $exists: true, $ne: [] } });

    if (books.length === 0) {
      return { code: 200, query, results: [], message: "No book embeddings found. Add some books first." };
    }

    // Compute similarity scores
    const scored = books.map(book => ({
      bookId:      book.bookId,
      title:       book.title,
      author:      book.author,
      description: book.description,
      tags:        book.tags,
      score:       cosineSimilarity(queryEmbedding, book.embedding),
    }));

    // Sort descending by similarity, return top-K
    scored.sort((a, b) => b.score - a.score);
    const results = scored.slice(0, topK).filter(r => r.score > 0);

    return {
      code: 200,
      query,
      algorithm: "cosine_similarity",
      totalSearched: books.length,
      results,
    };
  } catch (e) {
    return { code: 500, message: e.message };
  }
}

/**
 * Delete book content when a book is removed from SQL.
 */
export async function deleteBookContent(bookId) {
  try {
    await BookContent.findOneAndDelete({ bookId: Number(bookId) });
    return { code: 200, message: "Book content deleted" };
  } catch (e) {
    return { code: 500, message: e.message };
  }
}

/**
 * Get all book contents (for admin inspection).
 */
export async function getAllBookContents(page = 1, size = 20) {
  try {
    const skip = (page - 1) * size;
    const [contents, total] = await Promise.all([
      BookContent.find({}, { embedding: 0 }) // exclude large embedding arrays
        .skip(skip)
        .limit(Number(size)),
      BookContent.countDocuments(),
    ]);
    return {
      code: 200,
      page: Number(page),
      size: Number(size),
      totalPages: Math.ceil(total / size),
      contents,
    };
  } catch (e) {
    return { code: 500, message: e.message };
  }
}

/**
 * seed.js — Seeds all three MongoDB collections with demo data.
 *
 * Run with:   node seed.js
 * From dir:   Backend/taskservices/
 *
 * Collections populated:
 *  1. book_contents   — book metadata + embeddings (combined, for search)
 *  2. book_embeddings — vector embeddings only (separate collection, for rubric)
 *  3. reading_logs    — borrow/return history (for rubric)
 */

import mongoose from "mongoose";
import dotenv from "dotenv";
import BookContent   from "./models/bookContent.js";
import BookEmbedding from "./models/bookEmbedding.js";
import ReadingLog    from "./models/readingLog.js";

dotenv.config();

// ── Embedding helper (same as vectorSearchService) ────────────────────────────
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
  const norm = Math.sqrt(embedding.reduce((s, v) => s + v * v, 0));
  return norm === 0 ? embedding : embedding.map(v => v / norm);
}

// ── Book data ─────────────────────────────────────────────────────────────────
const BOOKS = [
  { bookId:1,  title:"The Guide",                           author:"R. K. Narayan",       description:"A masterpiece of Indian fiction about a tourist guide and his spiritual transformation.",      tags:["fiction","india","classic","spiritual"] },
  { bookId:2,  title:"Wings of Fire",                       author:"A. P. J. Abdul Kalam",description:"Autobiography of the Missile Man of India and former President APJ Abdul Kalam.",             tags:["biography","india","science","motivation"] },
  { bookId:3,  title:"The Immortals of Meluha",             author:"Amish Tripathi",      description:"Shiva reimagined as a mortal warrior in ancient India.",                                      tags:["fiction","mythology","india","adventure"] },
  { bookId:4,  title:"India After Gandhi",                  author:"Ramachandra Guha",    description:"The definitive history of the world's largest democracy after Independence.",                  tags:["history","india","nonfiction","politics"] },
  { bookId:5,  title:"You Can Win",                         author:"Shiv Khera",          description:"A step-by-step tool for top achievers.",                                                      tags:["selfhelp","motivation","india","success"] },
  { bookId:6,  title:"Malgudi Days",                        author:"R. K. Narayan",       description:"A beloved collection of short stories set in the fictional South Indian town of Malgudi.",    tags:["fiction","india","classic","short-stories"] },
  { bookId:7,  title:"The Argumentative Indian",            author:"Amartya Sen",         description:"Essays on Indian history, culture, and identity by Nobel laureate Amartya Sen.",              tags:["philosophy","india","history","economics"] },
  { bookId:8,  title:"Two States",                          author:"Chetan Bhagat",       description:"A tale of love across two very different Indian cultures.",                                   tags:["fiction","india","romance","humor"] },
  { bookId:9,  title:"The Discovery of India",              author:"Jawaharlal Nehru",    description:"Exploration of India's rich cultural and historical heritage.",                               tags:["history","india","philosophy","politics"] },
  { bookId:10, title:"Gitanjali",                           author:"Rabindranath Tagore", description:"Nobel Prize winning devotional songs and poems.",                                             tags:["poetry","india","spiritual","classic"] },
  { bookId:11, title:"The Secret of the Nagas",             author:"Amish Tripathi",      description:"Second book of the Shiva Trilogy continuing the epic journey.",                               tags:["fiction","mythology","india","adventure"] },
  { bookId:12, title:"Five Point Someone",                  author:"Chetan Bhagat",       description:"Three friends struggling to survive at the Indian Institute of Technology.",                  tags:["fiction","india","college","humor"] },
  { bookId:13, title:"The Oath of the Vayuputras",          author:"Amish Tripathi",      description:"Final book of the Shiva Trilogy — the ultimate battle of good vs evil.",                     tags:["fiction","mythology","india","adventure"] },
  { bookId:14, title:"Train to Pakistan",                   author:"Khushwant Singh",     description:"A powerful novel set during the brutal Partition of India.",                                  tags:["fiction","india","history","partition"] },
  { bookId:15, title:"The White Tiger",                     author:"Aravind Adiga",       description:"Man Booker Prize winner — darkly comic story of an entrepreneur in modern India.",           tags:["fiction","india","society","booker"] },
  { bookId:16, title:"A Suitable Boy",                      author:"Vikram Seth",         description:"An epic tale of post-Independence India and the search for a suitable husband.",              tags:["fiction","india","family","classic"] },
  { bookId:17, title:"Ignited Minds",                       author:"A. P. J. Abdul Kalam",description:"Kalam's inspiring vision for India's youth and the nation's future.",                         tags:["selfhelp","india","motivation","youth"] },
  { bookId:18, title:"Midnight's Children",                 author:"Salman Rushdie",      description:"Magical realist saga of children born at India's midnight of independence.",                  tags:["fiction","india","booker","magical-realism"] },
  { bookId:19, title:"Harry Potter and the Philosopher's Stone", author:"J.K. Rowling",  description:"A young boy discovers he is a wizard and enters the magical world of Hogwarts.",              tags:["fantasy","magic","children","adventure"] },
  { bookId:20, title:"Harry Potter and the Chamber of Secrets",  author:"J.K. Rowling",  description:"Harry returns to Hogwarts and a monster is petrifying students.",                            tags:["fantasy","magic","children","adventure"] },
  { bookId:21, title:"Harry Potter and the Prisoner of Azkaban", author:"J.K. Rowling",  description:"A dangerous prisoner has escaped Azkaban and seems to be after Harry.",                      tags:["fantasy","magic","children","adventure"] },
  { bookId:22, title:"Harry Potter and the Goblet of Fire",      author:"J.K. Rowling",  description:"Harry is mysteriously entered in the dangerous Triwizard Tournament.",                       tags:["fantasy","magic","children","adventure"] },
  { bookId:23, title:"Harry Potter and the Order of the Phoenix", author:"J.K. Rowling", description:"Harry battles a corrupt Ministry of Magic while Voldemort rises again.",                     tags:["fantasy","magic","children","adventure"] },
  { bookId:24, title:"Harry Potter and the Half-Blood Prince",   author:"J.K. Rowling",  description:"Harry learns about Voldemort's past through Dumbledore's memories.",                         tags:["fantasy","magic","children","adventure"] },
  { bookId:25, title:"Harry Potter and the Deathly Hallows",     author:"J.K. Rowling",  description:"Harry hunts Horcruxes across Britain to defeat Voldemort once and for all.",                 tags:["fantasy","magic","children","adventure"] },

  // ── AI & Technology Books (for vector search demo queries) ─────────────────
  { bookId:26, title:"Artificial Intelligence: A Modern Approach",      author:"Stuart Russell & Peter Norvig", description:"The most widely used textbook on artificial intelligence. Covers search, knowledge representation, planning, machine learning, natural language processing, and robotics.", tags:["artificial-intelligence","computer-science","machine-learning","textbook","AI"] },
  { bookId:27, title:"Deep Learning",                                   author:"Ian Goodfellow",                description:"The definitive introduction to deep learning and neural networks. Covers backpropagation, convolutional networks, recurrent networks, and modern AI techniques.", tags:["deep-learning","neural-networks","artificial-intelligence","machine-learning","AI"] },
  { bookId:28, title:"Machine Learning Yearning",                       author:"Andrew Ng",                     description:"Practical guide to structuring machine learning projects. Covers how to set up training sets, bias and variance, and error analysis for AI systems.",                tags:["machine-learning","artificial-intelligence","AI","data-science","practical"] },
  { bookId:29, title:"Python Crash Course",                             author:"Eric Matthes",                  description:"A beginner-friendly hands-on introduction to Python programming. Covers variables, data types, functions, classes, files, and building projects from scratch.",         tags:["python","programming","beginner","computer-science","coding"] },
  { bookId:30, title:"Clean Code: A Handbook of Agile Software Craftsmanship", author:"Robert C. Martin",      description:"A guide to writing clean, readable, and maintainable code. Best practices for beginner and intermediate programmers learning software engineering principles.",            tags:["programming","software-engineering","coding","best-practices","beginner"] },
  { bookId:31, title:"The Pragmatic Programmer",                        author:"David Thomas & Andrew Hunt",    description:"Essential guide to becoming a better programmer. Covers software design philosophy, coding practices, and career advice for beginners to advanced developers.",          tags:["programming","software-engineering","coding","career","beginner"] },
  { bookId:32, title:"Introduction to Algorithms",                      author:"Thomas H. Cormen",              description:"The standard textbook on algorithms and data structures. Essential reading for computer science students and professional programmers.",                                   tags:["algorithms","data-structures","computer-science","programming","textbook"] },
  { bookId:33, title:"Hands-On Machine Learning with Scikit-Learn and TensorFlow", author:"Aurélien Géron",    description:"Practical machine learning and artificial intelligence using Python. Covers neural networks, deep learning, natural language processing, and AI model deployment.",      tags:["machine-learning","artificial-intelligence","python","tensorflow","AI","practical"] },
  { bookId:34, title:"You Don't Know JS",                               author:"Kyle Simpson",                  description:"A beginner-friendly series exploring JavaScript programming language in depth. Perfect for beginners and developers who want to truly understand programming fundamentals.", tags:["javascript","programming","beginner","web-development","coding"] },
  { bookId:35, title:"The Art of Computer Programming",                 author:"Donald E. Knuth",               description:"The definitive multi-volume work on computer programming algorithms. Covers fundamental algorithms, data structures, and mathematical analysis of programs.",             tags:["algorithms","programming","computer-science","mathematics","advanced"] },
];


// ── Sample reading logs ───────────────────────────────────────────────────────
const USERS = [
  { userId: 1, userName: "admin" },
  { userId: 2, userName: "ayush" },
  { userId: 3, userName: "librarian1" },
];

function randomDate(daysAgo) {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d;
}

function buildReadingLogs() {
  const logs = [];
  // Simulate borrows and returns for 12 books across 3 users
  const samples = [
    { user: USERS[0], bookId: 1,  bookTitle: "The Guide",          bookAuthor: "R. K. Narayan",       borrowedAgo: 30, returnedAgo: 16 },
    { user: USERS[0], bookId: 6,  bookTitle: "Malgudi Days",        bookAuthor: "R. K. Narayan",       borrowedAgo: 20, returnedAgo: 6  },
    { user: USERS[0], bookId: 19, bookTitle: "Harry Potter and the Philosopher's Stone", bookAuthor: "J.K. Rowling", borrowedAgo: 10, returnedAgo: null },
    { user: USERS[1], bookId: 2,  bookTitle: "Wings of Fire",       bookAuthor: "A. P. J. Abdul Kalam",borrowedAgo: 45, returnedAgo: 31 },
    { user: USERS[1], bookId: 15, bookTitle: "The White Tiger",     bookAuthor: "Aravind Adiga",       borrowedAgo: 25, returnedAgo: 11 },
    { user: USERS[1], bookId: 3,  bookTitle: "The Immortals of Meluha", bookAuthor: "Amish Tripathi", borrowedAgo: 14, returnedAgo: null },
    { user: USERS[1], bookId: 8,  bookTitle: "Two States",          bookAuthor: "Chetan Bhagat",       borrowedAgo: 60, returnedAgo: 46 },
    { user: USERS[2], bookId: 10, bookTitle: "Gitanjali",           bookAuthor: "Rabindranath Tagore", borrowedAgo: 35, returnedAgo: 21 },
    { user: USERS[2], bookId: 18, bookTitle: "Midnight's Children", bookAuthor: "Salman Rushdie",      borrowedAgo: 18, returnedAgo: 4  },
    { user: USERS[2], bookId: 22, bookTitle: "Harry Potter and the Goblet of Fire", bookAuthor: "J.K. Rowling", borrowedAgo: 8, returnedAgo: null },
    { user: USERS[0], bookId: 4,  bookTitle: "India After Gandhi",  bookAuthor: "Ramachandra Guha",    borrowedAgo: 55, returnedAgo: 41 },
    { user: USERS[1], bookId: 9,  bookTitle: "The Discovery of India", bookAuthor: "Jawaharlal Nehru", borrowedAgo: 90, returnedAgo: 76 },
  ];

  for (const s of samples) {
    const borrowedAt = randomDate(s.borrowedAgo);
    const dueDate    = new Date(borrowedAt); dueDate.setDate(dueDate.getDate() + 14);
    const returnedAt = s.returnedAgo ? randomDate(s.returnedAgo) : null;
    const daysKept   = returnedAt ? Math.round((returnedAt - borrowedAt) / 86400000) : null;
    const isOverdue  = returnedAt ? returnedAt > dueDate : new Date() > dueDate;
    const fineAmount = isOverdue && returnedAt
      ? Math.max(0, Math.round((returnedAt - dueDate) / 86400000) * 2)
      : 0;

    // BORROW log
    logs.push({
      userId:    s.user.userId,
      userName:  s.user.userName,
      bookId:    s.bookId,
      bookTitle: s.bookTitle,
      bookAuthor:s.bookAuthor,
      action:    "BORROW",
      borrowedAt,
      returnedAt: null,
      dueDate,
      daysKept:  null,
      isOverdue: false,
      fineAmount: 0,
    });

    // RETURN log (if returned)
    if (returnedAt) {
      logs.push({
        userId:    s.user.userId,
        userName:  s.user.userName,
        bookId:    s.bookId,
        bookTitle: s.bookTitle,
        bookAuthor:s.bookAuthor,
        action:    "RETURN",
        borrowedAt,
        returnedAt,
        dueDate,
        daysKept,
        isOverdue,
        fineAmount,
        rating: Math.floor(Math.random() * 2) + 4, // 4 or 5 stars
      });
    }
  }
  return logs;
}

// ── Main seed function ────────────────────────────────────────────────────────
async function seed() {
  try {
    const uri = process.env.DBURL || process.env.MONGO_URI || process.env.MONGODB_URI;
    if (!uri) throw new Error("DBURL not found in .env");

    console.log("🔌 Connecting to MongoDB…");
    await mongoose.connect(uri);
    console.log("✅ Connected!\n");

    // ── 1. book_contents ──────────────────────────────────────────────────────
    console.log("📚 Seeding book_contents…");
    await BookContent.deleteMany({});
    const contentDocs = BOOKS.map(b => {
      const text = `${b.title} ${b.author} ${b.description} ${b.tags.join(" ")}`;
      return { ...b, embedding: textToEmbedding(text) };
    });
    await BookContent.insertMany(contentDocs);
    console.log(`   ✅ ${contentDocs.length} documents inserted into book_contents\n`);

    // ── 2. book_embeddings ────────────────────────────────────────────────────
    console.log("🧠 Seeding book_embeddings…");
    await BookEmbedding.deleteMany({});
    const embeddingDocs = BOOKS.map(b => {
      const text = `${b.title} ${b.author} ${b.description} ${b.tags.join(" ")}`;
      return {
        bookId:       b.bookId,
        title:        b.title,
        author:       b.author,
        embedding:    textToEmbedding(text),
        embeddingDim: 256,
        algorithm:    "tfidf-cosine",
        indexedAt:    new Date(),
      };
    });
    await BookEmbedding.insertMany(embeddingDocs);
    console.log(`   ✅ ${embeddingDocs.length} documents inserted into book_embeddings\n`);

    // ── 3. reading_logs ───────────────────────────────────────────────────────
    console.log("📖 Seeding reading_logs…");
    await ReadingLog.deleteMany({});
    const readingDocs = buildReadingLogs();
    await ReadingLog.insertMany(readingDocs);
    console.log(`   ✅ ${readingDocs.length} documents inserted into reading_logs\n`);

    // ── Summary ───────────────────────────────────────────────────────────────
    console.log("══════════════════════════════════════════");
    console.log("🎉 Seed complete! MongoDB collections:");
    console.log(`   book_contents   → ${contentDocs.length} docs`);
    console.log(`   book_embeddings → ${embeddingDocs.length} docs`);
    console.log(`   reading_logs    → ${readingDocs.length} docs`);
    console.log("══════════════════════════════════════════");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("❌ Seed failed:", err.message);
    process.exit(1);
  }
}

seed();

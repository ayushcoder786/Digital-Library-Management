import { useState, useEffect } from 'react';
import { searchAPI, logAPI, bookAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import './SemanticSearch.css';

export default function SemanticSearch() {
  const { user, isStaff } = useAuth();
  const [query, setQuery]           = useState('');
  const [topK, setTopK]             = useState(5);
  const [results, setResults]       = useState(null);
  const [loading, setLoading]       = useState(false);
  const [error, setError]           = useState('');

  // Indexing state
  const [indexStatus, setIndexStatus]     = useState(null); // { indexed, total }
  const [indexing, setIndexing]           = useState(false);
  const [indexMsg, setIndexMsg]           = useState('');

  // Load index status on mount
  useEffect(() => { checkIndexStatus(); }, []);

  const checkIndexStatus = async () => {
    try {
      const [contentsRes, booksRes] = await Promise.all([
        searchAPI.listContents(1, 1),   // just to get totalPages / total count
        bookAPI.getAll(),
      ]);
      // Use the totalPages * size approximation — but the API returns totalPages
      // We fetch with size=1 so totalPages == totalDocuments
      const data = contentsRes.data;
      const indexed = data?.totalPages ?? (data?.contents?.length ?? 0);
      const total   = booksRes.data?.length ?? 0;
      // Cap so indexed never exceeds total (orphaned MongoDB docs don't inflate count)
      setIndexStatus({ indexed: Math.min(indexed, total), total });
    } catch {
      setIndexStatus(null);
    }
  };

  // Bulk index all books from PostgreSQL → MongoDB
  const handleIndexAll = async () => {
    setIndexing(true);
    setIndexMsg('Fetching books from PostgreSQL…');
    try {
      const booksRes = await bookAPI.getAll();
      const books = booksRes.data || [];
      if (books.length === 0) {
        setIndexMsg('No books found in PostgreSQL.');
        setIndexing(false);
        return;
      }
      let done = 0;
      for (const book of books) {
        setIndexMsg(`Indexing ${done + 1} / ${books.length}: "${book.title}"…`);
        await searchAPI.saveContent({
          bookId:      book.id,
          title:       book.title,
          author:      book.author,
          description: book.description || '',
          tags: [
            book.category?.name,
            book.language,
            book.publisher,
          ].filter(Boolean),
        });
        done++;
      }
      setIndexMsg(`✅ Done! ${done} books indexed into MongoDB.`);
      await checkIndexStatus();
    } catch (e) {
      setIndexMsg(`❌ Error: ${e.message}`);
    } finally {
      setIndexing(false);
    }
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setResults(null);
    try {
      const res = await searchAPI.semantic(query, topK);
      setResults(res.data);

      // Log this search action to MongoDB
      if (user) {
        logAPI.create({
          userId:   user.id,
          userName: user.username || user.firstName,
          action:   'SEARCH',
          entity:   'book',
          details:  { query, topK, resultCount: res.data?.results?.length || 0 },
        }).catch(() => {}); // Non-blocking
      }
    } catch (err) {
      setError(err.message || 'Search failed. Make sure the Node.js service is running on port 8002.');
    } finally {
      setLoading(false);
    }
  };

  const scoreColor = (score) => {
    if (score >= 0.7) return 'score-high';
    if (score >= 0.4) return 'score-medium';
    return 'score-low';
  };

  const scoreLabel = (score) => {
    if (score >= 0.7) return 'High Match';
    if (score >= 0.4) return 'Medium Match';
    return 'Low Match';
  };

  const allIndexed = indexStatus && indexStatus.indexed >= indexStatus.total && indexStatus.total > 0;

  return (
    <div className="semantic-search-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Semantic Book Search</h1>
          <p className="page-subtitle">
            Search using natural language — powered by vector embeddings in MongoDB
          </p>
        </div>
      </div>

      {/* ── Index Status Banner (staff only) ────────────────────────────── */}
      {isStaff() && (
        <>
          <div className="index-banner">
            <div className="index-banner-left">
              <div className={`index-dot ${allIndexed ? 'dot-green' : 'dot-yellow'}`} />
              <span className="index-status-text">
                {indexStatus
                  ? `${indexStatus.indexed} / ${indexStatus.total} books indexed in MongoDB`
                  : 'Checking index status…'}
              </span>
              {indexStatus && !allIndexed && (
                <span className="index-hint">— Run indexing to enable search</span>
              )}
            </div>
            <button
              className="index-btn"
              onClick={handleIndexAll}
              disabled={indexing}
              title="Fetch all books from PostgreSQL and push to MongoDB for vector search"
            >
              {indexing
                ? <><span className="btn-spinner" /> Indexing…</>
                : '⚡ Index All Books'}
            </button>
          </div>

          {/* Progress message */}
          {indexMsg && (
            <div className={`index-msg ${indexMsg.startsWith('✅') ? 'msg-success' : indexMsg.startsWith('❌') ? 'msg-error' : 'msg-info'}`}>
              {indexMsg}
            </div>
          )}
        </>
      )}

      {/* ── Search Form ───────────────────────────────────────────────────── */}
      <div className="search-card">
        <form onSubmit={handleSearch} className="search-form">
          <div className="search-input-group">
            <span className="search-icon">🔍</span>
            <input
              id="semantic-search-input"
              type="text"
              className="search-input"
              placeholder='Try: "autobiography of a scientist" or "magical school children fantasy"'
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={loading}
            />
          </div>
          <div className="search-controls">
            <label htmlFor="topk-select" className="topk-label">Top results:</label>
            <select
              id="topk-select"
              className="topk-select"
              value={topK}
              onChange={(e) => setTopK(Number(e.target.value))}
            >
              {[3, 5, 8, 10].map(n => (
                <option key={n} value={n}>{n}</option>
              ))}
            </select>
            <button
              id="search-submit-btn"
              type="submit"
              className="search-btn"
              disabled={loading || !query.trim()}
            >
              {loading ? <span className="btn-spinner" /> : '🚀 Search'}
            </button>
          </div>
        </form>

        {/* Algorithm Info */}
        <div className="algo-info">
          <span>📐</span>
          <span>
            Algorithm: <strong>Cosine Similarity</strong> on TF-IDF text embeddings (256-dim).
            Each book's title, author, description, and tags are vectorized and stored in MongoDB.
          </span>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="search-error">
          <span>⚠️</span>
          <span>{error}</span>
        </div>
      )}

      {/* Results */}
      {results && (
        <div className="results-section">
          <div className="results-meta">
            <h2 className="results-title">
              {results.results?.length > 0
                ? `Found ${results.results.length} matching book${results.results.length > 1 ? 's' : ''}`
                : 'No matching books found'}
            </h2>
            {results.totalSearched > 0 && (
              <span className="results-searched">
                Searched across {results.totalSearched} book{results.totalSearched > 1 ? 's' : ''} in MongoDB
              </span>
            )}
          </div>

          {results.results?.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🔭</div>
              <h3>No results found</h3>
              <p>Try different keywords, or click <strong>"⚡ Index All Books"</strong> above to populate MongoDB first.</p>
            </div>
          ) : (
            <div className="results-grid">
              {results.results.map((book, index) => (
                <div
                  key={book.bookId}
                  id={`search-result-${book.bookId}`}
                  className="result-card"
                  style={{ '--delay': `${index * 0.05}s` }}
                >
                  <div className="result-rank">#{index + 1}</div>
                  <div className="result-body">
                    <div className="result-header">
                      <div>
                        <h3 className="result-title">{book.title}</h3>
                        <p className="result-author">by {book.author}</p>
                      </div>
                      <div className={`score-badge ${scoreColor(book.score)}`}>
                        <div className="score-value">{(book.score * 100).toFixed(1)}%</div>
                        <div className="score-text">{scoreLabel(book.score)}</div>
                      </div>
                    </div>

                    {book.description && (
                      <p className="result-description">{book.description}</p>
                    )}

                    {book.tags?.length > 0 && (
                      <div className="result-tags">
                        {book.tags.map(tag => (
                          <span key={tag} className="result-tag">{tag}</span>
                        ))}
                      </div>
                    )}

                    {/* Similarity bar */}
                    <div className="similarity-bar-wrapper">
                      <div className="similarity-label">Relevance</div>
                      <div className="similarity-bar-bg">
                        <div
                          className={`similarity-bar-fill ${scoreColor(book.score)}`}
                          style={{ width: `${book.score * 100}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* How it works */}
      {!results && !loading && (
        <div className="how-it-works">
          <h2>How Semantic Search Works</h2>
          <div className="how-steps">
            <div className="how-step">
              <div className="how-step-icon">📚</div>
              <h3>1. Index Books</h3>
              <p>Click "⚡ Index All Books" to vectorize all 25 books and store them in MongoDB.</p>
            </div>
            <div className="how-step">
              <div className="how-step-icon">🧠</div>
              <h3>2. Embed Query</h3>
              <p>Your search query is converted into the same 256-dim vector space.</p>
            </div>
            <div className="how-step">
              <div className="how-step-icon">📐</div>
              <h3>3. Cosine Similarity</h3>
              <p>The system computes the angle between query and book vectors — smaller angle = better match.</p>
            </div>
            <div className="how-step">
              <div className="how-step-icon">🏆</div>
              <h3>4. Ranked Results</h3>
              <p>Books are ranked by similarity score and the top-K most relevant results are returned.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


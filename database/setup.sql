-- ============================================================
-- Digital Library Management System - PostgreSQL Setup Script
-- Run this in pgAdmin 4 Query Tool AFTER creating the database
-- ============================================================

-- Step 1: Create the database (run this as postgres superuser)
-- CREATE DATABASE diglib;

-- Step 2: Connect to diglib database, then run below:

-- ─────────────────────────────────────────────────────────────
-- TABLE: categories
-- (Must be created before books due to FK dependency)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS categories (
    id          BIGSERIAL PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500)
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: books (3NF normalized - category moved out)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS books (
    id                BIGSERIAL PRIMARY KEY,
    title             VARCHAR(255)  NOT NULL,
    author            VARCHAR(255)  NOT NULL,
    isbn              VARCHAR(20)   NOT NULL UNIQUE,
    category_id       BIGINT        REFERENCES categories(id) ON DELETE SET NULL,
    description       VARCHAR(2000),
    published_date    DATE,
    publisher         VARCHAR(100),
    total_copies      INTEGER       NOT NULL DEFAULT 1 CHECK (total_copies >= 0),
    available_copies  INTEGER       NOT NULL DEFAULT 1 CHECK (available_copies >= 0),
    cover_image_url   VARCHAR(500),
    language          VARCHAR(50)   DEFAULT 'English',
    page_count        INTEGER,
    is_active         BOOLEAN       DEFAULT TRUE
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: users (members, librarians, admins)
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS users (
    id               BIGSERIAL    PRIMARY KEY,
    username         VARCHAR(50)  NOT NULL UNIQUE,
    first_name       VARCHAR(100) NOT NULL,
    last_name        VARCHAR(100) NOT NULL,
    email            VARCHAR(150) NOT NULL UNIQUE,
    phone_number     VARCHAR(20),
    address          VARCHAR(300),
    role             VARCHAR(20)  NOT NULL DEFAULT 'MEMBER'
                         CHECK (role IN ('ADMIN', 'LIBRARIAN', 'MEMBER')),
    password         VARCHAR(255),
    membership_date  TIMESTAMP    DEFAULT NOW(),
    is_active        BOOLEAN      DEFAULT TRUE,
    max_borrow_limit INTEGER      DEFAULT 5
);

-- ─────────────────────────────────────────────────────────────
-- TABLE: borrow_records
-- Links users <-> books with tracking info
-- ─────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS borrow_records (
    id           BIGSERIAL   PRIMARY KEY,
    user_id      BIGINT      NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    book_id      BIGINT      NOT NULL REFERENCES books(id) ON DELETE CASCADE,
    borrow_date  DATE        NOT NULL DEFAULT CURRENT_DATE,
    due_date     DATE        NOT NULL,
    return_date  DATE,
    status       VARCHAR(20) NOT NULL DEFAULT 'BORROWED'
                     CHECK (status IN ('BORROWED', 'RETURNED', 'OVERDUE', 'LOST')),
    fine_amount  NUMERIC(10, 2) DEFAULT 0.00,
    created_at   TIMESTAMP   DEFAULT NOW(),
    notes        VARCHAR(500)
);

-- ─────────────────────────────────────────────────────────────
-- INDEXES for performance
-- ─────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_books_isbn        ON books(isbn);
CREATE INDEX IF NOT EXISTS idx_books_category    ON books(category_id);
CREATE INDEX IF NOT EXISTS idx_books_title       ON books(title);
CREATE INDEX IF NOT EXISTS idx_users_email       ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_username    ON users(username);
CREATE INDEX IF NOT EXISTS idx_borrow_user       ON borrow_records(user_id);
CREATE INDEX IF NOT EXISTS idx_borrow_book       ON borrow_records(book_id);
CREATE INDEX IF NOT EXISTS idx_borrow_status     ON borrow_records(status);

-- ─────────────────────────────────────────────────────────────
-- SEED DATA: Categories
-- ─────────────────────────────────────────────────────────────
INSERT INTO categories (name, description) VALUES
    ('Fiction',      'Novels, short stories, and other fictional works'),
    ('Non-Fiction',  'Factual books, biographies, and educational content'),
    ('Science',      'Physics, chemistry, biology, and scientific research'),
    ('Technology',   'Programming, software, and computing books'),
    ('History',      'World history, civilizations, and historical events'),
    ('Philosophy',   'Ethics, logic, metaphysics and philosophical thought'),
    ('Self-Help',    'Personal development and motivational books'),
    ('Children',     'Books for young readers and children'),
    ('Mystery',      'Detective stories and thriller novels'),
    ('Biography',    'Life stories of notable individuals')
ON CONFLICT (name) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- SEED DATA: Users
-- Passwords are plain-text for demo purposes
--   ADMIN     → Admin@123
--   LIBRARIAN → Lib@5678
--   MEMBER    → Member@1
-- ─────────────────────────────────────────────────────────────
INSERT INTO users (username, first_name, last_name, email, phone_number, address, role, password, max_borrow_limit) VALUES
    ('admin1',      'Ayush',      'Kumar',      'ayushkumar@library.com',      '7808900362', 'New Delhi, Delhi',       'ADMIN',     'Admin@123',  10),
    ('admin2',      'Afrah',      'Sumanah',    'afrahsumanah@library.com',    '7032420551', 'Hyderabad, Telangana',   'ADMIN',     'Admin@123',  10),
    ('admin3',      'Laasya',     'Chowdhary',  'laasyachowdhary@library.com', '9000000001', 'Vijayawada, AP',         'ADMIN',     'Admin@123',  10),
    ('librarian1',  'Priya',      'Sharma',     'priya.sharma@library.com',    '9000000002', 'Mumbai, Maharashtra',    'LIBRARIAN', 'Lib@5678',   8),
    ('prateek',      'Prateek',    'Lohiya',     'lohiyaparteek@email.com',     '7877713818', 'Jaipur, Rajasthan',      'MEMBER',    'Member@1',   5),
    ('divyansh',    'Divyanshu',  'Goyal',      'divyanshugoyal@email.com',    '9876543211', 'Pune, Maharashtra',      'MEMBER',    'Member@1',   5),
    ('harsha',      'Harsha',     'Vardhan',    'harshavardhan@email.com',     '9876543212', 'Bengaluru, Karnataka',   'MEMBER',    'Member@1',   5),
    ('yamini',    'Saaredy',     'Yamini',      'sareddyyamini@email.com',      '9876543213', 'Ahmedabad, Gujarat',     'MEMBER',    'Member@1',   5),
    ('chaitra',    'J.Reddy',     'Chaitra',      'chaitra@email.com',      '9876543214', 'Chennai, Tamil Nadu',     'MEMBER',    'Member@1',   5)
ON CONFLICT (email) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- SEED DATA: Books (Indian authors & Indian classic titles)
-- ─────────────────────────────────────────────────────────────
INSERT INTO books (title, author, isbn, category_id, description, published_date, publisher, total_copies, available_copies, language, page_count) VALUES
    ('The Guide',
        'R. K. Narayan',         '978-0143031611', 1,
        'A masterpiece of Indian fiction about a tourist guide and his spiritual transformation',
        '1958-01-01', 'Penguin India', 5, 5, 'English', 220),

    ('Wings of Fire',
        'A. P. J. Abdul Kalam',  '978-8173711466', 10,
        'Autobiography of the Missile Man of India and former President Dr. A.P.J. Abdul Kalam',
        '1999-01-01', 'Universities Press', 6, 6, 'English', 204),

    ('The Immortals of Meluha',
        'Amish Tripathi',        '978-9380658742', 1,
        'First book of the Shiva Trilogy — Shiva reimagined as a mortal warrior who becomes a God',
        '2010-02-01', 'Westland Books', 7, 7, 'English', 412),

    ('India After Gandhi',
        'Ramachandra Guha',      '978-0330396110', 5,
        'The definitive history of the world largest democracy after Independence',
        '2007-01-01', 'Picador India', 4, 4, 'English', 900),

    ('You Can Win',
        'Shiv Khera',            '978-0070636590', 7,
        'A step-by-step tool for top achievers — one of India best-selling self-help books',
        '1998-01-01', 'Macmillan India', 7, 7, 'English', 272),

    ('Malgudi Days',
        'R. K. Narayan',         '978-0143031567', 1,
        'A beloved collection of short stories set in the fictional South Indian town of Malgudi',
        '1943-01-01', 'Penguin India', 5, 5, 'English', 272),

    ('The Argumentative Indian',
        'Amartya Sen',           '978-0374105839', 6,
        'Essays on Indian history, culture, and identity by Nobel Laureate Amartya Sen',
        '2005-07-12', 'Penguin Allen Lane', 3, 3, 'English', 409),

    ('Two States',
        'Chetan Bhagat',         '978-8129135162', 1,
        'A humorous and heartwarming tale of love across two very different Indian cultures',
        '2009-10-01', 'Rupa Publications', 6, 6, 'English', 272),

    ('The Discovery of India',
        'Jawaharlal Nehru',      '978-0195623598', 5,
        'Nehru exploration of India rich cultural, philosophical and historical heritage',
        '1946-01-01', 'Oxford University Press', 3, 3, 'English', 572),

    ('Gitanjali',
        'Rabindranath Tagore',   '978-8171673467', 6,
        'Nobel Prize winning collection of devotional songs and poems by Rabindranath Tagore',
        '1910-01-01', 'Macmillan India', 4, 4, 'English', 120)

ON CONFLICT (isbn) DO NOTHING;

-- ─────────────────────────────────────────────────────────────
-- SEED DATA: Sample Borrow Records
-- ─────────────────────────────────────────────────────────────
INSERT INTO borrow_records (user_id, book_id, borrow_date, due_date, status) VALUES
    (3, 1, CURRENT_DATE - INTERVAL '5 days',  CURRENT_DATE + INTERVAL '9 days',  'BORROWED'),
    (4, 3, CURRENT_DATE - INTERVAL '20 days', CURRENT_DATE - INTERVAL '6 days',  'OVERDUE'),
    (5, 5, CURRENT_DATE - INTERVAL '2 days',  CURRENT_DATE + INTERVAL '12 days', 'BORROWED'),
    (6, 2, CURRENT_DATE - INTERVAL '30 days', CURRENT_DATE - INTERVAL '16 days', 'RETURNED');

-- Update available copies for borrowed/overdue books
UPDATE books SET available_copies = available_copies - 1 WHERE id = 1;
UPDATE books SET available_copies = available_copies - 1 WHERE id = 3;
UPDATE books SET available_copies = available_copies - 1 WHERE id = 5;

-- ─────────────────────────────────────────────────────────────
-- VERIFICATION QUERIES (uncomment and run to confirm setup)
-- ─────────────────────────────────────────────────────────────
-- SELECT * FROM categories;
-- SELECT * FROM users;
-- SELECT b.id, b.title, b.author, c.name AS category, b.available_copies FROM books b JOIN categories c ON b.category_id = c.id;
-- SELECT br.id, u.username, bk.title, br.borrow_date, br.due_date, br.status FROM borrow_records br JOIN users u ON br.user_id = u.id JOIN books bk ON br.book_id = bk.id;

-- ─────────────────────────────────────────────────────────────
-- MIGRATION: Already ran setup.sql before? Run these instead:
-- ─────────────────────────────────────────────────────────────
-- ALTER TABLE users ADD COLUMN IF NOT EXISTS password VARCHAR(255);
-- UPDATE users SET password = 'Admin@123' WHERE role = 'ADMIN';
-- UPDATE users SET password = 'Lib@5678'  WHERE role = 'LIBRARIAN';
-- UPDATE users SET password = 'Member@1'  WHERE role = 'MEMBER';

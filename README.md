<div align="center">

# 📚 DigiLib — Digital Library Management System

**A full-stack, microservices-based digital library platform built for modern academic institutions.**

[![React](https://img.shields.io/badge/Frontend-React%2018-61DAFB?style=for-the-badge&logo=react)](https://react.dev)
[![Spring Boot](https://img.shields.io/badge/Core%20API-Spring%20Boot%203-6DB33F?style=for-the-badge&logo=springboot)](https://spring.io/projects/spring-boot)
[![FastAPI](https://img.shields.io/badge/Gateway-FastAPI-009688?style=for-the-badge&logo=fastapi)](https://fastapi.tiangolo.com)
[![Node.js](https://img.shields.io/badge/Task%20Service-Node.js-339933?style=for-the-badge&logo=nodedotjs)](https://nodejs.org)
[![PostgreSQL](https://img.shields.io/badge/Database-PostgreSQL-4169E1?style=for-the-badge&logo=postgresql)](https://www.postgresql.org)
[![MongoDB](https://img.shields.io/badge/Logs%20%26%20Search-MongoDB-47A248?style=for-the-badge&logo=mongodb)](https://www.mongodb.com)

</div>

---

## 📖 About the Project

**DigiLib** is a feature-rich **Digital Library Management System** developed as a Semester 3 DBMS project. It simulates a real-world library where administrators, librarians, and members can manage books, borrowing, returns, fines, and activity logs — all through a sleek, role-based web interface.

The system is built on a **microservices architecture** with four independent services communicating through a unified API Gateway, backed by two databases (PostgreSQL for relational data, MongoDB for activity logs and semantic search).

> 🎓 **Built by students, for a college DBMS project** — but engineered with industry-standard patterns.

---

## ✨ Features

### 🔐 Authentication & Role-Based Access
- Secure login with username & password
- Three roles: **Admin**, **Librarian**, **Member**
- Each role sees a tailored dashboard and navigation

### 📚 Book Catalog Management
- Add, edit, and delete books with full metadata (title, author, ISBN, publisher, category, copies)
- Category-based filtering and full-text keyword search
- Track available vs. total copies in real time

### 👥 User Management
- Register and manage library members
- Set borrow limits per user
- View member profiles and borrowing history

### 🔄 Borrow & Return System
- Issue books to members with configurable borrow duration
- Real-time availability updates on borrow/return
- Enforce per-user borrow limits

### 💰 Overdue Fine System
- Automatic fine calculation: **₹2 per overdue day**
- Fine preview shown in confirmation dialog before returning
- Fine recorded to database and displayed in borrow history

### 📊 Activity Logs
- Every login, borrow, return, and registration is logged to MongoDB
- Paginated activity log view for admins
- Real-time recent activity feed on the dashboard

### 🤖 Semantic Search (AI-powered)
- Natural language book search using vector embeddings
- Powered by MongoDB Atlas Vector Search

### 🌙 Dark Mode
- Full dark/light mode toggle, persisted across sessions

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    React Frontend (Vite)                     │
│                     localhost:5173                           │
└───────────────────────────┬─────────────────────────────────┘
                            │  HTTP (Axios)
                            ▼
┌─────────────────────────────────────────────────────────────┐
│               FastAPI Gateway (Python)                       │
│                     localhost:8000                           │
│    Routes: /api/books  /api/users  /api/borrows             │
│            /api/auth   /api/logs   /api/search              │
└──────────┬──────────────────────────────┬───────────────────┘
           │                              │
           ▼                              ▼
┌────────────────────┐         ┌──────────────────────┐
│  Spring Boot       │         │  Node.js + Express   │
│  Core Services     │         │  Task Services        │
│  localhost:8081    │         │  localhost:3001        │
│  (Books, Users,    │         │  (Activity Logs,      │
│   Borrows, Auth)   │         │   Semantic Search)    │
└────────┬───────────┘         └──────────┬───────────┘
         │                                │
         ▼                                ▼
┌─────────────────┐             ┌─────────────────────┐
│   PostgreSQL    │             │      MongoDB         │
│   Port: 5432    │             │  (Logs + Embeddings) │
│   diglib DB     │             └─────────────────────┘
└─────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Version | Port |
|---|---|---|---|
| **Frontend** | React + Vite | React 18, Vite 5 | 5173 |
| **API Gateway** | FastAPI (Python) | Python 3.10+ | 8000 |
| **Core Services** | Spring Boot (Java) | Java 17, Spring Boot 3 | 8081 |
| **Task Services** | Node.js + Express | Node 18+ | 3001 |
| **Primary DB** | PostgreSQL | 15+ | 5432 |
| **Secondary DB** | MongoDB | 6+ | 27017 |

---

## 📁 Project Structure

```
Digital Library Management/
│
├── 📂 Frontend/                    ← React + Vite Application
│   └── src/
│       ├── pages/                  (Dashboard, Books, Users, Borrows,
│       │                            Categories, SemanticSearch,
│       │                            ActivityLogs, MyBorrows, Profile)
│       ├── components/             (Navbar, Layout)
│       ├── context/                (AuthContext)
│       └── services/api.js         (Axios API client)
│
├── 📂 Backend/
│   │
│   ├── 📂 coreservices/            ← Spring Boot (Java 17)
│   │   └── src/main/java/mth/
│   │       ├── entity/             (Book, User, BorrowRecord, Category)
│   │       ├── repository/         (JPA Repositories)
│   │       ├── service/            (Business Logic + Fine Calculation)
│   │       └── controller/         (REST Controllers)
│   │
│   ├── 📂 gateway/                 ← FastAPI (Python) — API Gateway
│   │   ├── main.py
│   │   ├── controllers/            (Route handlers per domain)
│   │   └── auth/                   (Authentication logic)
│   │
│   └── 📂 taskservices/            ← Node.js + Express + MongoDB
│       ├── main.js
│       ├── controller/             (Logs, Search controllers)
│       ├── models/                 (Mongoose schemas)
│       └── service/                (Embedding + vector search)
│
└── 📂 database/
    └── setup.sql                   ← Full PostgreSQL schema + seed data
```

---

## 🚀 Getting Started

### Prerequisites

Make sure the following are installed:

- [Node.js](https://nodejs.org) v18+
- [Java 17 JDK](https://adoptium.net)
- [Python 3.10+](https://www.python.org)
- [PostgreSQL 15+](https://www.postgresql.org) with pgAdmin 4
- [MongoDB](https://www.mongodb.com) (local or Atlas)
- Maven (or use the included `mvnw` wrapper)

---

### Step 1 — Database Setup (PostgreSQL)

1. Open **pgAdmin 4**
2. Right-click **Databases** → **Create** → **Database** → Name it `diglib`
3. Right-click `diglib` → **Query Tool**
4. Open `database/setup.sql` and run it **(F5)**

This creates all tables (`categories`, `books`, `users`, `borrow_records`) and seeds demo data.

---

### Step 2 — Core Services (Spring Boot)

```bash
cd Backend/coreservices/coreservices

# Copy the example config and fill in your DB credentials
cp src/main/resources/application.properties.example \
   src/main/resources/application.properties

# Run the service
./mvnw spring-boot:run          # Linux/Mac
mvnw.cmd spring-boot:run        # Windows
```

> ✅ Runs on **http://localhost:8081**

---

### Step 3 — Task Services (Node.js)

```bash
cd Backend/taskservices

# Copy env file and fill in your MongoDB URI
cp .env.example .env

npm install
npm start
```

> ✅ Runs on **http://localhost:3001**

---

### Step 4 — API Gateway (FastAPI)

```bash
cd Backend/gateway

# Copy env file
cp .env.example .env

pip install -r requirements.txt
python run.py
```

> ✅ Runs on **http://localhost:8000**  
> 📄 Swagger UI: **http://localhost:8000/docs**

---

### Step 5 — Frontend (React)

```bash
cd Frontend

npm install
npm run dev
```

> ✅ Runs on **http://localhost:5173**

---

## 👤 Demo Credentials

| Role | Username | Password |
|---|---|---|
| **Admin** | `admin1` | `Admin@123` |
| **Librarian** | `librarian1` | `Lib@5678` |
| **Member** | `prateek` | `Member@1` |

---

## 👨‍💻 Team

| Name | Role | GitHub |
|---|---|---|
| **Ayush Kumar** | Full Stack & Architecture | [@ayushcoder786](https://github.com/ayushcoder786) |
| **Afrah Sumanah** | Backend & Database | [@Sumanah-afrah](https://github.com/Sumanah-afrah) |
| **Laasya Chowdhary** | Frontend & UI/UX | [@Laasya223](https://github.com/Laasya223) |
| **Saaredy** | Backend & Testing | [@slaasya432-hue](https://github.com/slaasya432-hue) |

---

## 📄 License

This project was developed for academic purposes as part of the **Semester 3 DBMS Course**.

---

<div align="center">
  <sub>Built with ❤️ by the DigiLib Team · 2026</sub>
</div>

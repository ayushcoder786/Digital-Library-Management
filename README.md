# Digital Library Management System
## Setup & Run Guide

### Tech Stack
| Layer | Technology | Port |
|-------|------------|------|
| Database | PostgreSQL (pgAdmin 4) | 5432 |
| Core Services | Spring Boot (Java 17) | 8080 |
| API Gateway | FastAPI (Python) | 8000 |
| Frontend | React + Vite | 5173 |

---

## Step 1 — PostgreSQL Setup in pgAdmin 4

1. Open **pgAdmin 4**
2. Right-click **Databases** → **Create** → **Database**
3. Name it: `digital_library` → Save
4. Right-click `digital_library` → **Query Tool**
5. Open file `database/setup.sql` and run it (F5)

This creates: `categories`, `books`, `users`, `borrow_records` tables with seed data.

---

## Step 2 — Run Spring Boot (open `backend/coreservices` in VS Code / IntelliJ)

```bash
# In backend/coreservices directory:
./mvnw spring-boot:run
# OR on Windows:
mvnw.cmd spring-boot:run
```

Spring Boot starts on **http://localhost:8080**

---

## Step 3 — Run Python Gateway (open `backend/gateway` in VS Code)

```bash
# In backend/gateway directory:
pip install -r requirements.txt
python main.py
```

FastAPI Gateway starts on **http://localhost:8000**
Swagger docs: http://localhost:8000/docs

---

## Step 4 — Run React Frontend (open `Frontend` in VS Code)

```bash
# In Frontend directory:
npm run dev
```

React app starts on **http://localhost:5173**

---

## Project Structure

```
Digital Library Management/
├── backend/
│   ├── coreservices/          ← Open in Spring Boot / VS Code
│   │   ├── pom.xml
│   │   └── src/main/java/com/digitallibrary/coreservices/
│   │       ├── model/         (Book, User, BorrowRecord, Category)
│   │       ├── repository/    (JPA Repositories)
│   │       ├── service/       (Business Logic)
│   │       └── controller/    (REST APIs)
│   │
│   └── gateway/               ← Open in VS Code (Python)
│       ├── main.py            (FastAPI Gateway)
│       ├── requirements.txt
│       └── .env
│
├── database/
│   └── setup.sql              ← Run in pgAdmin 4
│
└── Frontend/                  ← Open in VS Code (React)
    └── src/
        ├── pages/             (Dashboard, Books, Users, Borrows)
        ├── components/        (Navbar)
        └── services/api.js    (Axios → Gateway)
```

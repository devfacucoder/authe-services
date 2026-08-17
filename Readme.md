# Auth Service API

An authentication and authorization microservice built with Node.js, Express, and PostgreSQL, using Redis for rate limiting and session management.

---

## Technologies Used

* Runtime: Node.js (v20+)
* Language: JavaScript (ES Modules)
* Database: PostgreSQL
* Cache / Rate Limiting: Redis
* Security: JWT (RSA / PEM asymmetric signatures), Bcrypt
* Containerization: Docker & Docker Compose

---

## Key Features

* Asymmetric JWT Authentication: Issues and validates access tokens using public/private RSA key pairs (`private.pem` / `public.pem`).
* Redis Rate Limiting: Integrated protection against brute-force attacks on sensitive endpoints (`/auth/login`).
* Persistent Storage: Secure storage of users, roles, and password hashes in PostgreSQL.
* Containerized Environment: Pre-configured setup using Docker Compose for development and production.

---

## Prerequisites

Ensure you have the following installed on your system:

* Docker Desktop (recommended for running the complete stack)
* Node.js (v20 or higher, if running locally without Docker)
* pnpm or npm

---

## Environment Variables

Create a `.env` file in the root directory based on the provided `.env.example` file:

```env
PORT=3000

# PostgreSQL Configuration
DB_HOST=postgres-db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=auth_db

# Redis Configuration
REDIS_HOST=redis-server
REDIS_PORT=6379

# JWT Configuration
JWT_EXPIRES_IN=1h


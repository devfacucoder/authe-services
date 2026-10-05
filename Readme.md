# Auth Service API

An authentication and authorization microservice built with Node.js, Express, and PostgreSQL, using Redis for rate limiting, session management and email verification codes.

---

## Technologies Used

* Runtime: Node.js (v20+)
* Language: JavaScript (ES Modules)
* Framework: Express 5
* Database: PostgreSQL
* Cache / Rate Limiting: Redis
* Security: JWT (RSA / PEM asymmetric signatures), Bcrypt
* Email: Nodemailer (Gmail SMTP transport)
* Validation: express-validator
* Logging: Pino
* Containerization: Docker & Docker Compose

---

## Key Features

* Asymmetric JWT Authentication: Issues and validates access tokens using public/private RSA key pairs (`private.pem` / `public.pem`).
* Email Verification: Two-step OTP flow — the service emails a 6-digit code and flips `users.is_verified` to `true` once the code is confirmed. Codes live in Redis with a 15-minute TTL.
* Input Validation: `POST /register` enforces a valid email and a strong password (min 8 chars, upper + lower + digit + special character).
* Persistent Storage: Secure storage of users, roles, password hashes and verification state in PostgreSQL.
* Containerized Environment: Pre-configured setup using Docker Compose for development and production.

---

## Prerequisites

Ensure you have the following installed on your system:

* Docker Desktop (recommended for running the complete stack)
* Node.js (v20 or higher, if running locally without Docker)
* pnpm or npm
* A Gmail account with an **App Password** (required for sending verification emails)

### RSA Keys

JWT signing uses asymmetric keys. Place your key pair in the `keys/` directory as `private.pem` and `public.pem` (see `src/config/keys.js`). The application will fail to start if they are missing.

---

## Environment Variables

Create a `.env` file in the root directory. There is no `.env.example` in the repo, so use the reference below:

```env
PORT=3000

# PostgreSQL Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_NAME=auth_db
DB_SSL=false

# Redis Configuration (required: stores verification codes)
REDIS_HOST=localhost
REDIS_PORT=6379

# Nodemailer / Gmail Configuration (required for email verification)
EMAIL_USER=your_account@gmail.com
EMAIL_PASS=your_16_char_gmail_app_password

# Optional
NODE_ENV=development
LOG_LEVEL=info
```

> **Note:** `JWT_SECRET` and `DATABASE_URL` are *not* read by the code. Tokens are signed with the RSA key pair, not with a shared secret.

Gmail requires an App Password rather than your account password: enable 2-Step Verification on the Google account, then generate an App Password at <https://myaccount.google.com/apppasswords>. Values with spaces must stay quoted, e.g. `EMAIL_PASS="abcd efgh ijkl mnop"`.

---

## Database Setup

Tables are created automatically on boot by `src/models/initDb.js` (`users` table only).

The email verification feature added the `is_verified` column, which is **not** part of the bootstrap script. Apply it manually once against an existing database:

```sql
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false;
```

Without this migration every user lookup fails with `column "is_verified" does not exist` (SQLSTATE 42703), which breaks register, login and both verification endpoints.

---

## Running the Project

### Full stack with Docker

```bash
docker compose up --build
```

### Local development

Start Redis (required by the verification flow) and the app separately:

```bash
docker compose -f docker-compose.dev.yml up -d   # Redis on 127.0.0.1:6379
pnpm install
pnpm dev                                        # node --watch server.js
```

Scripts available: `pnpm dev` (watch mode) and `pnpm start`.

Health check:

```bash
curl http://localhost:3000/
# { "message": "API de autenticación funcionando", "status": "ok" }
```

---

## API Reference

All routes are mounted under `/api/auth`. Request and response bodies are JSON.

| Method | Path | Description |
| ------ | ---- | ----------- |
| `POST` | `/api/auth/register` | Create a user |
| `POST` | `/api/auth/login` | Authenticate and receive a JWT |
| `POST` | `/api/auth/verifyemail` | Send a verification code by email |
| `POST` | `/api/auth/verifycode` | Confirm the code and mark the email as verified |

### `POST /register`

Body: `{ "email": "user@example.com", "password": "Abc1234!" }`

Password rules: minimum 8 characters, at least one uppercase letter, one lowercase letter, one number and one special character. The email is trimmed and normalized before being stored.

```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"Abc1234!"}'
```

```json
{
  "message": "Usuario registrado exitosamente",
  "user": { "id": "...", "email": "user@example.com", "role": "user", "created_at": "..." }
}
```

| Status | Body |
| ------ | ---- |
| `201` | `{ message, user }` |
| `400` | `{ errors: [{ field, message }] }` — validation failed |
| `400` | `{ error: "no exist email &/or password" }` — missing fields |
| `409` | `{ error: "El email ya está registrado" }` |
| `500` | `{ error: "Error interno del servidor" }` |

Registration does **not** send the verification email automatically — call `/verifyemail` afterwards.

### `POST /login`

Body: `{ "email": "user@example.com", "password": "Abc1234!" }`

```json
{
  "message": "Inicio de sesión exitoso",
  "token": "<jwt>",
  "user": { "id": "...", "email": "user@example.com", "role": "user" }
}
```

| Status | Body |
| ------ | ---- |
| `200` | `{ message, token, user }` |
| `400` | `{ error: "El email y la contraseña son requeridos" }` |
| `401` | `{ error: "Credenciales inválidas" }` |
| `500` | `{ error: "Error interno del servidor" }` |

Login is **not** gated on email verification: unverified users can log in normally.

---

## Email Verification

### How it works

1. The client calls `POST /api/auth/verifyemail` with the address to verify.
2. The service generates a 6-digit code with `crypto.randomInt(100000, 999999)`, stores it in Redis under the key `verify:<email>` with a **900 second (15 minute)** TTL, and emails it via Nodemailer (Gmail). Subject: `Verifique su email`.
3. The user submits the received code to `POST /api/auth/verifycode`.
4. On a match, `users.is_verified` is set to `true` and the Redis key is deleted, so the code cannot be reused.

Implementation: `src/servicess/sendEmail.service.js`, `src/config/mailer.config.js`, `src/controllers/auth.controller.js`.

### Requesting the code

```bash
curl -X POST http://localhost:3000/api/auth/verifyemail \
  -H 'Content-Type: application/json' \
  -d '{"emailForVerificar":"user@example.com"}'
```

```json
{
  "message": "email enviado con exito",
  "email": { "messageId": "...", "envelope": { "from": "...", "to": ["user@example.com"] }, "response": "250 ..." }
}
```

The `email` field is the raw Nodemailer `info` object.

| Status | Body | Cause |
| ------ | ---- | ----- |
| `200` | `{ message, email }` | Code sent |
| `404` | `{ message: "debe enviar el correo a verificar" }` | `emailForVerificar` missing |
| `404` | `{ message: "el email no existe" }` | Unknown email **or** SMTP send failure |
| `500` | `{ message: "error en el envio del correo" }` | Unexpected controller error |

### Confirming the code

```bash
curl -X POST http://localhost:3000/api/auth/verifycode \
  -H 'Content-Type: application/json' \
  -d '{"emailForVerificar":"user@example.com","code":"123456"}'
```

```json
{ "message": "codigo verificado", "emailForVerificar": "user@example.com" }
```

| Status | Body | Cause |
| ------ | ---- | ----- |
| `200` | `{ message, emailForVerificar }` | Email marked as verified |
| `400` | `{ message: "codigo incorrecto" }` | Wrong, expired or missing code, or unknown email |
| `500` | `{ message: "error en el envio del correo" }` | Unexpected controller error |

### Full flow

```bash
# 1. Register
curl -X POST localhost:3000/api/auth/register -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"Abc1234!"}'

# 2. Send the code (check the inbox)
curl -X POST localhost:3000/api/auth/verifyemail -H 'Content-Type: application/json' \
  -d '{"emailForVerificar":"user@example.com"}'

# 3. Confirm the code
curl -X POST localhost:3000/api/auth/verifycode -H 'Content-Type: application/json' \
  -d '{"emailForVerificar":"user@example.com","code":"123456"}'

# 4. Log in
curl -X POST localhost:3000/api/auth/login -H 'Content-Type: application/json' \
  -d '{"email":"user@example.com","password":"Abc1234!"}'
```

### Behaviour notes

* Requesting a new code overwrites the previous one and restarts the 15-minute window.
* Codes are not stored in PostgreSQL; clearing Redis invalidates every outstanding code.
* Comparison is loose (`savedCode != code`), so the code may be sent as a string or a number.
* Neither endpoint is protected by the rate limiter or any validation middleware.

---

## Project Structure

```
server.js                      Entry point
src/app.js                     Express app, route mounting
src/config/                    db, redis, logger, mailer and JWT key configuration
src/routes/auth.routes.js      Auth route definitions
src/controllers/               HTTP handlers
src/middlewares/               express-validator rules and rate limiter
src/models/                    SQL queries and DB bootstrap
src/servicess/                 Business logic (auth, tokens, email sending)
```

---

## Known Issues / TODOs

* `authRateLimiter` is no longer applied to any route, leaving `/login` and the verification endpoints unthrottled (`src/routes/auth.routes.js`).
* SMTP failures are reported as `404 "el email no existe"` and expired codes as `400 "codigo incorrecto"`, because the service swallows its exceptions.
* The verification code and the submitted code are written to the logs at info level (`src/servicess/sendEmail.service.js:40-41`).
* `initDb.js` does not create `is_verified`; the manual `ALTER TABLE` above is required.
* There are no automated tests in the repository.

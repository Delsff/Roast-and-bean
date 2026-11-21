# ☕ Roast & Bean — Specialty Coffee Store

A full-stack e-commerce web application for a specialty coffee shop, built with **React**, **TypeScript**, **Express**, **Prisma** and **PostgreSQL**. Includes a product catalog with filters, a persistent cart, JWT authentication with roles, order management and an admin panel. Covered by automated tests and deployed with CI.

[![CI](https://github.com/Delsff/roast-and-bean/actions/workflows/ci.yml/badge.svg)](https://github.com/YOUR_USERNAME/YOUR_REPO/actions/workflows/ci.yml)
[![Live Demo](https://img.shields.io/badge/demo-online-brightgreen?style=for-the-badge&logo=netlify)](https://roastbean.netlify.app/)

> ⏱️ The backend runs on a free Render plan and goes to sleep after inactivity. The first request after a pause can take up to a minute — skeleton loaders are shown while the API wakes up.

---

## Tech Stack

**Frontend**
- **Framework:** React 19 (TypeScript), Vite
- **Styling:** Tailwind CSS
- **Routing:** React Router
- **State:** Zustand (cart and auth, persisted in `localStorage`)
- **Data fetching:** TanStack Query (caching, retries, invalidation)
- **UI feedback:** Sonner (toast notifications)

**Backend**
- **Server:** Node.js, Express, TypeScript
- **Database:** PostgreSQL (Neon) with Prisma ORM and migrations
- **Validation:** Zod
- **Auth:** JWT, bcrypt password hashing, role-based access control
- **Security:** Helmet, CORS allow-list, rate limiting

**Quality & Infrastructure**
- **Tests:** Vitest, Supertest (API integration tests), React Testing Library
- **CI:** GitHub Actions (type check, tests and build on every push)
- **Hosting:** Netlify (frontend), Render (API), Neon (database)

---

## Features

### Storefront
- **Catalog** with search, category filter, roast-level filter and price sorting
- **Product page** (`/product/:id`) with a shareable link and dynamic page title
- **Cart drawer** with quantity controls, persisted between visits
- **Checkout** for guests and registered users, with server-side validation messages
- **Skeleton loaders, toasts, empty and error states** (with a "Try again" button) and a 404 page

### Accounts
- **Register / Login** with validation and loading states
- **My orders** — order history of the signed-in user
- Guests can order without an account

### Admin panel
- **Orders:** view all orders, change status (`pending → processing → completed`)
- **Products:** create, edit, delete products and toggle stock status, with an image preview
- Admin routes are protected both on the client and on the server

### Additional Highlights
- **Fully Responsive:** mobile, tablet and desktop layouts using Tailwind breakpoints
- **Accessible:** labelled form fields, keyboard-friendly navigation, `aria` attributes on interactive elements

---

## Security & Engineering Decisions

- **Order totals are calculated on the server.** The client sends only product IDs and quantities; prices and names are always taken from the database, so they can't be tampered with.
- **Order items keep a snapshot** of the product name and price, so changing or deleting a product never rewrites order history.
- **Passwords are hashed** with bcrypt; login errors are identical for "unknown email" and "wrong password".
- **Roles are assigned only on the server** — a client can't register itself as an admin.
- **Every route is validated** with Zod schemas, with a central error handler and rate limiting on the API.

---

## API Overview

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/products` | public | List products |
| GET | `/api/products/:id` | public | Get one product |
| POST | `/api/products` | admin | Create a product |
| PATCH | `/api/products/:id` | admin | Update a product |
| DELETE | `/api/products/:id` | admin | Delete a product |
| POST | `/api/auth/register` | public | Create an account |
| POST | `/api/auth/login` | public | Sign in, returns a JWT |
| GET | `/api/auth/me` | user | Current user |
| POST | `/api/orders` | public | Place an order (guest or user) |
| GET | `/api/orders/my` | user | Orders of the current user |
| GET | `/api/orders` | admin | All orders |
| PATCH | `/api/orders/:id/status` | admin | Change order status |

---

## Project Structure

```
roast-and-bean-fullstack/
├── backend/
│   ├── prisma/            # schema, migrations, seed
│   ├── src/
│   │   ├── routes/        # products, orders, auth
│   │   ├── middleware/    # auth, validation, error handling
│   │   ├── app.ts         # Express app
│   │   └── index.ts       # server entry
│   └── tests/             # API integration tests
├── frontend/
│   └── src/
│       ├── componenths/   # pages and components
│       ├── hooks/         # TanStack Query hooks
│       ├── store/         # Zustand stores
│       └── lib/           # API helpers
└── .github/workflows/     # CI pipeline
```

---

## Getting Started

### Prerequisites
- Node.js 20+
- PostgreSQL 14+

### Backend

```bash
cd backend
npm install
cp .env.example .env     # fill in the values
npx prisma migrate deploy
npm run db:seed
npm run dev              # http://localhost:5001
```

`.env` variables: `DATABASE_URL`, `DIRECT_URL`, `JWT_SECRET` (32+ characters), `CLIENT_ORIGIN`, `ADMIN_EMAIL`, `ADMIN_PASSWORD`.

### Frontend

```bash
cd frontend
npm install
npm run dev              # http://localhost:5173
```

Optional `frontend/.env`: `VITE_API_URL` (defaults to `http://localhost:5001`).

### Tests

```bash
cd backend && npm test      # needs a separate test database (.env.test)
cd frontend && npm test
```

---

## Roadmap

- Online payments (Stripe test mode)
- Order confirmation emails
- Image upload for products (instead of image URLs)
- Pagination and server-side search
- Reviews and a wishlist

---

## Screenshots

<img width="1885" height="898" alt="Снимок экрана 2026-11-21 181014" src="https://github.com/user-attachments/assets/e6f2596c-5cea-4457-9369-fc2ff3fc89c0" />

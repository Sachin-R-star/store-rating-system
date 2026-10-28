# Store Rating & Review System

A full-stack web application designed for users to submit ratings (1 to 5 stars) for stores registered on the platform. Features role-based access control for **System Administrators**, **Normal Users**, and **Store Owners**, complete with real-time dashboards, search, and sorting.

Built strictly according to the **FullStack Intern Coding Challenge** specification.

---

## 🌟 Key Features

### 1. Unified Authentication
- **Single Login System**: One login page routes users automatically based on their role (`ADMIN`, `USER`, or `STORE_OWNER`).
- **Normal User Registration**: Dedicated registration page with strict live validation rules:
  - **Full Name**: 20 to 60 characters (with real-time counter).
  - **Address**: Maximum 400 characters.
  - **Password**: 8 to 16 characters, including at least one uppercase letter and one special character.
  - **Email**: Standard email format validation.
- **Update Password**: All authenticated users can update their password securely after logging in.

### 2. System Administrator Dashboard
- **Real-Time Platform Stats**:
  - Total number of registered users.
  - Total number of registered stores.
  - Total number of submitted ratings.
- **User Management**:
  - View list of all normal users, administrators, and store owners.
  - Displays: Name, Email, Address, Role, and **Store Rating** (if the user is a Store Owner).
  - Filters by Name, Email, Address, and Role dropdown.
  - Add new Normal Users, Admins, or Store Owners with role selection and validation.
- **Store Management**:
  - View registered stores with Name, Email, Address, Assigned Owner, and Overall Rating.
  - Add new stores and optionally assign registered store owners.
  - Search and filter stores by Name, Email, or Address.

### 3. Normal User Dashboard
- **Browse Registered Stores**:
  - Live store listings displaying: Store Name, Address, Overall Rating (with star visualizations and review count), and Your Rating.
- **Search & Filter**: Search stores dynamically by **Name** and **Address**.
- **1-5 Star Ratings**:
  - Interactive 5-star rating modal with hover previews.
  - Option to **Submit a Rating** (between 1 and 5).
  - Option to **Modify an Existing Rating** at any time.

### 4. Store Owner Dashboard
- **Store Overview**: Displays store name, business email, and address.
- **Average Store Rating**: Prominently displays the store's average rating (e.g. `4.5 / 5.0`) with gold stars and total rating count.
- **Customer Ratings List**: Table listing customers who rated the store: Customer Name, Email, Address, Rating value (1-5), and Submission Timestamp.

### 5. Universal Sorting
- All tables support **ascending and descending sorting** on key columns (Name, Email, Address, Rating, Date).

---

## 🛠 Tech Stack

- **Backend**: [Node.js](https://nodejs.org/) & [Express.js](https://expressjs.com/)
- **Database**:
  - **SQLite** (`node:sqlite`): Built into Node.js, zero external setup or installation required. Pre-seeds demo data automatically.
  - **PostgreSQL**: Production-ready support via the `pg` driver by configuring `DATABASE_URL` in `.env`.
- **Frontend**: [React.js](https://react.dev/) & [Vite](https://vitejs.dev/) with Vanilla CSS design system.
- **Icons**: [Lucide React](https://lucide.dev/) (pure SVG icons).

---

## 📁 Project Structure

Designed to be clean, intuitive, and beginner-friendly:

```
store-rating-app/
├── backend/
│   ├── src/
│   │   ├── database/
│   │   │   ├── db.js            # Unified DB connection (SQLite & PostgreSQL)
│   │   │   └── schema.js        # Table creation & initial demo data seeder
│   │   ├── middleware/
│   │   │   ├── auth.js          # JWT verification & role-based authorization
│   │   │   └── validators.js    # Strict validation rules matching challenge specs
│   │   ├── routes/
│   │   │   ├── auth.js          # /api/auth (login, register, update-password, me)
│   │   │   ├── admin.js         # /api/admin (stats, user management, store creation)
│   │   │   ├── stores.js        # /api/stores (store listings, search, user rating)
│   │   │   ├── ratings.js       # /api/ratings (submit & modify 1-5 star ratings)
│   │   │   └── owner.js         # /api/owner (dashboard, average rating, reviews)
│   │   └── server.js            # Express server initialization
│   ├── .env                     # Environment variables
│   ├── .env.example
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js        # API fetch wrapper with automatic JWT token attachment
│   │   ├── components/
│   │   │   ├── Navbar.jsx       # Header with user role badge and quick actions
│   │   │   ├── StarRating.jsx   # Reusable star rating (display & interactive picker)
│   │   │   ├── TableSortHeader.jsx # Clickable sortable table column headers
│   │   │   └── UpdatePasswordModal.jsx # Password update modal with live criteria
│   │   ├── context/
│   │   │   └── AuthContext.jsx  # Authentication state provider
│   │   ├── pages/
│   │   │   ├── Login.jsx        # Login page with 1-click quick demo buttons
│   │   │   ├── Signup.jsx       # Registration with live requirement checklist
│   │   │   ├── admin/
│   │   │   │   └── AdminDashboard.jsx
│   │   │   ├── user/
│   │   │   │   └── UserDashboard.jsx
│   │   │   └── owner/
│   │   │       └── OwnerDashboard.jsx
│   │   ├── App.jsx              # Main application router
│   │   ├── index.css            # Modern dark glassmorphic design system
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js           # Vite dev server with proxy to backend (port 5000)
│   └── package.json
│
└── README.md
```

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js (v18 or newer)
- npm

### 1. Run the Backend Server
```bash
cd backend
npm install
npm run dev
```
- The backend server will start at: `http://localhost:5000`
- Tables and sample demo data will automatically be created on the first start!

### 2. Run the Frontend Client
In a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
- Open `http://localhost:3000` in your web browser.

---

## 🔑 Pre-Seeded Demo Accounts

The login page includes convenient **1-Click Quick Demo Login** buttons for instant testing:

| Role | Email | Password |
|---|---|---|
| **System Administrator** | `admin@storerating.com` | `Admin@1234` |
| **Store Owner** | `owner1@freshmart.com` | `Owner@1234` |
| **Normal User** | `user1@example.com` | `User@1234` |

---

## 🔒 Security & Best Practices

1. **Password Protection**: Passwords are never stored in plain text; hashed using `bcryptjs` with salt rounds = 10. Passwords are never returned in JSON API responses.
2. **SQL Injection Prevention**: 100% of SQL queries use parameterized statements (`?` / `$1`), preventing SQL injection.
3. **Role-Based Authorization**: Protected backend routes verify role permissions via middleware (`authorize('ADMIN')`, `authorize('STORE_OWNER')`).
4. **Rating Integrity**: Enforces ratings strictly between 1 and 5 stars. Ensures a user can submit only one rating per store, which can be modified at any time.
5. **Zero Vulnerabilities**: All dependencies are clean, stable, and have zero known vulnerabilities (`npm audit: found 0 vulnerabilities`).

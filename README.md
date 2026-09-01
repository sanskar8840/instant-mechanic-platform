# Instant Mechanic Platform — Phase 1

Phase 1 creates the clean base architecture for a new full-stack vehicle assistance platform.

## Included in Phase 1

- React + Vite frontend
- Tailwind CSS setup
- React Router base routing
- Axios API client
- Node.js + Express backend
- MongoDB connection with Mongoose
- Socket.IO server foundation
- Security middleware with Helmet
- Request logging with Morgan
- Centralized 404 + error handling
- Environment variable examples
- Health API
- Role portal placeholders for Customer, Mechanic and Admin

## Folder Structure

```text
instant-mechanic-platform/
├── client/
│   ├── src/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── .env.example
│   ├── package.json
│   ├── postcss.config.js
│   ├── tailwind.config.js
│   └── vite.config.js
├── server/
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   ├── .env.example
│   ├── package.json
│   └── server.js
├── .gitignore
├── package.json
└── README.md
```

## Local Setup

### 1. Backend

```bash
cd server
npm install
```

Copy `.env.example` to `.env` and set your MongoDB URI.

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/instant_mechanic_platform
CLIENT_URL=http://localhost:5173
```

Run:

```bash
npm run dev
```

Test:

```text
http://localhost:5000/api/health
```

### 2. Frontend

Open a second terminal:

```bash
cd client
npm install
```

Copy `.env.example` to `.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

Run:

```bash
npm run dev
```

Open:

```text
http://localhost:5173
```

## Expected Phase 1 Result

The frontend should show three portal cards:

- Customer Portal
- Mechanic Portal
- Admin Portal

The backend health API should return a successful response and MongoDB should connect.

## Next Phase

Phase 2 will add secure authentication and role-based access for:

- Customer
- Mechanic
- Admin

It will include JWT authentication, bcrypt password hashing, protected routes and role-specific redirects.

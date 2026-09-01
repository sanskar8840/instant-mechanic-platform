# 🚗 Instant Mechanic — Real-Time Roadside Assistance Platform

A production-ready full-stack roadside assistance platform that connects customers with mechanics in real time.

Customers can register vehicles, book roadside services, track assigned mechanics live on a map, make online payments, and submit reviews. Mechanics can manage assigned requests and share their live GPS location, while admins can manage bookings and assign mechanics.

---

## 🌐 Live Demo

### Frontend
https://instant-mechanic-platform.vercel.app

### Backend API
https://instant-mechanic-platform.onrender.com

### GitHub Repository
https://github.com/sanskar8840/instant-mechanic-platform

---

## ✨ Key Features

### 👤 Customer Portal

- Customer registration and login
- JWT-based authentication
- Add and manage vehicles
- Browse available mechanic services
- Book roadside assistance
- View active and completed bookings
- Real-time booking status updates
- Live mechanic GPS tracking
- Interactive map using Leaflet and OpenStreetMap
- Cancel eligible bookings
- Razorpay online payment integration
- Submit rating and review after completed service

---

### 🔧 Mechanic Portal

- Mechanic registration and login
- Secure mechanic dashboard
- View assigned service requests
- Accept assigned bookings
- Update service status
- Supported workflow:

```text
Assigned
   ↓
Accepted
   ↓
On The Way
   ↓
Arrived
   ↓
In Progress
   ↓
Completed
```

- Share real-time GPS location
- Stop/start location sharing
- Customer receives live location updates through Socket.IO
- View ratings and customer reviews

---

### 🛡️ Admin Portal

- Secure admin authentication
- View all service bookings
- View booking details
- View available mechanics
- Assign mechanics to customer bookings
- Monitor booking status and payment state
- Role-protected admin routes

---

## ⚡ Real-Time Features

Socket.IO is used for real-time communication between customers, mechanics, and the backend.

### Real-time events include:

- Booking status updates
- Mechanic location updates
- Booking-specific Socket.IO rooms
- Authenticated socket connections
- Role-based room authorization

Example flow:

```text
Mechanic updates location
        ↓
Express API
        ↓
MongoDB updates coordinates
        ↓
Socket.IO emits location event
        ↓
Customer receives update
        ↓
Leaflet map moves mechanic marker
```

---

## 📍 Live Mechanic Tracking

The mechanic dashboard uses the browser Geolocation API to collect GPS coordinates.

The backend securely stores and broadcasts:

- Latitude
- Longitude
- Last updated timestamp

The customer can then view the mechanic's latest position on an interactive OpenStreetMap.

### Technologies

- Browser Geolocation API
- Socket.IO
- React Leaflet
- Leaflet
- OpenStreetMap

---

## 💳 Payment Integration

Razorpay is integrated in **Test Mode**.

Payment flow:

```text
Service Completed
      ↓
Customer clicks Pay Now
      ↓
Backend creates Razorpay Order
      ↓
Razorpay Checkout
      ↓
Customer completes payment
      ↓
Backend verifies signature
      ↓
Payment Status = Paid
```

Payment information stored with the booking includes:

- Razorpay Order ID
- Razorpay Payment ID
- Payment signature
- Payment status
- Payment timestamp

> Razorpay is currently configured for testing/demo purposes.

---

## ⭐ Rating & Review System

After a booking is:

```text
Completed + Paid
```

the customer can submit:

- 1–5 star rating
- Written feedback

Mechanics can view their customer reviews and rating information from their dashboard.

---

## 🔐 Security Features

The application includes multiple backend security measures:

- JWT authentication
- bcrypt password hashing
- Role-Based Access Control
- Protected REST API routes
- Authenticated Socket.IO connections
- Booking-room authorization
- Helmet security headers
- CORS configuration
- API rate limiting
- Login/register rate limiting
- Centralized error handling
- Environment-based secret management
- `.env` files excluded from Git

---

## 🛠️ Tech Stack

### Frontend

- React.js
- Vite
- React Router
- Tailwind CSS
- Axios
- Socket.IO Client
- React Leaflet
- Leaflet
- OpenStreetMap
- Lucide React
- Razorpay Checkout

### Backend

- Node.js
- Express.js
- MongoDB
- Mongoose
- Socket.IO
- JWT
- bcrypt
- Razorpay API
- Helmet
- Morgan
- express-rate-limit

### Deployment

- Frontend — Vercel
- Backend — Render
- Database — MongoDB Atlas

---

## 🏗️ System Architecture

```text
                         ┌───────────────────────┐
                         │       CUSTOMER        │
                         │      React Client     │
                         └───────────┬───────────┘
                                     │
                              REST + Socket.IO
                                     │
                                     ▼
┌───────────────────┐      ┌───────────────────────┐      ┌───────────────────┐
│     MECHANIC      │◄────►│   NODE / EXPRESS API  │◄────►│      ADMIN        │
│   React Client    │      │                       │      │   React Client    │
└───────────────────┘      │ REST APIs             │      └───────────────────┘
                           │ JWT Authentication     │
                           │ Socket.IO              │
                           │ RBAC                   │
                           └───────────┬───────────┘
                                       │
                     ┌─────────────────┴─────────────────┐
                     │                                   │
                     ▼                                   ▼
             ┌───────────────┐                  ┌────────────────┐
             │ MongoDB Atlas │                  │ Razorpay API   │
             └───────────────┘                  └────────────────┘
```

---

## 📁 Project Structure

```text
instant-mechanic-platform/
│
├── client/
│   ├── src/
│   │   ├── components/
│   │   │   ├── LiveTrackingMap.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   │
│   │   ├── context/
│   │   │   └── AuthContext.jsx
│   │   │
│   │   ├── pages/
│   │   │   ├── Home.jsx
│   │   │   ├── CustomerLogin.jsx
│   │   │   ├── CustomerRegister.jsx
│   │   │   ├── CustomerDashboard.jsx
│   │   │   ├── MyVehicles.jsx
│   │   │   ├── AddVehicle.jsx
│   │   │   ├── Services.jsx
│   │   │   ├── BookService.jsx
│   │   │   ├── MyBookings.jsx
│   │   │   ├── BookingDetails.jsx
│   │   │   ├── MechanicLogin.jsx
│   │   │   ├── MechanicRegister.jsx
│   │   │   ├── MechanicDashboard.jsx
│   │   │   ├── AdminLogin.jsx
│   │   │   └── AdminDashboard.jsx
│   │   │
│   │   ├── services/
│   │   │   ├── api.js
│   │   │   └── socket.js
│   │   │
│   │   ├── utils/
│   │   │   └── loadRazorpay.js
│   │   │
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   │
│   └── package.json
│
├── server/
│   ├── config/
│   │   ├── db.js
│   │   └── razorpay.js
│   │
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── seed/
│   ├── utils/
│   ├── server.js
│   └── package.json
│
├── .gitignore
├── package.json
└── README.md
```

---

## 🗄️ Main Database Models

### User

Stores:

- Name
- Email
- Password
- Role
- Phone
- Account status

Roles:

```text
customer
mechanic
admin
```

### Vehicle

Stores customer vehicle details.

### Service

Stores available roadside assistance services and pricing.

### Booking

Stores:

- Customer
- Vehicle
- Service
- Assigned mechanic
- Problem description
- Address
- Scheduled date
- Booking status
- Amount
- Payment status
- Razorpay information
- Mechanic GPS coordinates

### Review

Stores:

- Customer
- Mechanic
- Booking
- Rating
- Comment

---

## 🔄 Booking Lifecycle

```text
Customer Books Service
        ↓
Pending
        ↓
Admin Assigns Mechanic
        ↓
Assigned
        ↓
Mechanic Accepts
        ↓
Accepted
        ↓
On The Way
        ↓
Arrived
        ↓
In Progress
        ↓
Completed
        ↓
Customer Payment
        ↓
Paid
        ↓
Customer Review
```

---

# 🚀 Local Installation

## 1. Clone Repository

```bash
git clone https://github.com/sanskar8840/instant-mechanic-platform.git
cd instant-mechanic-platform
```

---

## 2. Backend Setup

```bash
cd server
npm install
```

Create:

```text
server/.env
```

Example:

```env
PORT=5000

MONGODB_URI=your_mongodb_connection_string

CLIENT_URL=http://localhost:5173

JWT_SECRET=your_secure_jwt_secret
JWT_EXPIRES_IN=7d

ADMIN_NAME=Instant Mechanic Admin
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=your_secure_admin_password

RAZORPAY_KEY_ID=your_razorpay_test_key_id
RAZORPAY_KEY_SECRET=your_razorpay_test_key_secret
```

Never commit the real `.env` file.

---

## 3. Run Backend

```bash
npm run dev
```

Backend:

```text
http://localhost:5000
```

Health API:

```text
http://localhost:5000/api/health
```

---

## 4. Frontend Setup

Open another terminal:

```bash
cd client
npm install
```

Create:

```text
client/.env
```

Add:

```env
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

---

## 5. Run Frontend

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

## 🌐 Production Environment Variables

### Render Backend

```env
MONGODB_URI=your_mongodb_atlas_uri
CLIENT_URL=https://your-frontend.vercel.app
JWT_SECRET=your_secure_secret
JWT_EXPIRES_IN=7d
RAZORPAY_KEY_ID=your_key_id
RAZORPAY_KEY_SECRET=your_key_secret
```

### Vercel Frontend

```env
VITE_API_URL=https://your-backend.onrender.com/api
VITE_SOCKET_URL=https://your-backend.onrender.com
```

---

## 📡 API Overview

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
```

### Vehicles

```text
GET  /api/vehicles
POST /api/vehicles
```

### Services

```text
GET /api/services
```

### Customer Bookings

```text
POST  /api/bookings
GET   /api/bookings
GET   /api/bookings/:id
PATCH /api/bookings/:id/cancel
```

### Admin

```text
GET   /api/admin/bookings
GET   /api/admin/bookings/:id
GET   /api/admin/mechanics
PATCH /api/admin/bookings/:id/assign
```

### Mechanic

```text
GET   /api/mechanic/bookings
GET   /api/mechanic/bookings/:id
PATCH /api/mechanic/bookings/:id/status
PATCH /api/mechanic/bookings/:id/location
GET   /api/mechanic/reviews
```

### Payments

```text
POST /api/payments/:bookingId/create-order
POST /api/payments/:bookingId/verify
```

### Reviews

```text
POST /api/reviews
GET  /api/reviews/booking/:bookingId
```

---

## 📸 Screenshots

Add screenshots of the application here before using the project in your portfolio.

Recommended screenshots:

1. Home Page
2. Customer Dashboard
3. Service Booking Page
4. My Bookings
5. Live Mechanic Tracking
6. Razorpay Payment
7. Mechanic Dashboard
8. Admin Dashboard
9. Rating & Review

Example structure:

```text
screenshots/
├── home.png
├── customer-dashboard.png
├── live-tracking.png
├── mechanic-dashboard.png
├── admin-dashboard.png
└── payment.png
```

---

## 💼 Resume Description

**Instant Mechanic — Real-Time Roadside Assistance Platform**

Built and deployed a full-stack MERN roadside assistance platform featuring role-based Customer, Mechanic, and Admin portals, real-time service status updates and GPS tracking using Socket.IO, Razorpay payment integration, reviews and ratings, JWT authentication, MongoDB Atlas, Leaflet maps, and secure REST APIs.

---

## 🎯 Key Learning Outcomes

This project demonstrates practical experience with:

- Full-stack MERN development
- REST API design
- Authentication and authorization
- Real-time communication
- Socket.IO room architecture
- Browser Geolocation API
- Maps integration
- Online payment integration
- MongoDB schema design
- Role-based dashboards
- API security
- Production deployment
- Environment configuration
- Git and GitHub workflow

---

## 🔮 Future Improvements

Potential future enhancements:

- Mechanic verification and approval system
- Razorpay webhooks
- Email/SMS notifications
- Forgot/reset password
- Customer-to-mechanic chat
- Estimated arrival time
- Distance-based mechanic assignment
- Search and filtering
- Admin analytics dashboard
- Notification center
- Docker support
- Automated testing
- CI/CD pipeline

---

## 👨‍💻 Author

**Sanskar Yadav**

GitHub:  
https://github.com/sanskar8840

---

## ⭐ Support

If you found this project useful, consider giving the repository a ⭐.
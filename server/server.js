import "dotenv/config";

import http from "http";
import cors from "cors";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import { Server } from "socket.io";

import { connectDB } from "./config/db.js";

import Booking from "./models/Booking.js";

import healthRoutes from "./routes/healthRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import vehicleRoutes from "./routes/vehicleRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import bookingRoutes from "./routes/bookingRoutes.js";
import adminBookingRoutes from "./routes/adminBookingRoutes.js";
import adminFinanceRoutes from "./routes/adminFinanceRoutes.js";
import mechanicBookingRoutes from "./routes/mechanicBookingRoutes.js";
import mechanicReviewRoutes from "./routes/mechanicReviewRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import reviewRoutes from "./routes/reviewRoutes.js";

import {
  apiLimiter,
  authLimiter,
} from "./middleware/rateLimiter.js";

import { socketAuth } from "./middleware/socketAuth.js";

import {
  errorHandler,
  notFound,
} from "./middleware/errorHandler.js";

const app = express();
const server = http.createServer(app);

const PORT =
  process.env.PORT || 5000;

const CLIENT_URL =
  process.env.CLIENT_URL ||
  "http://localhost:5173";

app.use(helmet());

app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
  })
);

app.use(
  express.json({
    limit: "1mb",
  })
);

app.use(
  express.urlencoded({
    extended: true,
  })
);

app.use(morgan("dev"));

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,

    methods: [
      "GET",
      "POST",
      "PUT",
      "PATCH",
      "DELETE",
    ],

    credentials: true,
  },
});

io.use(socketAuth);

io.on("connection", (socket) => {
  console.log(
    `Socket connected: ${socket.id}`
  );

  console.log(
    `Socket user: ${socket.user.email} (${socket.user.role})`
  );

  socket.emit("server:ready", {
    message:
      "Real-time server connected",
  });

  socket.on(
    "booking:join",
    async (bookingId) => {
      try {
        if (!bookingId) {
          return;
        }

        const booking =
          await Booking.findById(
            bookingId
          ).select(
            "customer mechanic"
          );

        if (!booking) {
          socket.emit(
            "booking:error",
            {
              message:
                "Booking not found",
            }
          );

          return;
        }

        let allowed = false;

        if (
          socket.user.role === "admin"
        ) {
          allowed = true;
        }

        if (
          socket.user.role ===
            "customer" &&
          booking.customer.toString() ===
            socket.user.id
        ) {
          allowed = true;
        }

        if (
          socket.user.role ===
            "mechanic" &&
          booking.mechanic &&
          booking.mechanic.toString() ===
            socket.user.id
        ) {
          allowed = true;
        }

        if (!allowed) {
          console.log(
            `Unauthorized room join attempt by ${socket.user.email}`
          );

          socket.emit(
            "booking:error",
            {
              message:
                "You are not allowed to access this booking",
            }
          );

          return;
        }

        const roomName =
          `booking:${bookingId}`;

        socket.join(roomName);

        console.log(
          `${socket.user.role} ${socket.user.email} joined ${roomName}`
        );
      } catch (error) {
        console.error(
          "Socket room join error:",
          error.message
        );

        socket.emit(
          "booking:error",
          {
            message:
              "Unable to join booking room",
          }
        );
      }
    }
  );

  socket.on(
    "booking:leave",
    (bookingId) => {
      if (!bookingId) {
        return;
      }

      const roomName =
        `booking:${bookingId}`;

      socket.leave(roomName);

      console.log(
        `${socket.user.email} left ${roomName}`
      );
    }
  );

  socket.on("disconnect", () => {
    console.log(
      `Socket disconnected: ${socket.id}`
    );
  });
});

app.set("io", io);

app.get("/", (req, res) => {
  res.json({
    success: true,
    message:
      "Instant Mechanic API is running",
  });
});

app.use("/api", apiLimiter);

app.use(
  "/api/health",
  healthRoutes
);

app.use(
  "/api/auth",
  authLimiter,
  authRoutes
);

app.use(
  "/api/vehicles",
  vehicleRoutes
);

app.use(
  "/api/services",
  serviceRoutes
);

app.use(
  "/api/bookings",
  bookingRoutes
);

app.use(
  "/api/admin",
  adminBookingRoutes
);

app.use(
  "/api/admin/finance",
  adminFinanceRoutes
);

app.use(
  "/api/mechanic",
  mechanicBookingRoutes
);

app.use(
  "/api/mechanic",
  mechanicReviewRoutes
);

app.use(
  "/api/payments",
  paymentRoutes
);

app.use(
  "/api/reviews",
  reviewRoutes
);

app.use(notFound);
app.use(errorHandler);

async function startServer() {
  try {
    await connectDB();

    server.listen(
      PORT,
      () => {
        console.log(
          `API running on http://localhost:${PORT}`
        );

        console.log(
          `Socket.IO running on http://localhost:${PORT}`
        );
      }
    );
  } catch (error) {
    console.error(
      "Failed to start server:",
      error.message
    );

    process.exit(1);
  }
}

startServer();
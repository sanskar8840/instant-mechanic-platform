import jwt from "jsonwebtoken";
import User from "../models/User.js";

export const socketAuth = async (
  socket,
  next
) => {
  try {
    const token =
      socket.handshake.auth?.token;

    if (!token) {
      return next(
        new Error(
          "Authentication token required"
        )
      );
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    const user = await User.findById(
      decoded.id
    ).select(
      "_id name email role isActive"
    );

    if (!user) {
      return next(
        new Error("User not found")
      );
    }

    if (!user.isActive) {
      return next(
        new Error(
          "User account is inactive"
        )
      );
    }

    socket.user = {
      id: user._id.toString(),
      name: user.name,
      email: user.email,
      role: user.role,
    };

    next();
  } catch (error) {
    if (
      error.name ===
      "TokenExpiredError"
    ) {
      return next(
        new Error("Token expired")
      );
    }

    return next(
      new Error(
        "Socket authentication failed"
      )
    );
  }
};
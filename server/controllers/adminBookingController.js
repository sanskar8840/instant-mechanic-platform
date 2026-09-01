import Booking from "../models/Booking.js";
import User from "../models/User.js";

export const getAllBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find()
      .populate("customer", "name email phone")
      .populate("vehicle")
      .populate("service")
      .populate("mechanic", "name email phone")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: bookings.length,
      bookings,
    });
  } catch (error) {
    next(error);
  }
};

export const getAvailableMechanics = async (req, res, next) => {
  try {
    const mechanics = await User.find({
      role: "mechanic",
      isActive: true,
    }).select("name email phone");

    res.status(200).json({
      success: true,
      count: mechanics.length,
      mechanics,
    });
  } catch (error) {
    next(error);
  }
};

export const assignMechanic = async (req, res, next) => {
  try {
    const { mechanicId } = req.body;

    if (!mechanicId) {
      res.status(400);
      throw new Error("Mechanic ID is required");
    }

    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      res.status(404);
      throw new Error("Booking not found");
    }

    if (
      booking.status === "Completed" ||
      booking.status === "Cancelled"
    ) {
      res.status(400);
      throw new Error(
        `Mechanic cannot be assigned to a ${booking.status} booking`
      );
    }

    const mechanic = await User.findOne({
      _id: mechanicId,
      role: "mechanic",
      isActive: true,
    });

    if (!mechanic) {
      res.status(404);
      throw new Error("Mechanic not found");
    }

    booking.mechanic = mechanic._id;
    booking.status = "Assigned";

    await booking.save();

    const updatedBooking = await Booking.findById(booking._id)
      .populate("customer", "name email phone")
      .populate("vehicle")
      .populate("service")
      .populate("mechanic", "name email phone");

    const io = req.app.get("io");

    if (io) {
      io.to(`booking:${booking._id.toString()}`).emit(
        "booking:status-updated",
        {
          bookingId: booking._id.toString(),
          status: updatedBooking.status,
          booking: updatedBooking,
        }
      );

      console.log(
        `Realtime admin assignment sent: ${updatedBooking.status}`
      );
    }

    res.status(200).json({
      success: true,
      message: "Mechanic assigned successfully",
      booking: updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

export const getAdminBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate("customer", "name email phone")
      .populate("vehicle")
      .populate("service")
      .populate("mechanic", "name email phone");

    if (!booking) {
      res.status(404);
      throw new Error("Booking not found");
    }

    res.status(200).json({
      success: true,
      booking,
    });
  } catch (error) {
    next(error);
  }
};
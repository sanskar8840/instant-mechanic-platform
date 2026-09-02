import Booking from "../models/Booking.js";

export const getMyAssignedBookings = async (
  req,
  res,
  next
) => {
  try {
    const bookings = await Booking.find({
      mechanic: req.user.id,
    })
      .populate(
        "customer",
        "name email phone"
      )
      .populate("vehicle")
      .populate("service")
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

export const getMechanicBookingById = async (
  req,
  res,
  next
) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      mechanic: req.user.id,
    })
      .populate(
        "customer",
        "name email phone"
      )
      .populate("vehicle")
      .populate("service");

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

export const updateBookingStatus = async (
  req,
  res,
  next
) => {
  try {
    const { status } = req.body;

    const booking = await Booking.findOne({
      _id: req.params.id,
      mechanic: req.user.id,
    });

    if (!booking) {
      res.status(404);
      throw new Error("Booking not found");
    }

    if (booking.status === "Cancelled") {
      res.status(400);

      throw new Error(
        "Cancelled booking cannot be updated"
      );
    }

    if (booking.status === "Completed") {
      res.status(400);

      throw new Error(
        "Completed booking cannot be updated"
      );
    }

    const statusFlow = {
      Assigned: "Accepted",
      Accepted: "On The Way",
      "On The Way": "Arrived",
      Arrived: "In Progress",
      "In Progress": "Completed",
    };

    const expectedStatus =
      statusFlow[booking.status];

    if (!expectedStatus) {
      res.status(400);

      throw new Error(
        `Status cannot be updated from ${booking.status}`
      );
    }

    if (status !== expectedStatus) {
      res.status(400);

      throw new Error(
        `Next allowed status is ${expectedStatus}`
      );
    }

    booking.status = status;

    if (status === "Completed") {
      booking.completedAt = new Date();
    }

    await booking.save();

    const updatedBooking =
      await Booking.findById(
        booking._id
      )
        .populate(
          "customer",
          "name email phone"
        )
        .populate("vehicle")
        .populate("service")
        .populate(
          "mechanic",
          "name email phone"
        );

    const io = req.app.get("io");

    if (io) {
      io.to(
        `booking:${booking._id.toString()}`
      ).emit(
        "booking:status-updated",
        {
          bookingId:
            booking._id.toString(),

          status:
            updatedBooking.status,

          completedAt:
            updatedBooking.completedAt,

          booking:
            updatedBooking,
        }
      );
    }

    res.status(200).json({
      success: true,

      message:
        `Booking status updated to ${status}`,

      booking:
        updatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

export const updateMechanicLocation = async (
  req,
  res,
  next
) => {
  try {
    const {
      latitude,
      longitude,
    } = req.body;

    if (
      latitude === undefined ||
      longitude === undefined
    ) {
      res.status(400);

      throw new Error(
        "Latitude and longitude are required"
      );
    }

    const lat = Number(latitude);
    const lng = Number(longitude);

    if (
      Number.isNaN(lat) ||
      Number.isNaN(lng) ||
      lat < -90 ||
      lat > 90 ||
      lng < -180 ||
      lng > 180
    ) {
      res.status(400);

      throw new Error(
        "Invalid latitude or longitude"
      );
    }

    const booking = await Booking.findOne({
      _id: req.params.id,
      mechanic: req.user.id,
    });

    if (!booking) {
      res.status(404);
      throw new Error("Booking not found");
    }

    const allowedStatuses = [
      "Accepted",
      "On The Way",
      "Arrived",
      "In Progress",
    ];

    if (
      !allowedStatuses.includes(
        booking.status
      )
    ) {
      res.status(400);

      throw new Error(
        "Location sharing is not available for this booking status"
      );
    }

    booking.mechanicLocation = {
      latitude: lat,
      longitude: lng,
      updatedAt: new Date(),
    };

    await booking.save();

    const io = req.app.get("io");

    if (io) {
      io.to(
        `booking:${booking._id.toString()}`
      ).emit(
        "booking:location-updated",
        {
          bookingId:
            booking._id.toString(),

          latitude:
            lat,

          longitude:
            lng,

          updatedAt:
            booking.mechanicLocation
              .updatedAt,
        }
      );
    }

    res.status(200).json({
      success: true,

      message:
        "Mechanic location updated successfully",

      location:
        booking.mechanicLocation,
    });
  } catch (error) {
    next(error);
  }
};
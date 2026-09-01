import Booking from "../models/Booking.js";
import Vehicle from "../models/Vehicle.js";
import Service from "../models/Service.js";

const generateBookingId = () => {
  const randomNumber = Math.floor(100000 + Math.random() * 900000);
  return `IM-${Date.now()}-${randomNumber}`;
};

export const createBooking = async (req, res, next) => {
  try {
    const {
      vehicleId,
      serviceId,
      problemDescription,
      address,
      city,
      pincode,
      scheduledDate,
    } = req.body;

    if (
      !vehicleId ||
      !serviceId ||
      !problemDescription ||
      !address ||
      !city ||
      !pincode ||
      !scheduledDate
    ) {
      res.status(400);
      throw new Error("Please fill all required booking details");
    }

    const vehicle = await Vehicle.findOne({
      _id: vehicleId,
      customer: req.user.id,
    });

    if (!vehicle) {
      res.status(404);
      throw new Error("Vehicle not found");
    }

    const service = await Service.findOne({
      _id: serviceId,
      isActive: true,
    });

    if (!service) {
      res.status(404);
      throw new Error("Service not found");
    }

    if (!service.vehicleTypes.includes(vehicle.vehicleType)) {
      res.status(400);
      throw new Error("This service is not available for this vehicle type");
    }

    const selectedDate = new Date(scheduledDate);

    if (Number.isNaN(selectedDate.getTime())) {
      res.status(400);
      throw new Error("Invalid scheduled date");
    }

    const booking = await Booking.create({
      customer: req.user.id,
      vehicle: vehicle._id,
      service: service._id,
      bookingId: generateBookingId(),
      problemDescription,
      address,
      city,
      pincode,
      scheduledDate: selectedDate,
      amount: service.basePrice,
    });

    const populatedBooking = await Booking.findById(booking._id)
      .populate("vehicle")
      .populate("service")
      .populate("mechanic", "name email phone");

    res.status(201).json({
      success: true,
      message: "Booking created successfully",
      booking: populatedBooking,
    });
  } catch (error) {
    next(error);
  }
};

export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({
      customer: req.user.id,
    })
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

export const getMyBookingById = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      customer: req.user.id,
    })
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

export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.id,
      customer: req.user.id,
    });

    if (!booking) {
      res.status(404);
      throw new Error("Booking not found");
    }

    const cancellableStatuses = ["Pending", "Assigned"];

    if (!cancellableStatuses.includes(booking.status)) {
      res.status(400);
      throw new Error(
        `Booking cannot be cancelled when status is ${booking.status}`
      );
    }

    booking.status = "Cancelled";

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Booking cancelled successfully",
      booking,
    });
  } catch (error) {
    next(error);
  }
};
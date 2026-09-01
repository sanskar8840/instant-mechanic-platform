import Review from "../models/Review.js";
import Booking from "../models/Booking.js";

export const createReview = async (req, res, next) => {
  try {
    const { bookingId, rating, comment } = req.body;

    if (!bookingId || !rating) {
      res.status(400);
      throw new Error("Booking ID and rating are required");
    }

    const numericRating = Number(rating);

    if (
      Number.isNaN(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      res.status(400);
      throw new Error("Rating must be between 1 and 5");
    }

    const booking = await Booking.findOne({
      _id: bookingId,
      customer: req.user.id,
    });

    if (!booking) {
      res.status(404);
      throw new Error("Booking not found");
    }

    if (booking.status !== "Completed") {
      res.status(400);
      throw new Error(
        "Review can only be submitted after service completion"
      );
    }

    if (booking.paymentStatus !== "Paid") {
      res.status(400);
      throw new Error(
        "Please complete payment before submitting a review"
      );
    }

    if (!booking.mechanic) {
      res.status(400);
      throw new Error(
        "No mechanic is assigned to this booking"
      );
    }

    const existingReview = await Review.findOne({
      booking: booking._id,
    });

    if (existingReview) {
      res.status(400);
      throw new Error(
        "You have already reviewed this booking"
      );
    }

    const review = await Review.create({
      customer: req.user.id,
      mechanic: booking.mechanic,
      booking: booking._id,
      rating: numericRating,
      comment: comment || "",
    });

    const populatedReview = await Review.findById(
      review._id
    )
      .populate("customer", "name")
      .populate("mechanic", "name email")
      .populate(
        "booking",
        "bookingId status amount"
      );

    res.status(201).json({
      success: true,
      message: "Review submitted successfully",
      review: populatedReview,
    });
  } catch (error) {
    next(error);
  }
};

export const getBookingReview = async (
  req,
  res,
  next
) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.bookingId,
      customer: req.user.id,
    });

    if (!booking) {
      res.status(404);
      throw new Error("Booking not found");
    }

    const review = await Review.findOne({
      booking: booking._id,
    })
      .populate("customer", "name")
      .populate("mechanic", "name email");

    res.status(200).json({
      success: true,
      review,
    });
  } catch (error) {
    next(error);
  }
};
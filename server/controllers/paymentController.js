import crypto from "crypto";

import Booking from "../models/Booking.js";
import razorpay from "../config/razorpay.js";

export const createPaymentOrder = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({
      _id: req.params.bookingId,
      customer: req.user.id,
    });

    if (!booking) {
      res.status(404);
      throw new Error("Booking not found");
    }

    if (booking.status !== "Completed") {
      res.status(400);
      throw new Error(
        "Payment can only be made after service completion"
      );
    }

    if (booking.paymentStatus === "Paid") {
      res.status(400);
      throw new Error("Payment already completed");
    }

    const order = await razorpay.orders.create({
      amount: Math.round(booking.amount * 100),
      currency: "INR",
      receipt: booking.bookingId.slice(0, 40),
      notes: {
        bookingId: booking._id.toString(),
        customerId: req.user.id.toString(),
      },
    });

    booking.razorpayOrderId = order.id;

    await booking.save();

    res.status(200).json({
      success: true,
      key: process.env.RAZORPAY_KEY_ID,
      order: {
        id: order.id,
        amount: order.amount,
        currency: order.currency,
      },
      booking: {
        id: booking._id,
        bookingId: booking.bookingId,
        amount: booking.amount,
      },
    });
  } catch (error) {
    next(error);
  }
};

export const verifyPayment = async (req, res, next) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    } = req.body;

    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature
    ) {
      res.status(400);
      throw new Error("Payment verification details are missing");
    }

    const booking = await Booking.findOne({
      _id: req.params.bookingId,
      customer: req.user.id,
    });

    if (!booking) {
      res.status(404);
      throw new Error("Booking not found");
    }

    if (booking.razorpayOrderId !== razorpay_order_id) {
      res.status(400);
      throw new Error("Invalid Razorpay order");
    }

    const expectedSignature = crypto
      .createHmac(
        "sha256",
        process.env.RAZORPAY_KEY_SECRET
      )
      .update(
        `${razorpay_order_id}|${razorpay_payment_id}`
      )
      .digest("hex");

    if (expectedSignature !== razorpay_signature) {
      booking.paymentStatus = "Failed";
      await booking.save();

      res.status(400);
      throw new Error("Payment verification failed");
    }

    booking.paymentStatus = "Paid";
    booking.razorpayPaymentId = razorpay_payment_id;
    booking.razorpaySignature = razorpay_signature;
    booking.paidAt = new Date();

    await booking.save();

    res.status(200).json({
      success: true,
      message: "Payment verified successfully",
      paymentStatus: booking.paymentStatus,
    });
  } catch (error) {
    next(error);
  }
};
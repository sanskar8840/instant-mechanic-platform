import crypto from "crypto";

import Booking from "../models/Booking.js";
import razorpay from "../config/razorpay.js";

const roundMoney = (value) => {
  return Math.round((value + Number.EPSILON) * 100) / 100;
};

const getFinanceConfig = () => {
  const mechanicSharePercent = Number(
    process.env.MECHANIC_SHARE_PERCENT || 80
  );

  const paymentGatewayFeePercent = Number(
    process.env.PAYMENT_GATEWAY_FEE_PERCENT || 0
  );

  if (
    Number.isNaN(mechanicSharePercent) ||
    mechanicSharePercent < 0 ||
    mechanicSharePercent > 100
  ) {
    throw new Error(
      "MECHANIC_SHARE_PERCENT must be between 0 and 100"
    );
  }

  if (
    Number.isNaN(paymentGatewayFeePercent) ||
    paymentGatewayFeePercent < 0 ||
    paymentGatewayFeePercent > 100
  ) {
    throw new Error(
      "PAYMENT_GATEWAY_FEE_PERCENT must be between 0 and 100"
    );
  }

  return {
    mechanicSharePercent,
    paymentGatewayFeePercent,
  };
};

export const createPaymentOrder = async (
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

    if (booking.status !== "Completed") {
      res.status(400);
      throw new Error(
        "Payment can only be made after service completion"
      );
    }

    if (!booking.mechanic) {
      res.status(400);
      throw new Error(
        "Payment cannot be created without an assigned mechanic"
      );
    }

    if (booking.paymentStatus === "Paid") {
      res.status(400);
      throw new Error(
        "Payment already completed"
      );
    }

    const order = await razorpay.orders.create({
      amount: Math.round(
        booking.amount * 100
      ),
      currency: "INR",
      receipt: booking.bookingId.slice(
        0,
        40
      ),
      notes: {
        bookingId:
          booking._id.toString(),
        customerId:
          req.user.id.toString(),
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

export const verifyPayment = async (
  req,
  res,
  next
) => {
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

      throw new Error(
        "Payment verification details are missing"
      );
    }

    const booking = await Booking.findOne({
      _id: req.params.bookingId,
      customer: req.user.id,
    });

    if (!booking) {
      res.status(404);
      throw new Error("Booking not found");
    }

    if (
      booking.razorpayOrderId !==
      razorpay_order_id
    ) {
      res.status(400);

      throw new Error(
        "Invalid Razorpay order"
      );
    }

    if (booking.paymentStatus === "Paid") {
      return res.status(200).json({
        success: true,
        message:
          "Payment already verified",
        paymentStatus:
          booking.paymentStatus,
      });
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

    const expectedBuffer = Buffer.from(
      expectedSignature,
      "utf8"
    );

    const receivedBuffer = Buffer.from(
      razorpay_signature,
      "utf8"
    );

    const signatureIsValid =
      expectedBuffer.length ===
        receivedBuffer.length &&
      crypto.timingSafeEqual(
        expectedBuffer,
        receivedBuffer
      );

    if (!signatureIsValid) {
      booking.paymentStatus = "Failed";

      await booking.save();

      res.status(400);

      throw new Error(
        "Payment verification failed"
      );
    }

    const {
      mechanicSharePercent,
      paymentGatewayFeePercent,
    } = getFinanceConfig();

    const totalAmount = roundMoney(
      booking.amount
    );

    const mechanicEarning = roundMoney(
      totalAmount *
        (mechanicSharePercent / 100)
    );

    const platformGrossProfit =
      roundMoney(
        totalAmount - mechanicEarning
      );

    const paymentGatewayFee =
      roundMoney(
        totalAmount *
          (paymentGatewayFeePercent / 100)
      );

    const platformNetProfit =
      roundMoney(
        platformGrossProfit -
          paymentGatewayFee
      );

    booking.paymentStatus = "Paid";

    booking.razorpayPaymentId =
      razorpay_payment_id;

    booking.razorpaySignature =
      razorpay_signature;

    booking.paidAt = new Date();

    booking.mechanicSharePercent =
      mechanicSharePercent;

    booking.mechanicEarning =
      mechanicEarning;

    booking.platformGrossProfit =
      platformGrossProfit;

    booking.paymentGatewayFee =
      paymentGatewayFee;

    booking.platformNetProfit =
      platformNetProfit;

    booking.mechanicPayoutStatus =
      "Pending";

    booking.mechanicPaidAmount = 0;

    booking.mechanicPaidAt = null;

    await booking.save();

    res.status(200).json({
      success: true,
      message:
        "Payment verified successfully",

      paymentStatus:
        booking.paymentStatus,

      finance: {
        totalAmount,
        mechanicSharePercent,
        mechanicEarning,
        platformGrossProfit,
        paymentGatewayFee,
        platformNetProfit,
        mechanicPayoutStatus:
          booking.mechanicPayoutStatus,
      },
    });
  } catch (error) {
    next(error);
  }
};
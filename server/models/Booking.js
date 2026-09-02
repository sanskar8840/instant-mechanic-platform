import mongoose from "mongoose";

const bookingSchema = new mongoose.Schema(
  {
    customer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    vehicle: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vehicle",
      required: true,
    },

    service: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Service",
      required: true,
    },

    mechanic: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    bookingId: {
      type: String,
      required: true,
      unique: true,
    },

    problemDescription: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    city: {
      type: String,
      required: true,
      trim: true,
    },

    pincode: {
      type: String,
      required: true,
      trim: true,
    },

    scheduledDate: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "Pending",
        "Assigned",
        "Accepted",
        "On The Way",
        "Arrived",
        "In Progress",
        "Completed",
        "Cancelled",
      ],
      default: "Pending",
    },

    completedAt: {
      type: Date,
      default: null,
    },

    amount: {
      type: Number,
      required: true,
      min: 0,
    },

    paymentStatus: {
      type: String,
      enum: [
        "Pending",
        "Paid",
        "Failed",
        "Refunded",
      ],
      default: "Pending",
    },

    razorpayOrderId: {
      type: String,
      default: null,
    },

    razorpayPaymentId: {
      type: String,
      default: null,
    },

    razorpaySignature: {
      type: String,
      default: null,
    },

    paidAt: {
      type: Date,
      default: null,
    },

    mechanicSharePercent: {
      type: Number,
      min: 0,
      max: 100,
      default: null,
    },

    mechanicEarning: {
      type: Number,
      min: 0,
      default: null,
    },

    platformGrossProfit: {
      type: Number,
      min: 0,
      default: null,
    },

    paymentGatewayFee: {
      type: Number,
      min: 0,
      default: 0,
    },

    platformNetProfit: {
      type: Number,
      default: null,
    },

    mechanicPayoutStatus: {
      type: String,
      enum: ["Pending", "Paid"],
      default: "Pending",
    },

    mechanicPaidAmount: {
      type: Number,
      min: 0,
      default: 0,
    },

    mechanicPaidAt: {
      type: Date,
      default: null,
    },

    mechanicLocation: {
      latitude: {
        type: Number,
        default: null,
      },

      longitude: {
        type: Number,
        default: null,
      },

      updatedAt: {
        type: Date,
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

bookingSchema.index({
  customer: 1,
  createdAt: -1,
});

bookingSchema.index({
  mechanic: 1,
  createdAt: -1,
});

bookingSchema.index({
  status: 1,
  completedAt: -1,
});

bookingSchema.index({
  paymentStatus: 1,
  paidAt: -1,
});

bookingSchema.index({
  mechanicPayoutStatus: 1,
});

export default mongoose.model(
  "Booking",
  bookingSchema
);
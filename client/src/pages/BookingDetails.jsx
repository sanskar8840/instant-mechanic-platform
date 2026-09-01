import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";

import {
  CarFront,
  Wrench,
  MapPin,
  CalendarClock,
  UserRound,
  IndianRupee,
  Wifi,
  CreditCard,
  CheckCircle2,
  Star,
  Navigation,
} from "lucide-react";

import api from "../services/api";
import socket from "../services/socket";
import { loadRazorpayScript } from "../utils/loadRazorpay";
import LiveTrackingMap from "../components/LiveTrackingMap.jsx";

export default function BookingDetails() {
  const { bookingId } = useParams();

  const [booking, setBooking] = useState(null);
  const [review, setReview] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [cancelling, setCancelling] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [paying, setPaying] = useState(false);

  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState("");
  const [submittingReview, setSubmittingReview] =
    useState(false);

  const [mechanicLocation, setMechanicLocation] =
    useState({
      latitude: null,
      longitude: null,
      updatedAt: null,
    });

  const loadBooking = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        `/bookings/${bookingId}`
      );

      const bookingData =
        response.data.booking;

      setBooking(bookingData);

      const location =
        bookingData?.mechanicLocation;

      if (
        location?.latitude !== null &&
        location?.longitude !== null
      ) {
        setMechanicLocation({
          latitude: location.latitude,
          longitude: location.longitude,
          updatedAt: location.updatedAt,
        });
      }
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load booking details"
      );
    } finally {
      setLoading(false);
    }
  };

  const loadReview = async () => {
    try {
      const response = await api.get(
        `/reviews/booking/${bookingId}`
      );

      setReview(
        response.data.review || null
      );
    } catch (err) {
      console.error(
        "Unable to load review:",
        err
      );
    }
  };

  useEffect(() => {
    loadBooking();
    loadReview();
  }, [bookingId]);

  useEffect(() => {
    const joinBookingRoom = () => {
      setSocketConnected(true);

      socket.emit(
        "booking:join",
        bookingId
      );
    };

    const handleDisconnect = () => {
      setSocketConnected(false);
    };

    const handleStatusUpdate = (data) => {
      if (
        data.bookingId !== bookingId
      ) {
        return;
      }

      console.log(
        "Realtime booking status:",
        data.status
      );

      if (data.booking) {
        setBooking(data.booking);

        const location =
          data.booking.mechanicLocation;

        if (
          location?.latitude !== null &&
          location?.longitude !== null
        ) {
          setMechanicLocation({
            latitude: location.latitude,
            longitude: location.longitude,
            updatedAt: location.updatedAt,
          });
        }
      }
    };

    const handleLocationUpdate = (
      data
    ) => {
      if (
        data.bookingId !== bookingId
      ) {
        return;
      }

      console.log(
        "Realtime mechanic location:",
        data.latitude,
        data.longitude
      );

      setMechanicLocation({
        latitude: data.latitude,
        longitude: data.longitude,
        updatedAt: data.updatedAt,
      });
    };

    socket.on(
      "connect",
      joinBookingRoom
    );

    socket.on(
      "disconnect",
      handleDisconnect
    );

    socket.on(
      "booking:status-updated",
      handleStatusUpdate
    );

    socket.on(
      "booking:location-updated",
      handleLocationUpdate
    );

    if (!socket.connected) {
      socket.connect();
    } else {
      joinBookingRoom();
    }

    return () => {
      socket.emit(
        "booking:leave",
        bookingId
      );

      socket.off(
        "connect",
        joinBookingRoom
      );

      socket.off(
        "disconnect",
        handleDisconnect
      );

      socket.off(
        "booking:status-updated",
        handleStatusUpdate
      );

      socket.off(
        "booking:location-updated",
        handleLocationUpdate
      );

      socket.disconnect();
    };
  }, [bookingId]);

  const handleCancel = async () => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this booking?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setCancelling(true);

      await api.patch(
        `/bookings/${bookingId}/cancel`
      );

      await loadBooking();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Unable to cancel booking"
      );
    } finally {
      setCancelling(false);
    }
  };

  const handlePayment = async () => {
    try {
      setPaying(true);

      const scriptLoaded =
        await loadRazorpayScript();

      if (!scriptLoaded) {
        alert(
          "Unable to load Razorpay. Please check your internet connection."
        );

        setPaying(false);
        return;
      }

      const response = await api.post(
        `/payments/${bookingId}/create-order`
      );

      const { key, order } =
        response.data;

      const options = {
        key,

        amount: order.amount,

        currency: order.currency,

        name: "Instant Mechanic",

        description:
          booking.service?.name ||
          "Mechanic Service Payment",

        order_id: order.id,

        handler: async (
          paymentResponse
        ) => {
          try {
            await api.post(
              `/payments/${bookingId}/verify`,
              {
                razorpay_order_id:
                  paymentResponse.razorpay_order_id,

                razorpay_payment_id:
                  paymentResponse.razorpay_payment_id,

                razorpay_signature:
                  paymentResponse.razorpay_signature,
              }
            );

            await loadBooking();

            alert(
              "Payment completed successfully"
            );
          } catch (err) {
            alert(
              err.response?.data?.message ||
                "Payment verification failed"
            );
          } finally {
            setPaying(false);
          }
        },

        modal: {
          ondismiss: () => {
            setPaying(false);
          },
        },
      };

      const razorpay =
        new window.Razorpay(options);

      razorpay.on(
        "payment.failed",
        (response) => {
          console.error(
            "Payment failed:",
            response.error
          );

          setPaying(false);

          alert(
            response.error?.description ||
              "Payment failed"
          );
        }
      );

      razorpay.open();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Unable to start payment"
      );

      setPaying(false);
    }
  };

  const handleReviewSubmit = async (
    e
  ) => {
    e.preventDefault();

    try {
      setSubmittingReview(true);

      const response = await api.post(
        "/reviews",
        {
          bookingId,
          rating,
          comment,
        }
      );

      setReview(
        response.data.review
      );

      setComment("");

      alert(
        "Review submitted successfully"
      );
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Unable to submit review"
      );
    } finally {
      setSubmittingReview(false);
    }
  };

  const getStatusStyle = (
    status
  ) => {
    switch (status) {
      case "Pending":
        return "bg-amber-500/10 text-amber-400";

      case "Assigned":
        return "bg-purple-500/10 text-purple-400";

      case "Accepted":
        return "bg-blue-500/10 text-blue-400";

      case "On The Way":
        return "bg-cyan-500/10 text-cyan-400";

      case "Arrived":
        return "bg-indigo-500/10 text-indigo-400";

      case "In Progress":
        return "bg-orange-500/10 text-orange-400";

      case "Completed":
        return "bg-emerald-500/10 text-emerald-400";

      case "Cancelled":
        return "bg-red-500/10 text-red-400";

      default:
        return "bg-slate-700 text-slate-300";
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 text-white">
        Loading booking...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 px-6">
        <div className="max-w-md rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-400">
          {error}
        </div>
      </div>
    );
  }

  if (!booking) {
    return null;
  }

  const canCancel = [
    "Pending",
    "Assigned",
  ].includes(booking.status);

  const canPay =
    booking.status === "Completed" &&
    booking.paymentStatus !== "Paid";

  const isPaid =
    booking.paymentStatus === "Paid";

  const canReview =
    booking.status === "Completed" &&
    isPaid &&
    !review;

  const showLiveMap =
    booking.mechanic &&
    [
      "Accepted",
      "On The Way",
      "Arrived",
      "In Progress",
    ].includes(booking.status);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold">
              Instant Mechanic
            </h1>

            <p className="text-sm text-slate-400">
              Booking Details
            </p>
          </div>

          <Link
            to="/customer/bookings"
            className="text-sm font-medium text-slate-300 hover:text-white"
          >
            My Bookings
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="font-medium text-blue-400">
                Booking ID
              </p>

              <h2 className="mt-2 text-3xl font-bold">
                {booking.bookingId}
              </h2>
            </div>

            <div
              className={`flex items-center gap-2 rounded-full px-3 py-2 text-sm font-semibold ${
                socketConnected
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              <Wifi size={16} />

              {socketConnected
                ? "Live Tracking Connected"
                : "Connecting..."}
            </div>
          </div>

          <div className="mt-4">
            <span
              className={`inline-flex rounded-full px-4 py-2 text-sm font-semibold ${getStatusStyle(
                booking.status
              )}`}
            >
              {booking.status}
            </span>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center gap-3">
              <CarFront className="text-blue-400" />

              <h3 className="text-lg font-bold">
                Vehicle
              </h3>
            </div>

            <p className="mt-4 text-xl font-semibold">
              {booking.vehicle?.brand}{" "}
              {booking.vehicle?.model}
            </p>

            <p className="mt-1 text-slate-400">
              {
                booking.vehicle
                  ?.registrationNumber
              }
            </p>

            <p className="mt-2 text-sm text-slate-500">
              {booking.vehicle?.fuelType} ·{" "}
              {booking.vehicle?.year}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center gap-3">
              <Wrench className="text-emerald-400" />

              <h3 className="text-lg font-bold">
                Service
              </h3>
            </div>

            <p className="mt-4 text-xl font-semibold">
              {booking.service?.name}
            </p>

            <p className="mt-2 text-slate-400">
              {
                booking.service
                  ?.description
              }
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center gap-3">
              <MapPin className="text-rose-400" />

              <h3 className="text-lg font-bold">
                Service Location
              </h3>
            </div>

            <p className="mt-4">
              {booking.address}
            </p>

            <p className="mt-1 text-slate-400">
              {booking.city} -{" "}
              {booking.pincode}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center gap-3">
              <CalendarClock className="text-amber-400" />

              <h3 className="text-lg font-bold">
                Scheduled Time
              </h3>
            </div>

            <p className="mt-4">
              {new Date(
                booking.scheduledDate
              ).toLocaleString("en-IN")}
            </p>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center gap-3">
              <UserRound className="text-purple-400" />

              <h3 className="text-lg font-bold">
                Assigned Mechanic
              </h3>
            </div>

            {booking.mechanic ? (
              <>
                <p className="mt-4 font-semibold">
                  {
                    booking.mechanic
                      .name
                  }
                </p>

                <p className="mt-1 text-slate-400">
                  {booking.mechanic
                    .phone ||
                    "Phone not available"}
                </p>
              </>
            ) : (
              <p className="mt-4 text-slate-400">
                Mechanic has not been
                assigned yet.
              </p>
            )}
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <div className="flex items-center gap-3">
              <IndianRupee className="text-green-400" />

              <h3 className="text-lg font-bold">
                Payment
              </h3>
            </div>

            <p className="mt-4 text-3xl font-bold">
              ₹{booking.amount}
            </p>

            <p className="mt-2 text-slate-400">
              Payment Status:{" "}
              <span
                className={
                  isPaid
                    ? "font-semibold text-emerald-400"
                    : "font-semibold text-amber-400"
                }
              >
                {booking.paymentStatus}
              </span>
            </p>

            {canPay && (
              <button
                onClick={handlePayment}
                disabled={paying}
                className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500 disabled:opacity-60"
              >
                <CreditCard size={19} />

                {paying
                  ? "Opening Payment..."
                  : `Pay Now ₹${booking.amount}`}
              </button>
            )}

            {isPaid && (
              <div className="mt-5 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/10 p-3 text-sm font-semibold text-emerald-400">
                <CheckCircle2
                  size={18}
                />
                Payment Completed
              </div>
            )}

            {booking.status !==
              "Completed" &&
              !isPaid && (
                <p className="mt-4 text-sm text-slate-500">
                  Payment will be
                  available after the
                  service is completed.
                </p>
              )}
          </div>
        </div>

        <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="text-lg font-bold">
            Problem Description
          </h3>

          <p className="mt-3 text-slate-400">
            {
              booking.problemDescription
            }
          </p>
        </div>

        {showLiveMap && (
          <div className="mt-6 rounded-2xl border border-cyan-500/20 bg-slate-900 p-6">
            <div className="mb-5">
              <div className="flex items-center gap-3">
                <Navigation className="text-cyan-400" />

                <h3 className="text-xl font-bold">
                  Live Mechanic Location
                </h3>
              </div>

              <p className="mt-2 text-slate-400">
                Track your mechanic's current
                GPS location in real time.
              </p>

              {mechanicLocation.updatedAt && (
                <p className="mt-2 text-xs text-slate-500">
                  Last updated:{" "}
                  {new Date(
                    mechanicLocation.updatedAt
                  ).toLocaleTimeString(
                    "en-IN"
                  )}
                </p>
              )}
            </div>

            <LiveTrackingMap
              latitude={
                mechanicLocation.latitude
              }
              longitude={
                mechanicLocation.longitude
              }
            />

            {mechanicLocation.latitude ===
              null && (
              <p className="mt-3 text-center text-sm text-slate-500">
                Waiting for mechanic to
                share live location...
              </p>
            )}
          </div>
        )}

        {canReview && (
          <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h3 className="text-xl font-bold">
              Rate Your Mechanic
            </h3>

            <p className="mt-2 text-slate-400">
              Share your experience with
              the service.
            </p>

            <form
              onSubmit={
                handleReviewSubmit
              }
              className="mt-6"
            >
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(
                  (star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() =>
                        setRating(
                          star
                        )
                      }
                      className="transition hover:scale-110"
                    >
                      <Star
                        size={32}
                        className={
                          star <= rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-600"
                        }
                      />
                    </button>
                  )
                )}
              </div>

              <p className="mt-2 text-sm text-slate-400">
                {rating} / 5 stars
              </p>

              <textarea
                value={comment}
                onChange={(e) =>
                  setComment(
                    e.target.value
                  )
                }
                maxLength={500}
                rows={4}
                placeholder="Write your experience..."
                className="mt-5 w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-blue-500"
              />

              <button
                type="submit"
                disabled={
                  submittingReview
                }
                className="mt-4 rounded-lg bg-amber-600 px-5 py-3 font-semibold transition hover:bg-amber-500 disabled:opacity-60"
              >
                {submittingReview
                  ? "Submitting..."
                  : "Submit Review"}
              </button>
            </form>
          </div>
        )}

        {review && (
          <div className="mt-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="text-emerald-400" />

              <h3 className="text-xl font-bold">
                Your Review
              </h3>
            </div>

            <div className="mt-4 flex gap-1">
              {[1, 2, 3, 4, 5].map(
                (star) => (
                  <Star
                    key={star}
                    size={22}
                    className={
                      star <=
                      review.rating
                        ? "fill-amber-400 text-amber-400"
                        : "text-slate-600"
                    }
                  />
                )
              )}
            </div>

            <p className="mt-4 text-slate-300">
              {review.comment ||
                "No comment provided."}
            </p>
          </div>
        )}

        {canCancel && (
          <button
            onClick={handleCancel}
            disabled={cancelling}
            className="mt-6 rounded-lg bg-red-600 px-5 py-3 font-semibold transition hover:bg-red-500 disabled:opacity-60"
          >
            {cancelling
              ? "Cancelling..."
              : "Cancel Booking"}
          </button>
        )}
      </main>
    </div>
  );
}
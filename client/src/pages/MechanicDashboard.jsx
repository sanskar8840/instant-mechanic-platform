import {
  useEffect,
  useRef,
  useState,
} from "react";

import { useNavigate } from "react-router-dom";

import {
  BriefcaseBusiness,
  CheckCircle2,
  Clock3,
  CarFront,
  Wrench,
  MapPin,
  UserRound,
  Phone,
  CalendarDays,
  Star,
  Navigation,
  Radio,
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function MechanicDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);

  const [reviewStats, setReviewStats] = useState({
    averageRating: 0,
    totalReviews: 0,
  });

  const [reviews, setReviews] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updatingId, setUpdatingId] = useState("");

  const [
    locationSharingBookingId,
    setLocationSharingBookingId,
  ] = useState("");

  const [
    locationError,
    setLocationError,
  ] = useState("");

  const watchIdRef = useRef(null);
  const lastSentRef = useRef(0);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        bookingResponse,
        reviewResponse,
      ] = await Promise.all([
        api.get("/mechanic/bookings"),
        api.get("/mechanic/reviews"),
      ]);

      setBookings(
        bookingResponse.data.bookings || []
      );

      setReviewStats(
        reviewResponse.data.stats || {
          averageRating: 0,
          totalReviews: 0,
        }
      );

      setReviews(
        reviewResponse.data.reviews || []
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load mechanic dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  useEffect(() => {
    return () => {
      if (watchIdRef.current !== null) {
        navigator.geolocation.clearWatch(
          watchIdRef.current
        );
      }
    };
  }, []);

  const handleLogout = () => {
    stopLocationSharing();

    logout();

    navigate("/mechanic/login");
  };

  const getNextStatus = (status) => {
    const flow = {
      Assigned: "Accepted",
      Accepted: "On The Way",
      "On The Way": "Arrived",
      Arrived: "In Progress",
      "In Progress": "Completed",
    };

    return flow[status] || null;
  };

  const getButtonText = (status) => {
    const labels = {
      Assigned: "Accept Job",
      Accepted: "Start Journey",
      "On The Way": "Mark Arrived",
      Arrived: "Start Service",
      "In Progress": "Complete Service",
    };

    return labels[status] || "";
  };

  const stopLocationSharing = () => {
    if (
      watchIdRef.current !== null &&
      navigator.geolocation
    ) {
      navigator.geolocation.clearWatch(
        watchIdRef.current
      );
    }

    watchIdRef.current = null;

    setLocationSharingBookingId("");

    setLocationError("");

    lastSentRef.current = 0;
  };

  const startLocationSharing = (
    bookingId
  ) => {
    if (!navigator.geolocation) {
      alert(
        "Geolocation is not supported by this browser."
      );

      return;
    }

    if (
      watchIdRef.current !== null
    ) {
      stopLocationSharing();
    }

    setLocationError("");

    const watchId =
      navigator.geolocation.watchPosition(
        async (position) => {
          try {
            const now = Date.now();

            if (
              now - lastSentRef.current <
              5000
            ) {
              return;
            }

            lastSentRef.current = now;

            const latitude =
              position.coords.latitude;

            const longitude =
              position.coords.longitude;

            await api.patch(
              `/mechanic/bookings/${bookingId}/location`,
              {
                latitude,
                longitude,
              }
            );

            setLocationSharingBookingId(
              bookingId
            );

            console.log(
              "Live location sent:",
              latitude,
              longitude
            );
          } catch (err) {
            const message =
              err.response?.data?.message ||
              "Unable to send live location";

            setLocationError(message);

            console.error(
              "Location update failed:",
              err
            );
          }
        },

        (geoError) => {
          console.error(
            "Geolocation error:",
            geoError
          );

          if (
            geoError.code ===
            geoError.PERMISSION_DENIED
          ) {
            setLocationError(
              "Location permission denied. Please allow location access."
            );
          } else {
            setLocationError(
              "Unable to get your current location."
            );
          }
        },

        {
          enableHighAccuracy: true,
          timeout: 15000,
          maximumAge: 5000,
        }
      );

    watchIdRef.current = watchId;

    setLocationSharingBookingId(
      bookingId
    );
  };

  const handleStatusUpdate = async (
    booking
  ) => {
    const nextStatus =
      getNextStatus(booking.status);

    if (!nextStatus) {
      return;
    }

    try {
      setUpdatingId(booking._id);

      await api.patch(
        `/mechanic/bookings/${booking._id}/status`,
        {
          status: nextStatus,
        }
      );

      if (
        nextStatus === "Completed" &&
        locationSharingBookingId ===
          booking._id
      ) {
        stopLocationSharing();
      }

      await loadDashboard();
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Unable to update booking status"
      );
    } finally {
      setUpdatingId("");
    }
  };

  const getStatusStyle = (status) => {
    switch (status) {
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

  const canShareLocation = (
    status
  ) => {
    return [
      "Accepted",
      "On The Way",
      "Arrived",
      "In Progress",
    ].includes(status);
  };

  const activeBookings =
    bookings.filter(
      (booking) =>
        booking.status !== "Completed" &&
        booking.status !== "Cancelled"
    ).length;

  const completedBookings =
    bookings.filter(
      (booking) =>
        booking.status === "Completed"
    ).length;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold">
              Instant Mechanic
            </h1>

            <p className="text-sm text-slate-400">
              Mechanic Dashboard
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">
                {user?.name}
              </p>

              <p className="text-xs text-slate-400">
                Mechanic
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold transition hover:bg-red-500"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8">
          <p className="font-medium text-emerald-400">
            Mechanic Portal
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Welcome, {user?.name}
          </h2>

          <p className="mt-2 text-slate-400">
            Manage assigned jobs, live location
            and customer ratings.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <BriefcaseBusiness className="text-blue-400" />

            <p className="mt-5 text-sm text-slate-400">
              Total Assigned Jobs
            </p>

            <h3 className="mt-2 text-3xl font-bold">
              {loading
                ? "..."
                : bookings.length}
            </h3>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <Clock3 className="text-amber-400" />

            <p className="mt-5 text-sm text-slate-400">
              Active Jobs
            </p>

            <h3 className="mt-2 text-3xl font-bold">
              {loading
                ? "..."
                : activeBookings}
            </h3>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <CheckCircle2 className="text-emerald-400" />

            <p className="mt-5 text-sm text-slate-400">
              Completed Jobs
            </p>

            <h3 className="mt-2 text-3xl font-bold">
              {loading
                ? "..."
                : completedBookings}
            </h3>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <Star className="fill-amber-400 text-amber-400" />

            <p className="mt-5 text-sm text-slate-400">
              Average Rating
            </p>

            <div className="mt-2 flex items-end gap-2">
              <h3 className="text-3xl font-bold">
                {loading
                  ? "..."
                  : reviewStats.averageRating}
              </h3>

              {!loading && (
                <span className="mb-1 text-amber-400">
                  / 5
                </span>
              )}
            </div>

            <p className="mt-2 text-sm text-slate-500">
              {loading
                ? "Loading..."
                : `${reviewStats.totalReviews} reviews`}
            </p>
          </div>
        </div>

        {locationError && (
          <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
            {locationError}
          </div>
        )}

        <div className="mt-8">
          <h3 className="text-2xl font-bold">
            Assigned Jobs
          </h3>

          <p className="mt-1 text-slate-400">
            Update job status and share live
            location with the customer.
          </p>

          {loading && (
            <div className="mt-6 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
              Loading jobs...
            </div>
          )}

          {!loading &&
            bookings.length > 0 && (
              <div className="mt-6 space-y-5">
                {bookings.map(
                  (booking) => {
                    const nextStatus =
                      getNextStatus(
                        booking.status
                      );

                    const isSharing =
                      locationSharingBookingId ===
                      booking._id;

                    return (
                      <div
                        key={booking._id}
                        className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
                      >
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div>
                            <p className="text-xs uppercase tracking-wider text-slate-500">
                              Booking ID
                            </p>

                            <h4 className="mt-1 text-lg font-bold">
                              {
                                booking.bookingId
                              }
                            </h4>

                            <span
                              className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusStyle(
                                booking.status
                              )}`}
                            >
                              {
                                booking.status
                              }
                            </span>
                          </div>

                          <p className="text-xl font-bold">
                            ₹{booking.amount}
                          </p>
                        </div>

                        <div className="mt-6 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                          <div className="flex gap-3">
                            <UserRound className="text-purple-400" />

                            <div>
                              <p className="text-xs text-slate-500">
                                Customer
                              </p>

                              <p className="font-semibold">
                                {
                                  booking
                                    .customer
                                    ?.name
                                }
                              </p>

                              <p className="text-sm text-slate-400">
                                {
                                  booking
                                    .customer
                                    ?.email
                                }
                              </p>

                              {booking.customer
                                ?.phone && (
                                <p className="mt-1 flex items-center gap-1 text-sm text-slate-400">
                                  <Phone
                                    size={
                                      14
                                    }
                                  />
                                  {
                                    booking
                                      .customer
                                      .phone
                                  }
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <CarFront className="text-emerald-400" />

                            <div>
                              <p className="text-xs text-slate-500">
                                Vehicle
                              </p>

                              <p className="font-semibold">
                                {
                                  booking
                                    .vehicle
                                    ?.brand
                                }{" "}
                                {
                                  booking
                                    .vehicle
                                    ?.model
                                }
                              </p>

                              <p className="text-sm text-slate-400">
                                {
                                  booking
                                    .vehicle
                                    ?.registrationNumber
                                }
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <Wrench className="text-blue-400" />

                            <div>
                              <p className="text-xs text-slate-500">
                                Service
                              </p>

                              <p className="font-semibold">
                                {
                                  booking
                                    .service
                                    ?.name
                                }
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <MapPin className="text-rose-400" />

                            <div>
                              <p className="text-xs text-slate-500">
                                Location
                              </p>

                              <p className="font-semibold">
                                {
                                  booking.address
                                }
                              </p>

                              <p className="text-sm text-slate-400">
                                {
                                  booking.city
                                }{" "}
                                -{" "}
                                {
                                  booking.pincode
                                }
                              </p>
                            </div>
                          </div>

                          <div className="flex gap-3">
                            <CalendarDays className="text-amber-400" />

                            <div>
                              <p className="text-xs text-slate-500">
                                Scheduled
                              </p>

                              <p className="font-semibold">
                                {new Date(
                                  booking.scheduledDate
                                ).toLocaleString(
                                  "en-IN"
                                )}
                              </p>
                            </div>
                          </div>
                        </div>

                        <div className="mt-6 rounded-xl bg-slate-950 p-4">
                          <p className="text-sm text-slate-500">
                            Customer Problem
                          </p>

                          <p className="mt-2 text-slate-300">
                            {
                              booking.problemDescription
                            }
                          </p>
                        </div>

                        {canShareLocation(
                          booking.status
                        ) && (
                          <div className="mt-6 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-5">
                            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                              <div>
                                <div className="flex items-center gap-2">
                                  <Navigation className="text-cyan-400" />

                                  <h5 className="font-bold">
                                    Live Location
                                  </h5>
                                </div>

                                <p className="mt-2 text-sm text-slate-400">
                                  {isSharing
                                    ? "Your live GPS location is being shared with the customer."
                                    : "Share your location so the customer can track you on the map."}
                                </p>
                              </div>

                              {isSharing ? (
                                <button
                                  onClick={
                                    stopLocationSharing
                                  }
                                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-3 font-semibold hover:bg-red-500"
                                >
                                  <Radio
                                    size={
                                      18
                                    }
                                  />
                                  Stop Location
                                </button>
                              ) : (
                                <button
                                  onClick={() =>
                                    startLocationSharing(
                                      booking._id
                                    )
                                  }
                                  className="inline-flex items-center justify-center gap-2 rounded-lg bg-cyan-600 px-4 py-3 font-semibold hover:bg-cyan-500"
                                >
                                  <Navigation
                                    size={
                                      18
                                    }
                                  />
                                  Start Live Location
                                </button>
                              )}
                            </div>
                          </div>
                        )}

                        {nextStatus && (
                          <div className="mt-6 border-t border-slate-800 pt-6">
                            <button
                              onClick={() =>
                                handleStatusUpdate(
                                  booking
                                )
                              }
                              disabled={
                                updatingId ===
                                booking._id
                              }
                              className="rounded-lg bg-emerald-600 px-5 py-3 font-semibold transition hover:bg-emerald-500 disabled:opacity-60"
                            >
                              {updatingId ===
                              booking._id
                                ? "Updating..."
                                : getButtonText(
                                    booking.status
                                  )}
                            </button>

                            <p className="mt-2 text-sm text-slate-500">
                              Next status:{" "}
                              {nextStatus}
                            </p>
                          </div>
                        )}

                        {booking.status ===
                          "Completed" && (
                          <div className="mt-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-emerald-400">
                            Service completed
                            successfully.
                          </div>
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            )}
        </div>

        <div className="mt-10">
          <h3 className="text-2xl font-bold">
            Customer Reviews
          </h3>

          {!loading &&
            reviews.length === 0 && (
              <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-slate-400">
                No customer reviews yet.
              </div>
            )}

          {!loading &&
            reviews.length > 0 && (
              <div className="mt-5 grid gap-5 lg:grid-cols-2">
                {reviews.map(
                  (review) => (
                    <div
                      key={review._id}
                      className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
                    >
                      <div className="flex items-center gap-1">
                        {[
                          1, 2, 3, 4, 5,
                        ].map(
                          (star) => (
                            <Star
                              key={
                                star
                              }
                              size={
                                20
                              }
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
                          "No written comment."}
                      </p>

                      <p className="mt-4 font-semibold">
                        {review.customer
                          ?.name ||
                          "Customer"}
                      </p>
                    </div>
                  )
                )}
              </div>
            )}
        </div>
      </main>
    </div>
  );
}
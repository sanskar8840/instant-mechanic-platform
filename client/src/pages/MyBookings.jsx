import { useEffect, useState } from "react";
import {
  Link,
  useSearchParams,
} from "react-router-dom";

import {
  CalendarDays,
  CarFront,
  Wrench,
  MapPin,
  IndianRupee,
  ArrowRight,
  Wifi,
} from "lucide-react";

import api from "../services/api";
import socket from "../services/socket";

export default function MyBookings() {
  const [searchParams] = useSearchParams();

  const filter =
    searchParams.get("filter") || "all";

  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [socketConnected, setSocketConnected] =
    useState(false);

  useEffect(() => {
    const loadBookings = async () => {
      try {
        setLoading(true);
        setError("");

        const response =
          await api.get("/bookings");

        setBookings(
          response.data.bookings || []
        );
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load your bookings"
        );
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  useEffect(() => {
    const handleConnect = () => {
      setSocketConnected(true);
    };

    const handleDisconnect = () => {
      setSocketConnected(false);
    };

    const handleStatusUpdate = (data) => {
      if (!data?.bookingId) {
        return;
      }

      setBookings((currentBookings) =>
        currentBookings.map((booking) =>
          booking._id === data.bookingId
            ? data.booking || {
                ...booking,
                status: data.status,
              }
            : booking
        )
      );

      console.log(
        "Realtime list update:",
        data.status
      );
    };

    socket.on("connect", handleConnect);

    socket.on(
      "disconnect",
      handleDisconnect
    );

    socket.on(
      "booking:status-updated",
      handleStatusUpdate
    );

    if (!socket.connected) {
      socket.connect();
    } else {
      setSocketConnected(true);
    }

    return () => {
      socket.off(
        "connect",
        handleConnect
      );

      socket.off(
        "disconnect",
        handleDisconnect
      );

      socket.off(
        "booking:status-updated",
        handleStatusUpdate
      );
    };
  }, []);

  useEffect(() => {
    if (!socket.connected) {
      return;
    }

    bookings.forEach((booking) => {
      socket.emit(
        "booking:join",
        booking._id
      );
    });

    return () => {
      bookings.forEach((booking) => {
        socket.emit(
          "booking:leave",
          booking._id
        );
      });
    };
  }, [bookings.length]);

  const getFilteredBookings = () => {
    if (filter === "active") {
      return bookings.filter(
        (booking) =>
          booking.status !== "Completed" &&
          booking.status !== "Cancelled"
      );
    }

    if (filter === "completed") {
      return bookings.filter(
        (booking) =>
          booking.status === "Completed"
      );
    }

    return bookings;
  };

  const filteredBookings =
    getFilteredBookings();

  const getPageTitle = () => {
    if (filter === "active") {
      return "Active Bookings";
    }

    if (filter === "completed") {
      return "Completed Services";
    }

    return "My Bookings";
  };

  const getPageDescription = () => {
    if (filter === "active") {
      return "Track your pending and ongoing mechanic requests.";
    }

    if (filter === "completed") {
      return "View all your successfully completed services.";
    }

    return "Track all your mechanic service requests.";
  };

  const getStatusStyle = (status) => {
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

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold">
              Instant Mechanic
            </h1>

            <p className="text-sm text-slate-400">
              {getPageTitle()}
            </p>
          </div>

          <Link
            to="/customer/dashboard"
            className="text-sm font-medium text-slate-300 hover:text-white"
          >
            Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-medium text-blue-400">
              Service History
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              {getPageTitle()}
            </h2>

            <p className="mt-2 text-slate-400">
              {getPageDescription()}
            </p>

            <div
              className={`mt-3 inline-flex items-center gap-2 rounded-full px-3 py-1 text-sm font-medium ${
                socketConnected
                  ? "bg-emerald-500/10 text-emerald-400"
                  : "bg-slate-800 text-slate-400"
              }`}
            >
              <Wifi size={15} />

              {socketConnected
                ? "Live Updates Connected"
                : "Connecting..."}
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/customer/bookings"
              className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
                filter === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-slate-900 text-slate-300 hover:bg-slate-800"
              }`}
            >
              All Bookings
            </Link>

            <Link
              to="/customer/bookings?filter=active"
              className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
                filter === "active"
                  ? "bg-amber-600 text-white"
                  : "bg-slate-900 text-slate-300 hover:bg-slate-800"
              }`}
            >
              Active
            </Link>

            <Link
              to="/customer/bookings?filter=completed"
              className={`rounded-lg px-4 py-3 text-sm font-semibold transition ${
                filter === "completed"
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-900 text-slate-300 hover:bg-slate-800"
              }`}
            >
              Completed
            </Link>

            <Link
              to="/customer/services"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-3 font-semibold transition hover:bg-blue-500"
            >
              <Wrench size={18} />
              Book New Service
            </Link>
          </div>
        </div>

        {loading && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
            Loading bookings...
          </div>
        )}

        {error && (
          <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-400">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          filteredBookings.length === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
              <CalendarDays
                size={42}
                className="mx-auto text-slate-500"
              />

              <h3 className="mt-4 text-xl font-bold">
                {filter === "active"
                  ? "No active bookings"
                  : filter === "completed"
                  ? "No completed services"
                  : "No bookings yet"}
              </h3>

              <p className="mt-2 text-slate-400">
                {filter === "active"
                  ? "You currently have no active mechanic requests."
                  : filter === "completed"
                  ? "Your completed services will appear here."
                  : "Choose a service and create your first mechanic booking."}
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          filteredBookings.length > 0 && (
            <div className="grid gap-6 lg:grid-cols-2">
              {filteredBookings.map(
                (booking) => (
                  <div
                    key={booking._id}
                    className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <p className="text-sm text-slate-500">
                          Booking ID
                        </p>

                        <h3 className="mt-1 font-bold">
                          {booking.bookingId}
                        </h3>
                      </div>

                      <span
                        className={`rounded-full px-3 py-1 text-sm font-semibold ${getStatusStyle(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <div className="mt-6 space-y-4">
                      <div className="flex items-start gap-3">
                        <Wrench
                          size={20}
                          className="mt-0.5 text-blue-400"
                        />

                        <div>
                          <p className="text-sm text-slate-500">
                            Service
                          </p>

                          <p className="font-semibold">
                            {booking.service?.name}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <CarFront
                          size={20}
                          className="mt-0.5 text-emerald-400"
                        />

                        <div>
                          <p className="text-sm text-slate-500">
                            Vehicle
                          </p>

                          <p className="font-semibold">
                            {booking.vehicle?.brand}{" "}
                            {booking.vehicle?.model}
                          </p>

                          <p className="text-sm text-slate-400">
                            {
                              booking.vehicle
                                ?.registrationNumber
                            }
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <MapPin
                          size={20}
                          className="mt-0.5 text-rose-400"
                        />

                        <div>
                          <p className="text-sm text-slate-500">
                            Location
                          </p>

                          <p className="font-semibold">
                            {booking.city}
                          </p>

                          <p className="text-sm text-slate-400">
                            {booking.address}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-start gap-3">
                        <CalendarDays
                          size={20}
                          className="mt-0.5 text-amber-400"
                        />

                        <div>
                          <p className="text-sm text-slate-500">
                            Scheduled
                          </p>

                          <p className="font-semibold">
                            {new Date(
                              booking.scheduledDate
                            ).toLocaleString("en-IN")}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-5">
                      <div className="flex items-center gap-1 text-lg font-bold">
                        <IndianRupee size={18} />
                        {booking.amount}
                      </div>

                      <Link
                        to={`/customer/bookings/${booking._id}`}
                        className="inline-flex items-center gap-2 font-semibold text-blue-400 hover:text-blue-300"
                      >
                        View Details
                        <ArrowRight size={17} />
                      </Link>
                    </div>
                  </div>
                )
              )}
            </div>
          )}
      </main>
    </div>
  );
}
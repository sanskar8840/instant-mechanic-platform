import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ClipboardList,
  Clock3,
  UserRoundCheck,
  CheckCircle2,
  CarFront,
  MapPin,
  Wrench,
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [mechanics, setMechanics] = useState([]);
  const [selectedMechanics, setSelectedMechanics] = useState({});
  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState("");
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [bookingResponse, mechanicResponse] =
        await Promise.all([
          api.get("/admin/bookings"),
          api.get("/admin/mechanics"),
        ]);

      setBookings(bookingResponse.data.bookings || []);
      setMechanics(mechanicResponse.data.mechanics || []);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load admin dashboard"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/admin/login");
  };

  const handleMechanicChange = (bookingId, mechanicId) => {
    setSelectedMechanics((current) => ({
      ...current,
      [bookingId]: mechanicId,
    }));
  };

  const handleAssignMechanic = async (bookingId) => {
    const mechanicId = selectedMechanics[bookingId];

    if (!mechanicId) {
      alert("Please select a mechanic first");
      return;
    }

    try {
      setAssigningId(bookingId);

      await api.patch(
        `/admin/bookings/${bookingId}/assign`,
        {
          mechanicId,
        }
      );

      await loadDashboard();

      alert("Mechanic assigned successfully");
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Unable to assign mechanic"
      );
    } finally {
      setAssigningId("");
    }
  };

  const totalBookings = bookings.length;

  const pendingBookings = bookings.filter(
    (booking) => booking.status === "Pending"
  ).length;

  const assignedBookings = bookings.filter(
    (booking) =>
      booking.status === "Assigned" ||
      booking.status === "Accepted" ||
      booking.status === "On The Way" ||
      booking.status === "Arrived" ||
      booking.status === "In Progress"
  ).length;

  const completedBookings = bookings.filter(
    (booking) => booking.status === "Completed"
  ).length;

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
              Admin Dashboard
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden text-right sm:block">
              <p className="text-sm font-semibold">
                {user?.name}
              </p>

              <p className="text-xs text-slate-400">
                Administrator
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
          <p className="font-medium text-purple-400">
            Operations Portal
          </p>

          <h2 className="mt-2 text-3xl font-bold">
            Booking Management
          </h2>

          <p className="mt-2 text-slate-400">
            View customer bookings and assign mechanics.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <ClipboardList className="text-blue-400" />

            <p className="mt-5 text-sm text-slate-400">
              Total Bookings
            </p>

            <h3 className="mt-2 text-3xl font-bold">
              {loading ? "..." : totalBookings}
            </h3>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <Clock3 className="text-amber-400" />

            <p className="mt-5 text-sm text-slate-400">
              Pending
            </p>

            <h3 className="mt-2 text-3xl font-bold">
              {loading ? "..." : pendingBookings}
            </h3>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <UserRoundCheck className="text-purple-400" />

            <p className="mt-5 text-sm text-slate-400">
              Active / Assigned
            </p>

            <h3 className="mt-2 text-3xl font-bold">
              {loading ? "..." : assignedBookings}
            </h3>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <CheckCircle2 className="text-emerald-400" />

            <p className="mt-5 text-sm text-slate-400">
              Completed
            </p>

            <h3 className="mt-2 text-3xl font-bold">
              {loading ? "..." : completedBookings}
            </h3>
          </div>
        </div>

        <div className="mt-8">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-2xl font-bold">
                Customer Bookings
              </h3>

              <p className="mt-1 text-sm text-slate-400">
                Available mechanics: {mechanics.length}
              </p>
            </div>
          </div>

          {loading && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
              Loading admin dashboard...
            </div>
          )}

          {error && (
            <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-400">
              {error}
            </div>
          )}

          {!loading && !error && bookings.length === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
              <ClipboardList
                size={42}
                className="mx-auto text-slate-500"
              />

              <h3 className="mt-4 text-xl font-bold">
                No bookings found
              </h3>
            </div>
          )}

          {!loading && !error && bookings.length > 0 && (
            <div className="space-y-5">
              {bookings.map((booking) => (
                <div
                  key={booking._id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
                >
                  <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-slate-500">
                        Booking ID
                      </p>

                      <h4 className="mt-1 text-lg font-bold">
                        {booking.bookingId}
                      </h4>

                      <span
                        className={`mt-3 inline-flex rounded-full px-3 py-1 text-sm font-semibold ${getStatusStyle(
                          booking.status
                        )}`}
                      >
                        {booking.status}
                      </span>
                    </div>

                    <div className="text-left lg:text-right">
                      <p className="text-sm text-slate-400">
                        Customer
                      </p>

                      <p className="font-semibold">
                        {booking.customer?.name}
                      </p>

                      <p className="text-sm text-slate-500">
                        {booking.customer?.email}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
                    <div className="flex gap-3">
                      <Wrench
                        size={20}
                        className="mt-1 shrink-0 text-blue-400"
                      />

                      <div>
                        <p className="text-xs text-slate-500">
                          Service
                        </p>

                        <p className="font-semibold">
                          {booking.service?.name}
                        </p>

                        <p className="text-sm text-slate-400">
                          ₹{booking.amount}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <CarFront
                        size={20}
                        className="mt-1 shrink-0 text-emerald-400"
                      />

                      <div>
                        <p className="text-xs text-slate-500">
                          Vehicle
                        </p>

                        <p className="font-semibold">
                          {booking.vehicle?.brand}{" "}
                          {booking.vehicle?.model}
                        </p>

                        <p className="text-sm text-slate-400">
                          {booking.vehicle?.registrationNumber}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <MapPin
                        size={20}
                        className="mt-1 shrink-0 text-rose-400"
                      />

                      <div>
                        <p className="text-xs text-slate-500">
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

                    <div>
                      <p className="text-xs text-slate-500">
                        Scheduled
                      </p>

                      <p className="font-semibold">
                        {new Date(
                          booking.scheduledDate
                        ).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>

                  <div className="mt-6 border-t border-slate-800 pt-6">
                    {booking.mechanic && (
                      <div className="mb-4 rounded-xl border border-purple-500/20 bg-purple-500/10 p-4">
                        <p className="text-sm text-purple-300">
                          Assigned Mechanic
                        </p>

                        <p className="mt-1 font-bold">
                          {booking.mechanic.name}
                        </p>

                        <p className="text-sm text-slate-400">
                          {booking.mechanic.email}
                        </p>
                      </div>
                    )}

                    {!["Completed", "Cancelled"].includes(
                      booking.status
                    ) && (
                      <div className="flex flex-col gap-3 md:flex-row">
                        <select
                          value={
                            selectedMechanics[booking._id] || ""
                          }
                          onChange={(e) =>
                            handleMechanicChange(
                              booking._id,
                              e.target.value
                            )
                          }
                          className="flex-1 rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-purple-500"
                        >
                          <option value="">
                            Select mechanic
                          </option>

                          {mechanics.map((mechanic) => (
                            <option
                              key={mechanic._id}
                              value={mechanic._id}
                            >
                              {mechanic.name} - {mechanic.email}
                            </option>
                          ))}
                        </select>

                        <button
                          onClick={() =>
                            handleAssignMechanic(booking._id)
                          }
                          disabled={
                            assigningId === booking._id
                          }
                          className="rounded-lg bg-purple-600 px-5 py-3 font-semibold transition hover:bg-purple-500 disabled:opacity-60"
                        >
                          {assigningId === booking._id
                            ? "Assigning..."
                            : booking.mechanic
                            ? "Reassign Mechanic"
                            : "Assign Mechanic"}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
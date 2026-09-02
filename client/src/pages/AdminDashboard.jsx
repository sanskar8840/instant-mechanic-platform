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
  TrendingUp,
  ArrowRight,
  WalletCards,
  UserPlus,
  Users,
} from "lucide-react";

import api from "../services/api";
import { useAuth } from "../context/AuthContext";

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [bookings, setBookings] = useState([]);
  const [mechanics, setMechanics] = useState([]);

  const [selectedMechanics, setSelectedMechanics] =
    useState({});

  const [loading, setLoading] = useState(true);
  const [assigningId, setAssigningId] = useState("");
  const [error, setError] = useState("");

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        bookingResponse,
        mechanicResponse,
      ] = await Promise.all([
        api.get("/admin/bookings"),
        api.get("/admin/mechanics"),
      ]);

      setBookings(
        bookingResponse.data.bookings || []
      );

      setMechanics(
        mechanicResponse.data.mechanics || []
      );
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

  const handleMechanicChange = (
    bookingId,
    mechanicId
  ) => {
    setSelectedMechanics((current) => ({
      ...current,
      [bookingId]: mechanicId,
    }));
  };

  const handleAssignMechanic = async (
    bookingId
  ) => {
    const mechanicId =
      selectedMechanics[bookingId];

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

      setSelectedMechanics((current) => {
        const updated = { ...current };

        delete updated[bookingId];

        return updated;
      });

      alert(
        "Mechanic assigned successfully"
      );
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Unable to assign mechanic"
      );
    } finally {
      setAssigningId("");
    }
  };

  const formatCurrency = (value) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 2,
    }).format(Number(value || 0));
  };

  const totalBookings = bookings.length;

  const pendingBookings = bookings.filter(
    (booking) =>
      booking.status === "Pending"
  ).length;

  const activeBookings = bookings.filter(
    (booking) =>
      booking.status === "Assigned" ||
      booking.status === "Accepted" ||
      booking.status === "On The Way" ||
      booking.status === "Arrived" ||
      booking.status === "In Progress"
  ).length;

  const completedBookings = bookings.filter(
    (booking) =>
      booking.status === "Completed"
  ).length;

  const unassignedBookings = bookings.filter(
    (booking) =>
      !booking.mechanic &&
      booking.status !== "Cancelled"
  );

  const assignedBookings = bookings.filter(
    (booking) =>
      Boolean(booking.mechanic)
  );

  const cancelledBookings = bookings.filter(
    (booking) =>
      booking.status === "Cancelled" &&
      !booking.mechanic
  );

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

  const renderBookingCard = (
    booking,
    allowAssignment = true
  ) => {
    return (
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
                {formatCurrency(
                  booking.amount
                )}
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
                {
                  booking.vehicle
                    ?.registrationNumber
                }
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

          {!booking.mechanic &&
            booking.status !== "Cancelled" && (
              <div className="mb-4 rounded-xl border border-amber-500/20 bg-amber-500/10 p-4">
                <p className="font-semibold text-amber-400">
                  Mechanic assignment required
                </p>

                <p className="mt-1 text-sm text-slate-400">
                  Select an available mechanic
                  for this booking.
                </p>
              </div>
            )}

          {allowAssignment &&
            ![
              "Completed",
              "Cancelled",
            ].includes(booking.status) && (
              <div className="flex flex-col gap-3 md:flex-row">
                <select
                  value={
                    selectedMechanics[
                      booking._id
                    ] || ""
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

                  {mechanics.map(
                    (mechanic) => (
                      <option
                        key={mechanic._id}
                        value={mechanic._id}
                      >
                        {mechanic.name} -{" "}
                        {mechanic.email}
                      </option>
                    )
                  )}
                </select>

                <button
                  onClick={() =>
                    handleAssignMechanic(
                      booking._id
                    )
                  }
                  disabled={
                    assigningId ===
                    booking._id
                  }
                  className="rounded-lg bg-purple-600 px-5 py-3 font-semibold transition hover:bg-purple-500 disabled:opacity-60"
                >
                  {assigningId ===
                  booking._id
                    ? "Assigning..."
                    : booking.mechanic
                    ? "Reassign Mechanic"
                    : "Assign Mechanic"}
                </button>
              </div>
            )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          {/* LOGO + BRAND */}

          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 shrink-0 place-items-center rounded-xl border border-slate-700 bg-slate-950 shadow-sm">
              <img
                src="/logo.svg"
                alt="Instant Mechanic Logo"
                className="h-10 w-10 object-contain"
              />
            </div>

            <div>
              <h1 className="text-lg font-bold leading-tight sm:text-xl">
                Instant{" "}
                <span className="text-blue-400">
                  Mechanic
                </span>
              </h1>

              <p className="mt-0.5 text-xs text-slate-400 sm:text-sm">
                Admin Dashboard
              </p>
            </div>
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
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <p className="font-medium text-purple-400">
              Operations Portal
            </p>

            <h2 className="mt-2 text-3xl font-bold">
              Admin Control Center
            </h2>

            <p className="mt-2 max-w-2xl text-slate-400">
              Manage customer bookings,
              mechanic assignments and
              roadside assistance operations.
            </p>
          </div>

          <button
            onClick={() =>
              navigate("/admin/finance")
            }
            className="group inline-flex items-center justify-center gap-3 rounded-xl bg-emerald-600 px-5 py-3 font-semibold transition hover:bg-emerald-500"
          >
            <TrendingUp size={20} />

            Financial Analytics

            <ArrowRight
              size={18}
              className="transition-transform group-hover:translate-x-1"
            />
          </button>
        </div>

        <div className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <ClipboardList className="text-blue-400" />

            <p className="mt-5 text-sm text-slate-400">
              Total Bookings
            </p>

            <h3 className="mt-2 text-3xl font-bold">
              {loading
                ? "..."
                : totalBookings}
            </h3>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <Clock3 className="text-amber-400" />

            <p className="mt-5 text-sm text-slate-400">
              Pending
            </p>

            <h3 className="mt-2 text-3xl font-bold">
              {loading
                ? "..."
                : pendingBookings}
            </h3>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <UserRoundCheck className="text-purple-400" />

            <p className="mt-5 text-sm text-slate-400">
              Active / Assigned
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
              Completed
            </p>

            <h3 className="mt-2 text-3xl font-bold">
              {loading
                ? "..."
                : completedBookings}
            </h3>
          </div>
        </div>

        <div
          onClick={() =>
            navigate("/admin/finance")
          }
          className="group mt-8 cursor-pointer rounded-2xl border border-emerald-500/20 bg-gradient-to-r from-emerald-500/10 to-slate-900 p-6 transition hover:border-emerald-500/40"
        >
          <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
            <div className="flex items-start gap-4">
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-emerald-500/10 text-emerald-400">
                <WalletCards size={24} />
              </div>

              <div>
                <h3 className="text-xl font-bold">
                  Financial Analytics
                </h3>

                <p className="mt-1 text-sm text-slate-400">
                  Revenue, profit, mechanic
                  earnings and payment
                  settlements.
                </p>
              </div>
            </div>

            <div className="inline-flex items-center gap-2 font-semibold text-emerald-400">
              Open Finance Center

              <ArrowRight size={18} />
            </div>
          </div>
        </div>

        {loading && (
          <div className="mt-10 rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
            Loading admin dashboard...
          </div>
        )}

        {error && (
          <div className="mt-10 rounded-2xl border border-red-500/30 bg-red-500/10 p-5 text-red-400">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <section className="mt-12">
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <UserPlus className="text-amber-400" />

                    <h3 className="text-2xl font-bold">
                      Unassigned Bookings
                    </h3>
                  </div>

                  <p className="mt-2 text-sm text-slate-400">
                    Customer bookings that are
                    waiting for a mechanic
                    assignment.
                  </p>
                </div>

                <span className="w-fit rounded-full bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-400">
                  {unassignedBookings.length}{" "}
                  Unassigned
                </span>
              </div>

              {unassignedBookings.length ===
              0 ? (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-8 text-center">
                  <CheckCircle2
                    size={36}
                    className="mx-auto text-emerald-400"
                  />

                  <h4 className="mt-3 font-bold">
                    All bookings assigned
                  </h4>

                  <p className="mt-1 text-sm text-slate-400">
                    There are currently no
                    bookings waiting for a
                    mechanic assignment.
                  </p>
                </div>
              ) : (
                <div className="space-y-5">
                  {unassignedBookings.map(
                    (booking) =>
                      renderBookingCard(
                        booking,
                        true
                      )
                  )}
                </div>
              )}
            </section>

            <section className="mt-12 border-t border-slate-800 pt-10">
              <div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <Users className="text-purple-400" />

                    <h3 className="text-2xl font-bold">
                      Assigned Service Requests
                    </h3>
                  </div>

                  <p className="mt-2 text-sm text-slate-400">
                    Service requests that
                    already have an assigned
                    mechanic.
                  </p>
                </div>

                <span className="w-fit rounded-full bg-purple-500/10 px-4 py-2 text-sm font-semibold text-purple-400">
                  {assignedBookings.length}{" "}
                  Assigned
                </span>
              </div>

              {assignedBookings.length ===
              0 ? (
                <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8 text-center text-slate-400">
                  No assigned service requests
                  found.
                </div>
              ) : (
                <div className="space-y-5">
                  {assignedBookings.map(
                    (booking) =>
                      renderBookingCard(
                        booking,
                        true
                      )
                  )}
                </div>
              )}
            </section>

            {cancelledBookings.length > 0 && (
              <section className="mt-12 border-t border-slate-800 pt-10">
                <h3 className="text-xl font-bold text-slate-400">
                  Cancelled Bookings
                </h3>

                <p className="mt-2 text-sm text-slate-500">
                  Customer bookings that were
                  cancelled before mechanic
                  assignment.
                </p>

                <div className="mt-5 space-y-5">
                  {cancelledBookings.map(
                    (booking) =>
                      renderBookingCard(
                        booking,
                        false
                      )
                  )}
                </div>
              </section>
            )}
          </>
        )}
      </main>
    </div>
  );
}
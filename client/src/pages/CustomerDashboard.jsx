import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  CarFront,
  Plus,
  CalendarDays,
  CheckCircle2,
  Wrench,
} from "lucide-react";

import { useAuth } from "../context/AuthContext";
import api from "../services/api";

export default function CustomerDashboard() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const [vehicleCount, setVehicleCount] = useState(0);
  const [activeBookingCount, setActiveBookingCount] = useState(0);
  const [completedBookingCount, setCompletedBookingCount] = useState(0);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboard = async () => {
      try {
        const [vehicleResponse, bookingResponse] =
          await Promise.all([
            api.get("/vehicles"),
            api.get("/bookings"),
          ]);

        setVehicleCount(vehicleResponse.data.count || 0);

        const bookings =
          bookingResponse.data.bookings || [];

        const activeBookings = bookings.filter(
          (booking) =>
            booking.status !== "Completed" &&
            booking.status !== "Cancelled"
        );

        const completedBookings = bookings.filter(
          (booking) =>
            booking.status === "Completed"
        );

        setActiveBookingCount(activeBookings.length);

        setCompletedBookingCount(
          completedBookings.length
        );
      } catch (error) {
        console.error(
          "Dashboard load failed:",
          error
        );
      } finally {
        setLoading(false);
      }
    };

    loadDashboard();
  }, []);

  const handleLogout = () => {
    logout();
    navigate("/customer/login");
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
              Customer Dashboard
            </p>
          </div>

          <button
            onClick={handleLogout}
            className="rounded-lg bg-red-600 px-4 py-2 text-sm font-semibold transition hover:bg-red-500"
          >
            Logout
          </button>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-10">
        <div className="mb-8 flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="mb-2 font-medium text-blue-400">
              Customer Portal
            </p>

            <h2 className="text-3xl font-bold">
              Welcome, {user?.name}
            </h2>

            <p className="mt-2 text-slate-400">
              Manage your vehicles, bookings and live service tracking.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Link
              to="/customer/services"
              className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 font-semibold transition hover:bg-emerald-500"
            >
              <Wrench size={18} />
              Choose Service
            </Link>

            <Link
              to="/customer/bookings"
              className="inline-flex items-center gap-2 rounded-lg bg-amber-600 px-4 py-3 font-semibold transition hover:bg-amber-500"
            >
              <CalendarDays size={18} />
              My Bookings
            </Link>

            <Link
              to="/customer/vehicles"
              className="inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 px-4 py-3 font-semibold transition hover:bg-slate-800"
            >
              <CarFront size={18} />
              My Vehicles
            </Link>

            <Link
              to="/customer/vehicles/add"
              className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold transition hover:bg-blue-500"
            >
              <Plus size={18} />
              Add Vehicle
            </Link>
          </div>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          <Link
            to="/customer/vehicles"
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-blue-500/40"
          >
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-blue-500/10 text-blue-400">
              <CarFront size={24} />
            </div>

            <p className="text-sm text-slate-400">
              My Vehicles
            </p>

            <h3 className="mt-3 text-3xl font-bold">
              {loading ? "..." : vehicleCount}
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Registered vehicles in your account.
            </p>
          </Link>

          <Link
            to="/customer/bookings?filter=active"
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-amber-500/40"
          >
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-amber-500/10 text-amber-400">
              <CalendarDays size={24} />
            </div>

            <p className="text-sm text-slate-400">
              Active Bookings
            </p>

            <h3 className="mt-3 text-3xl font-bold">
              {loading
                ? "..."
                : activeBookingCount}
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Pending or ongoing mechanic requests.
            </p>
          </Link>

          <Link
            to="/customer/bookings?filter=completed"
            className="rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-emerald-500/40"
          >
            <div className="mb-5 grid h-12 w-12 place-items-center rounded-xl bg-emerald-500/10 text-emerald-400">
              <CheckCircle2 size={24} />
            </div>

            <p className="text-sm text-slate-400">
              Completed Services
            </p>

            <h3 className="mt-3 text-3xl font-bold">
              {loading
                ? "..."
                : completedBookingCount}
            </h3>

            <p className="mt-2 text-sm text-slate-500">
              Successfully completed mechanic services.
            </p>
          </Link>
        </div>

        <div className="mt-8 rounded-2xl border border-slate-800 bg-slate-900 p-6">
          <h3 className="text-xl font-bold">
            Need vehicle assistance?
          </h3>

          {vehicleCount === 0 && !loading ? (
            <>
              <p className="mt-2 text-slate-400">
                Add your vehicle first. After that
                you can choose a service and book a
                mechanic.
              </p>

              <Link
                to="/customer/vehicles/add"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold transition hover:bg-blue-500"
              >
                <Plus size={18} />
                Add Your First Vehicle
              </Link>
            </>
          ) : (
            <>
              <p className="mt-2 text-slate-400">
                Select a service for your vehicle and
                request a mechanic.
              </p>

              <Link
                to="/customer/services"
                className="mt-5 inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-3 font-semibold transition hover:bg-emerald-500"
              >
                <Wrench size={18} />
                Choose a Service
              </Link>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
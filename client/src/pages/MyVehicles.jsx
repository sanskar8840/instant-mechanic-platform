import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { CarFront, Plus, Trash2 } from "lucide-react";
import api from "../services/api";

export default function MyVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadVehicles = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get("/vehicles");

      setVehicles(response.data.vehicles);
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to load vehicles"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadVehicles();
  }, []);

  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this vehicle?"
    );

    if (!confirmed) {
      return;
    }

    try {
      await api.delete(`/vehicles/${id}`);

      setVehicles((currentVehicles) =>
        currentVehicles.filter(
          (vehicle) => vehicle._id !== id
        )
      );
    } catch (err) {
      alert(
        err.response?.data?.message ||
          "Unable to delete vehicle"
      );
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
              My Vehicles
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
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="mb-2 font-medium text-blue-400">
              Customer Portal
            </p>

            <h2 className="text-3xl font-bold">
              My Vehicles
            </h2>

            <p className="mt-2 text-slate-400">
              Manage vehicles linked to your account.
            </p>
          </div>

          <Link
            to="/customer/vehicles/add"
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold transition hover:bg-blue-500"
          >
            <Plus size={18} />
            Add Vehicle
          </Link>
        </div>

        {loading && (
          <p className="text-slate-400">
            Loading vehicles...
          </p>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          vehicles.length === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
              <CarFront
                size={42}
                className="mx-auto text-slate-500"
              />

              <h3 className="mt-4 text-xl font-bold">
                No vehicles added
              </h3>

              <p className="mt-2 text-slate-400">
                Add your first vehicle to book a
                mechanic service.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          vehicles.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {vehicles.map((vehicle) => (
                <article
                  key={vehicle._id}
                  className="rounded-2xl border border-slate-800 bg-slate-900 p-6"
                >
                  <div className="flex items-start justify-between">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-blue-600/20 text-blue-400">
                      <CarFront size={24} />
                    </div>

                    <button
                      onClick={() =>
                        handleDelete(vehicle._id)
                      }
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-red-500/10 hover:text-red-400"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>

                  <h3 className="mt-5 text-xl font-bold">
                    {vehicle.brand} {vehicle.model}
                  </h3>

                  <p className="mt-1 font-medium text-blue-400">
                    {vehicle.registrationNumber}
                  </p>

                  <div className="mt-5 space-y-2 text-sm text-slate-400">
                    <p>
                      Type:{" "}
                      <span className="capitalize text-white">
                        {vehicle.vehicleType}
                      </span>
                    </p>

                    <p>
                      Fuel:{" "}
                      <span className="text-white">
                        {vehicle.fuelType}
                      </span>
                    </p>

                    <p>
                      Year:{" "}
                      <span className="text-white">
                        {vehicle.year}
                      </span>
                    </p>

                    <p>
                      Color:{" "}
                      <span className="text-white">
                        {vehicle.color || "Not specified"}
                      </span>
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
      </main>
    </div>
  );
}
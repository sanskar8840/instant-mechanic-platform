import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";

export default function BookService() {
  const { serviceId } = useParams();
  const navigate = useNavigate();

  const [service, setService] = useState(null);
  const [vehicles, setVehicles] = useState([]);

  const [formData, setFormData] = useState({
    vehicleId: "",
    problemDescription: "",
    address: "",
    city: "",
    pincode: "",
    scheduledDate: "",
  });

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError("");

        const [serviceResponse, vehicleResponse] =
          await Promise.all([
            api.get(`/services/${serviceId}`),
            api.get("/vehicles"),
          ]);

        setService(serviceResponse.data.service);
        setVehicles(vehicleResponse.data.vehicles || []);

        if (vehicleResponse.data.vehicles?.length > 0) {
          setFormData((current) => ({
            ...current,
            vehicleId:
              vehicleResponse.data.vehicles[0]._id,
          }));
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

    loadData();
  }, [serviceId]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setSubmitting(true);
      setError("");

      const response = await api.post("/bookings", {
        vehicleId: formData.vehicleId,
        serviceId,
        problemDescription:
          formData.problemDescription,
        address: formData.address,
        city: formData.city,
        pincode: formData.pincode,
        scheduledDate: formData.scheduledDate,
      });

      navigate(
        `/customer/bookings/${response.data.booking._id}`
      );
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Unable to create booking"
      );
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
        Loading...
      </div>
    );
  }

  if (error && !service) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center px-6">
        <div className="max-w-md rounded-2xl border border-red-500/30 bg-red-500/10 p-6 text-red-400">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold">
              Instant Mechanic
            </h1>

            <p className="text-sm text-slate-400">
              Book Service
            </p>
          </div>

          <Link
            to="/customer/services"
            className="text-sm font-medium text-slate-300 hover:text-white"
          >
            Back to Services
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-[1fr_1.4fr]">
          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <p className="text-sm font-medium text-blue-400">
              Selected Service
            </p>

            <h2 className="mt-3 text-2xl font-bold">
              {service?.name}
            </h2>

            <p className="mt-3 text-slate-400">
              {service?.description}
            </p>

            <div className="mt-6 border-t border-slate-800 pt-5">
              <p className="text-sm text-slate-400">
                Starting Price
              </p>

              <p className="mt-1 text-3xl font-bold">
                ₹{service?.basePrice}
              </p>
            </div>

            <div className="mt-5">
              <p className="text-sm text-slate-400">
                Estimated Time
              </p>

              <p className="mt-1 font-semibold">
                {service?.estimatedMinutes} minutes
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900 p-8">
            <h2 className="text-2xl font-bold">
              Booking Details
            </h2>

            <p className="mt-2 text-slate-400">
              Tell us where and when you need assistance.
            </p>

            {error && (
              <div className="mt-5 rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
                {error}
              </div>
            )}

            {vehicles.length === 0 ? (
              <div className="mt-6 rounded-xl border border-amber-500/30 bg-amber-500/10 p-5">
                <p className="text-amber-300">
                  You need to add a vehicle before booking
                  a service.
                </p>

                <Link
                  to="/customer/vehicles/add"
                  className="mt-4 inline-block rounded-lg bg-blue-600 px-4 py-2 font-semibold hover:bg-blue-500"
                >
                  Add Vehicle
                </Link>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="mt-6 space-y-5"
              >
                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Select Vehicle
                  </label>

                  <select
                    name="vehicleId"
                    value={formData.vehicleId}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                  >
                    {vehicles.map((vehicle) => (
                      <option
                        key={vehicle._id}
                        value={vehicle._id}
                      >
                        {vehicle.brand} {vehicle.model} -{" "}
                        {vehicle.registrationNumber}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Problem Description
                  </label>

                  <textarea
                    name="problemDescription"
                    value={
                      formData.problemDescription
                    }
                    onChange={handleChange}
                    required
                    rows="4"
                    placeholder="Describe your vehicle issue..."
                    className="w-full resize-none rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Address
                  </label>

                  <input
                    type="text"
                    name="address"
                    value={formData.address}
                    onChange={handleChange}
                    required
                    placeholder="House / street / landmark"
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                  />
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      City
                    </label>

                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      required
                      placeholder="Noida"
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="mb-2 block text-sm font-medium text-slate-300">
                      Pincode
                    </label>

                    <input
                      type="text"
                      name="pincode"
                      value={formData.pincode}
                      onChange={handleChange}
                      required
                      placeholder="201301"
                      className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                <div>
                  <label className="mb-2 block text-sm font-medium text-slate-300">
                    Preferred Date & Time
                  </label>

                  <input
                    type="datetime-local"
                    name="scheduledDate"
                    value={formData.scheduledDate}
                    onChange={handleChange}
                    required
                    className="w-full rounded-lg border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none focus:border-blue-500"
                  />
                </div>

                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full rounded-lg bg-blue-600 px-4 py-3 font-semibold text-white transition hover:bg-blue-500 disabled:opacity-60"
                >
                  {submitting
                    ? "Creating Booking..."
                    : `Confirm Booking - ₹${service?.basePrice}`}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
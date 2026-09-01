import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Wrench,
  Clock3,
  IndianRupee,
  ArrowRight,
} from "lucide-react";

import api from "../services/api";

export default function Services() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const loadServices = async () => {
      try {
        setLoading(true);
        setError("");

        const response = await api.get("/services");

        setServices(response.data.services || []);
      } catch (err) {
        setError(
          err.response?.data?.message ||
            "Unable to load services"
        );
      } finally {
        setLoading(false);
      }
    };

    loadServices();
  }, []);

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      <header className="border-b border-slate-800 bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div>
            <h1 className="text-xl font-bold">
              Instant Mechanic
            </h1>

            <p className="text-sm text-slate-400">
              Available Services
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
        <div className="mb-8">
          <p className="mb-2 font-medium text-blue-400">
            Customer Portal
          </p>

          <h2 className="text-3xl font-bold">
            Choose a Service
          </h2>

          <p className="mt-2 text-slate-400">
            Select the service your vehicle needs.
          </p>
        </div>

        {loading && (
          <p className="text-slate-400">
            Loading services...
          </p>
        )}

        {error && (
          <div className="rounded-xl border border-red-500/30 bg-red-500/10 p-4 text-red-400">
            {error}
          </div>
        )}

        {!loading &&
          !error &&
          services.length === 0 && (
            <div className="rounded-2xl border border-slate-800 bg-slate-900 p-10 text-center">
              <Wrench
                size={42}
                className="mx-auto text-slate-500"
              />

              <h3 className="mt-4 text-xl font-bold">
                No services available
              </h3>

              <p className="mt-2 text-slate-400">
                Please check again later.
              </p>
            </div>
          )}

        {!loading &&
          !error &&
          services.length > 0 && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {services.map((service) => (
                <article
                  key={service._id}
                  className="flex flex-col rounded-2xl border border-slate-800 bg-slate-900 p-6 transition hover:-translate-y-1 hover:border-blue-500/40"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="grid h-12 w-12 place-items-center rounded-xl bg-blue-500/10 text-blue-400">
                      <Wrench size={24} />
                    </div>

                    <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300">
                      {service.category}
                    </span>
                  </div>

                  <h3 className="mt-5 text-xl font-bold">
                    {service.name}
                  </h3>

                  <p className="mt-2 flex-1 text-sm leading-6 text-slate-400">
                    {service.description}
                  </p>

                  <div className="mt-6 flex items-center justify-between border-t border-slate-800 pt-5">
                    <div>
                      <div className="flex items-center gap-1 text-lg font-bold">
                        <IndianRupee size={17} />
                        {service.basePrice}
                      </div>

                      <p className="text-xs text-slate-500">
                        Starting price
                      </p>
                    </div>

                    <div className="text-right">
                      <div className="flex items-center gap-1 font-semibold">
                        <Clock3 size={16} />
                        {service.estimatedMinutes} min
                      </div>

                      <p className="text-xs text-slate-500">
                        Estimated time
                      </p>
                    </div>
                  </div>

                  <Link
                    to={`/customer/book-service/${service._id}`}
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-3 font-semibold transition hover:bg-blue-500"
                  >
                    Book Service
                    <ArrowRight size={17} />
                  </Link>
                </article>
              ))}
            </div>
          )}
      </main>
    </div>
  );
}